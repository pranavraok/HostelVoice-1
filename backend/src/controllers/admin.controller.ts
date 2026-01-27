import { Request, Response } from 'express';
import { supabaseAdmin } from '../config';
import { sendSuccess, sendError, sendPaginated, parsePaginationParams, getOffset } from '../utils/response';
import { validate, approveUserSchema, rejectUserSchema } from '../utils/validators';
import { AuditService, NotificationService } from '../services';
import { ApiError } from '../middleware';

/**
 * Admin Controller
 * Handles admin-specific operations like user approval
 */
export class AdminController {
  /**
   * Get pending user approvals
   * GET /api/admin/pending-users
   */
  static async getPendingUsers(req: Request, res: Response): Promise<void> {
    const pagination = parsePaginationParams(req.query as Record<string, unknown>);
    const offset = getOffset(pagination.page, pagination.limit);

    let query = supabaseAdmin
      .from('users')
      .select('*', { count: 'exact' })
      .eq('approval_status', 'pending');

    // Filter by role if specified
    if (req.query.role) {
      query = query.eq('role', req.query.role as string);
    }

    // Apply sorting and pagination
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + pagination.limit - 1);

    const { data: users, error, count } = await query;

    if (error) {
      throw new ApiError(`Failed to fetch pending users: ${error.message}`, 500);
    }

    sendPaginated(res, 'Pending users retrieved', users || [], pagination, count || 0);
  }

  /**
   * Approve a user
   * PATCH /api/admin/approve-user
   */
  static async approveUser(req: Request, res: Response): Promise<void> {
    const admin = req.user!;
    const data = validate(approveUserSchema, req.body);

    // Fetch user
    const { data: user, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', data.user_id)
      .single();

    if (fetchError || !user) {
      sendError(res, 'User not found', 404);
      return;
    }

    if (user.approval_status === 'approved') {
      sendError(res, 'User is already approved', 400);
      return;
    }

    // Approve user
    const { data: updatedUser, error } = await supabaseAdmin
      .from('users')
      .update({
        approval_status: 'approved',
        approved_by: admin.id,
        approval_date: new Date().toISOString(),
        rejection_reason: null,
      })
      .eq('id', data.user_id)
      .select('*')
      .single();

    if (error) {
      throw new ApiError(`Failed to approve user: ${error.message}`, 500);
    }

    // Create audit log
    await AuditService.logUserApproval(admin, data.user_id, true, undefined, req);

    // Notify user
    await NotificationService.notifyAccountApproved(data.user_id);

    sendSuccess(res, 'User approved successfully', updatedUser);
  }

  /**
   * Reject a user
   * PATCH /api/admin/reject-user
   */
  static async rejectUser(req: Request, res: Response): Promise<void> {
    const admin = req.user!;
    const data = validate(rejectUserSchema, req.body);

    // Fetch user
    const { data: user, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', data.user_id)
      .single();

    if (fetchError || !user) {
      sendError(res, 'User not found', 404);
      return;
    }

    if (user.approval_status === 'rejected') {
      sendError(res, 'User is already rejected', 400);
      return;
    }

    // Reject user
    const { data: updatedUser, error } = await supabaseAdmin
      .from('users')
      .update({
        approval_status: 'rejected',
        approved_by: admin.id,
        approval_date: new Date().toISOString(),
        rejection_reason: data.rejection_reason,
      })
      .eq('id', data.user_id)
      .select('*')
      .single();

    if (error) {
      throw new ApiError(`Failed to reject user: ${error.message}`, 500);
    }

    // Create audit log
    await AuditService.logUserApproval(admin, data.user_id, false, data.rejection_reason, req);

    // Notify user
    await NotificationService.notifyAccountRejected(data.user_id, data.rejection_reason);

    sendSuccess(res, 'User rejected', updatedUser);
  }

  /**
   * Get all users (with filters)
   * GET /api/admin/users
   */
  static async getAllUsers(req: Request, res: Response): Promise<void> {
    const pagination = parsePaginationParams(req.query as Record<string, unknown>);
    const offset = getOffset(pagination.page, pagination.limit);

    let query = supabaseAdmin.from('users').select('*', { count: 'exact' });

    // Apply filters
    if (req.query.role) {
      query = query.eq('role', req.query.role as string);
    }
    if (req.query.approval_status) {
      query = query.eq('approval_status', req.query.approval_status as string);
    }
    if (req.query.hostel_name) {
      query = query.eq('hostel_name', req.query.hostel_name as string);
    }
    if (req.query.search) {
      query = query.or(
        `full_name.ilike.%${req.query.search}%,email.ilike.%${req.query.search}%,student_id.ilike.%${req.query.search}%`
      );
    }

    // Apply sorting and pagination
    query = query
      .order(pagination.sortBy || 'created_at', { ascending: pagination.sortOrder === 'asc' })
      .range(offset, offset + pagination.limit - 1);

    const { data: users, error, count } = await query;

    if (error) {
      throw new ApiError(`Failed to fetch users: ${error.message}`, 500);
    }

    sendPaginated(res, 'Users retrieved', users || [], pagination, count || 0);
  }

  /**
   * Get a specific user by ID
   * GET /api/admin/users/:id
   */
  static async getUserById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*, approver:users!approved_by(full_name, email)')
      .eq('id', id)
      .single();

    if (error || !user) {
      sendError(res, 'User not found', 404);
      return;
    }

    sendSuccess(res, 'User retrieved', user);
  }

  /**
   * Get audit logs
   * GET /api/admin/audit-logs
   */
  static async getAuditLogs(req: Request, res: Response): Promise<void> {
    const pagination = parsePaginationParams(req.query as Record<string, unknown>);
    const offset = getOffset(pagination.page, pagination.limit);

    const filters: Parameters<typeof AuditService.getLogs>[0] = {
      limit: pagination.limit,
      offset,
    };

    if (req.query.entity_type) {
      filters.entityType = req.query.entity_type as typeof filters.entityType;
    }
    if (req.query.entity_id) {
      filters.entityId = req.query.entity_id as string;
    }
    if (req.query.user_id) {
      filters.userId = req.query.user_id as string;
    }
    if (req.query.action) {
      filters.action = req.query.action as typeof filters.action;
    }
    if (req.query.start_date) {
      filters.startDate = req.query.start_date as string;
    }
    if (req.query.end_date) {
      filters.endDate = req.query.end_date as string;
    }

    const { data, count } = await AuditService.getLogs(filters);

    sendPaginated(res, 'Audit logs retrieved', data, pagination, count);
  }

  /**
   * Get system statistics
   * GET /api/admin/stats
   */
  static async getSystemStats(req: Request, res: Response): Promise<void> {
    // Users by role
    const { data: usersByRole } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('approval_status', 'approved');

    const roleCounts: Record<string, number> = { student: 0, caretaker: 0, admin: 0 };
    usersByRole?.forEach((u) => {
      if (u.role in roleCounts) roleCounts[u.role]++;
    });

    // Issues by status
    const { data: issuesByStatus } = await supabaseAdmin.from('issues').select('status');
    const statusCounts: Record<string, number> = { pending: 0, in_progress: 0, resolved: 0, closed: 0 };
    issuesByStatus?.forEach((i) => {
      if (i.status in statusCounts) statusCounts[i.status]++;
    });

    // Recent activity
    const { count: todayIssues } = await supabaseAdmin
      .from('issues')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', new Date().toISOString().split('T')[0]);

    const { count: todayResolved } = await supabaseAdmin
      .from('issues')
      .select('*', { count: 'exact', head: true })
      .gte('resolved_at', new Date().toISOString().split('T')[0]);

    sendSuccess(res, 'System stats retrieved', {
      users: {
        by_role: roleCounts,
        total: Object.values(roleCounts).reduce((a, b) => a + b, 0),
      },
      issues: {
        by_status: statusCounts,
        total: Object.values(statusCounts).reduce((a, b) => a + b, 0),
        today_created: todayIssues || 0,
        today_resolved: todayResolved || 0,
      },
    });
  }

  /**
   * Get list of hostels
   * GET /api/admin/hostels
   */
  static async getHostels(req: Request, res: Response): Promise<void> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('hostel_name')
      .not('hostel_name', 'is', null)
      .eq('role', 'student');

    if (error) {
      throw new ApiError(`Failed to fetch hostels: ${error.message}`, 500);
    }

    // Get unique hostel names with counts
    const hostelCounts: Record<string, number> = {};
    data?.forEach((u) => {
      if (u.hostel_name) {
        hostelCounts[u.hostel_name] = (hostelCounts[u.hostel_name] || 0) + 1;
      }
    });

    const hostels = Object.entries(hostelCounts)
      .map(([name, count]) => ({ name, student_count: count }))
      .sort((a, b) => b.student_count - a.student_count);

    sendSuccess(res, 'Hostels retrieved', hostels);
  }
}

export default AdminController;
