import { Request, Response } from 'express';
import { supabaseAdmin } from '../config';
import { sendSuccess, sendCreated, sendError, sendPaginated, parsePaginationParams, getOffset } from '../utils/response';
import { validate, createIssueSchema, updateIssueStatusSchema, assignIssueSchema, mergeIssuesSchema } from '../utils/validators';
import { AuditService, NotificationService, DuplicateMergeService } from '../services';
import { ApiError } from '../middleware';

/**
 * Issues Controller
 * Handles all issue-related operations
 */
export class IssuesController {
  /**
   * Create a new issue
   * POST /api/issues
   */
  static async create(req: Request, res: Response): Promise<void> {
    const user = req.user!;

    // Validate input
    const data = validate(createIssueSchema, req.body);

    // Create issue
    const issueData = {
      ...data,
      reported_by: user.id,
      status: 'pending',
      hostel_name: data.hostel_name || user.hostel_name,
      room_number: data.room_number || user.room_number,
    };

    const { data: issue, error } = await supabaseAdmin
      .from('issues')
      .insert(issueData)
      .select('*, reporter:users!reported_by(full_name, email)')
      .single();

    if (error) {
      throw new ApiError(`Failed to create issue: ${error.message}`, 500);
    }

    // Create audit log
    await AuditService.logIssueCreate(user, issue.id, issueData, req);

    // Notify caretakers about new issue (high/urgent priority only)
    if (data.priority === 'high' || data.priority === 'urgent') {
      const { data: caretakers } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('role', 'caretaker')
        .eq('approval_status', 'approved');

      if (caretakers && caretakers.length > 0) {
        await NotificationService.createBulk(
          caretakers.map((c) => c.id),
          {
            title: `${data.priority === 'urgent' ? '🚨 URGENT' : '⚠️ High Priority'} Issue Reported`,
            message: `New ${data.category} issue: ${data.title}`,
            type: 'issue',
            referenceId: issue.id,
            referenceType: 'issue',
          }
        );
      }
    }

    sendCreated(res, 'Issue created successfully', issue);
  }

  /**
   * Get current user's issues
   * GET /api/issues/my
   */
  static async getMyIssues(req: Request, res: Response): Promise<void> {
    const user = req.user!;
    const pagination = parsePaginationParams(req.query as Record<string, unknown>);
    const offset = getOffset(pagination.page, pagination.limit);

    // Build query
    let query = supabaseAdmin
      .from('issues')
      .select('*, reporter:users!reported_by(full_name, email), assignee:users!assigned_to(full_name, email)', {
        count: 'exact',
      })
      .eq('reported_by', user.id);

    // Apply filters
    if (req.query.status) {
      query = query.eq('status', req.query.status as string);
    }
    if (req.query.category) {
      query = query.eq('category', req.query.category as string);
    }
    if (req.query.priority) {
      query = query.eq('priority', req.query.priority as string);
    }

    // Apply sorting and pagination
    query = query
      .order(pagination.sortBy || 'created_at', { ascending: pagination.sortOrder === 'asc' })
      .range(offset, offset + pagination.limit - 1);

    const { data: issues, error, count } = await query;

    if (error) {
      throw new ApiError(`Failed to fetch issues: ${error.message}`, 500);
    }

    sendPaginated(res, 'Issues retrieved successfully', issues || [], pagination, count || 0);
  }

  /**
   * Get all issues (staff only)
   * GET /api/issues
   */
  static async getAllIssues(req: Request, res: Response): Promise<void> {
    const pagination = parsePaginationParams(req.query as Record<string, unknown>);
    const offset = getOffset(pagination.page, pagination.limit);

    // Build query
    let query = supabaseAdmin
      .from('issues')
      .select('*, reporter:users!reported_by(full_name, email, hostel_name, room_number), assignee:users!assigned_to(full_name, email)', {
        count: 'exact',
      });

    // Apply filters
    if (req.query.status) {
      query = query.eq('status', req.query.status as string);
    }
    if (req.query.category) {
      query = query.eq('category', req.query.category as string);
    }
    if (req.query.priority) {
      query = query.eq('priority', req.query.priority as string);
    }
    if (req.query.hostel_name) {
      query = query.eq('hostel_name', req.query.hostel_name as string);
    }
    if (req.query.assigned_to) {
      if (req.query.assigned_to === 'unassigned') {
        query = query.is('assigned_to', null);
      } else {
        query = query.eq('assigned_to', req.query.assigned_to as string);
      }
    }
    if (req.query.search) {
      query = query.or(`title.ilike.%${req.query.search}%,description.ilike.%${req.query.search}%`);
    }

    // Apply sorting and pagination
    query = query
      .order(pagination.sortBy || 'created_at', { ascending: pagination.sortOrder === 'asc' })
      .range(offset, offset + pagination.limit - 1);

    const { data: issues, error, count } = await query;

    if (error) {
      throw new ApiError(`Failed to fetch issues: ${error.message}`, 500);
    }

    sendPaginated(res, 'Issues retrieved successfully', issues || [], pagination, count || 0);
  }

  /**
   * Get a single issue by ID
   * GET /api/issues/:id
   */
  static async getById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const user = req.user!;

    const { data: issue, error } = await supabaseAdmin
      .from('issues')
      .select('*, reporter:users!reported_by(full_name, email, hostel_name, room_number, phone_number), assignee:users!assigned_to(full_name, email, phone_number)')
      .eq('id', id)
      .single();

    if (error || !issue) {
      sendError(res, 'Issue not found', 404);
      return;
    }

    // Check access: user can view their own issues, staff can view all
    if (user.role === 'student' && issue.reported_by !== user.id) {
      sendError(res, 'Access denied', 403);
      return;
    }

    sendSuccess(res, 'Issue retrieved successfully', issue);
  }

  /**
   * Assign an issue to a caretaker
   * PATCH /api/issues/:id/assign
   */
  static async assign(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const user = req.user!;
    const data = validate(assignIssueSchema, req.body);

    // Fetch current issue
    const { data: issue, error: fetchError } = await supabaseAdmin
      .from('issues')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !issue) {
      sendError(res, 'Issue not found', 404);
      return;
    }

    // Verify assignee is a caretaker
    const { data: assignee, error: assigneeError } = await supabaseAdmin
      .from('users')
      .select('id, role, full_name')
      .eq('id', data.assigned_to)
      .single();

    if (assigneeError || !assignee) {
      sendError(res, 'Assignee not found', 404);
      return;
    }

    if (assignee.role !== 'caretaker' && assignee.role !== 'admin') {
      sendError(res, 'Can only assign to caretakers or admins', 400);
      return;
    }

    // Update issue
    const { data: updatedIssue, error: updateError } = await supabaseAdmin
      .from('issues')
      .update({
        assigned_to: data.assigned_to,
        status: issue.status === 'pending' ? 'in_progress' : issue.status,
        notes: data.notes ? `${issue.notes || ''}\n\n[Assignment - ${new Date().toISOString()}]\n${data.notes}` : issue.notes,
      })
      .eq('id', id)
      .select('*, reporter:users!reported_by(full_name, email), assignee:users!assigned_to(full_name, email)')
      .single();

    if (updateError) {
      throw new ApiError(`Failed to assign issue: ${updateError.message}`, 500);
    }

    // Create audit log
    await AuditService.logIssueAssign(user, id, issue.assigned_to, data.assigned_to, req);

    // Notify assignee
    await NotificationService.notifyIssueAssignment(data.assigned_to, id, issue.title);

    // Notify reporter about assignment
    if (issue.reported_by !== user.id) {
      await NotificationService.create({
        userId: issue.reported_by,
        title: 'Issue Assigned',
        message: `Your issue "${issue.title}" has been assigned to ${assignee.full_name}`,
        type: 'issue',
        referenceId: id,
        referenceType: 'issue',
      });
    }

    sendSuccess(res, 'Issue assigned successfully', updatedIssue);
  }

  /**
   * Update issue status
   * PATCH /api/issues/:id/status
   */
  static async updateStatus(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const user = req.user!;
    const data = validate(updateIssueStatusSchema, req.body);

    // Fetch current issue
    const { data: issue, error: fetchError } = await supabaseAdmin
      .from('issues')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !issue) {
      sendError(res, 'Issue not found', 404);
      return;
    }

    // Build update data
    const updateData: Record<string, unknown> = {
      status: data.status,
    };

    if (data.notes) {
      updateData.notes = `${issue.notes || ''}\n\n[Status Update - ${new Date().toISOString()}]\n${data.notes}`;
    }

    if (data.status === 'resolved' || data.status === 'closed') {
      updateData.resolved_at = new Date().toISOString();
    }

    // Update issue
    const { data: updatedIssue, error: updateError } = await supabaseAdmin
      .from('issues')
      .update(updateData)
      .eq('id', id)
      .select('*, reporter:users!reported_by(full_name, email), assignee:users!assigned_to(full_name, email)')
      .single();

    if (updateError) {
      throw new ApiError(`Failed to update issue: ${updateError.message}`, 500);
    }

    // Create audit log
    await AuditService.logIssueStatusUpdate(user, id, issue.status, data.status, data.notes, req);

    // Notify reporter
    if (issue.reported_by !== user.id) {
      await NotificationService.notifyIssueStatusChange(
        issue.reported_by,
        id,
        issue.title,
        data.status
      );
    }

    sendSuccess(res, 'Issue status updated successfully', updatedIssue);
  }

  /**
   * Merge duplicate issues
   * POST /api/issues/merge
   */
  static async merge(req: Request, res: Response): Promise<void> {
    const user = req.user!;
    const data = validate(mergeIssuesSchema, req.body);

    const result = await DuplicateMergeService.mergeIssues(
      user,
      data.master_issue_id,
      data.duplicate_issue_ids,
      data.merge_notes,
      req
    );

    sendSuccess(res, `Successfully merged ${result.mergedCount} issue(s)`, result);
  }

  /**
   * Find potential duplicate issues
   * GET /api/issues/:id/duplicates
   */
  static async findDuplicates(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const limit = parseInt(req.query.limit as string) || 5;

    const duplicates = await DuplicateMergeService.findPotentialDuplicates(id, { limit });

    sendSuccess(res, 'Potential duplicates retrieved', duplicates);
  }
}

export default IssuesController;
