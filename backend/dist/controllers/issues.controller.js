"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IssuesController = void 0;
const config_1 = require("../config");
const response_1 = require("../utils/response");
const validators_1 = require("../utils/validators");
const services_1 = require("../services");
const middleware_1 = require("../middleware");
/**
 * Issues Controller
 * Handles all issue-related operations
 */
class IssuesController {
    /**
     * Create a new issue
     * POST /api/issues
     */
    static async create(req, res) {
        const user = req.user;
        // Validate input
        const data = (0, validators_1.validate)(validators_1.createIssueSchema, req.body);
        // Create issue
        const issueData = {
            ...data,
            reported_by: user.id,
            status: 'pending',
            hostel_name: data.hostel_name || user.hostel_name,
            room_number: data.room_number || user.room_number,
        };
        const { data: issue, error } = await config_1.supabaseAdmin
            .from('issues')
            .insert(issueData)
            .select('*, reporter:users!reported_by(full_name, email)')
            .single();
        if (error) {
            throw new middleware_1.ApiError(`Failed to create issue: ${error.message}`, 500);
        }
        // Create audit log
        await services_1.AuditService.logIssueCreate(user, issue.id, issueData, req);
        // Notify caretakers about new issue (high/urgent priority only)
        if (data.priority === 'high' || data.priority === 'urgent') {
            const { data: caretakers } = await config_1.supabaseAdmin
                .from('users')
                .select('id')
                .eq('role', 'caretaker')
                .eq('approval_status', 'approved');
            if (caretakers && caretakers.length > 0) {
                await services_1.NotificationService.createBulk(caretakers.map((c) => c.id), {
                    title: `${data.priority === 'urgent' ? '🚨 URGENT' : '⚠️ High Priority'} Issue Reported`,
                    message: `New ${data.category} issue: ${data.title}`,
                    type: 'issue',
                    referenceId: issue.id,
                    referenceType: 'issue',
                });
            }
        }
        (0, response_1.sendCreated)(res, 'Issue created successfully', issue);
    }
    /**
     * Get current user's issues
     * GET /api/issues/my
     */
    static async getMyIssues(req, res) {
        const user = req.user;
        const pagination = (0, response_1.parsePaginationParams)(req.query);
        const offset = (0, response_1.getOffset)(pagination.page, pagination.limit);
        // Build query
        let query = config_1.supabaseAdmin
            .from('issues')
            .select('*, reporter:users!reported_by(full_name, email), assignee:users!assigned_to(full_name, email)', {
            count: 'exact',
        })
            .eq('reported_by', user.id);
        // Apply filters
        if (req.query.status) {
            query = query.eq('status', req.query.status);
        }
        if (req.query.category) {
            query = query.eq('category', req.query.category);
        }
        if (req.query.priority) {
            query = query.eq('priority', req.query.priority);
        }
        // Apply sorting and pagination
        query = query
            .order(pagination.sortBy || 'created_at', { ascending: pagination.sortOrder === 'asc' })
            .range(offset, offset + pagination.limit - 1);
        const { data: issues, error, count } = await query;
        if (error) {
            throw new middleware_1.ApiError(`Failed to fetch issues: ${error.message}`, 500);
        }
        (0, response_1.sendPaginated)(res, 'Issues retrieved successfully', issues || [], pagination, count || 0);
    }
    /**
     * Get all issues (staff only)
     * GET /api/issues
     */
    static async getAllIssues(req, res) {
        const pagination = (0, response_1.parsePaginationParams)(req.query);
        const offset = (0, response_1.getOffset)(pagination.page, pagination.limit);
        // Build query
        let query = config_1.supabaseAdmin
            .from('issues')
            .select('*, reporter:users!reported_by(full_name, email, hostel_name, room_number), assignee:users!assigned_to(full_name, email)', {
            count: 'exact',
        });
        // Apply filters
        if (req.query.status) {
            query = query.eq('status', req.query.status);
        }
        if (req.query.category) {
            query = query.eq('category', req.query.category);
        }
        if (req.query.priority) {
            query = query.eq('priority', req.query.priority);
        }
        if (req.query.hostel_name) {
            query = query.eq('hostel_name', req.query.hostel_name);
        }
        if (req.query.assigned_to) {
            if (req.query.assigned_to === 'unassigned') {
                query = query.is('assigned_to', null);
            }
            else {
                query = query.eq('assigned_to', req.query.assigned_to);
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
            throw new middleware_1.ApiError(`Failed to fetch issues: ${error.message}`, 500);
        }
        (0, response_1.sendPaginated)(res, 'Issues retrieved successfully', issues || [], pagination, count || 0);
    }
    /**
     * Get a single issue by ID
     * GET /api/issues/:id
     */
    static async getById(req, res) {
        const { id } = req.params;
        const user = req.user;
        const { data: issue, error } = await config_1.supabaseAdmin
            .from('issues')
            .select('*, reporter:users!reported_by(full_name, email, hostel_name, room_number, phone_number), assignee:users!assigned_to(full_name, email, phone_number)')
            .eq('id', id)
            .single();
        if (error || !issue) {
            (0, response_1.sendError)(res, 'Issue not found', 404);
            return;
        }
        // Check access: user can view their own issues, staff can view all
        if (user.role === 'student' && issue.reported_by !== user.id) {
            (0, response_1.sendError)(res, 'Access denied', 403);
            return;
        }
        (0, response_1.sendSuccess)(res, 'Issue retrieved successfully', issue);
    }
    /**
     * Assign an issue to a caretaker
     * PATCH /api/issues/:id/assign
     */
    static async assign(req, res) {
        const { id } = req.params;
        const user = req.user;
        const data = (0, validators_1.validate)(validators_1.assignIssueSchema, req.body);
        // Fetch current issue
        const { data: issue, error: fetchError } = await config_1.supabaseAdmin
            .from('issues')
            .select('*')
            .eq('id', id)
            .single();
        if (fetchError || !issue) {
            (0, response_1.sendError)(res, 'Issue not found', 404);
            return;
        }
        // Verify assignee is a caretaker
        const { data: assignee, error: assigneeError } = await config_1.supabaseAdmin
            .from('users')
            .select('id, role, full_name')
            .eq('id', data.assigned_to)
            .single();
        if (assigneeError || !assignee) {
            (0, response_1.sendError)(res, 'Assignee not found', 404);
            return;
        }
        if (assignee.role !== 'caretaker' && assignee.role !== 'admin') {
            (0, response_1.sendError)(res, 'Can only assign to caretakers or admins', 400);
            return;
        }
        // Update issue
        const { data: updatedIssue, error: updateError } = await config_1.supabaseAdmin
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
            throw new middleware_1.ApiError(`Failed to assign issue: ${updateError.message}`, 500);
        }
        // Create audit log
        await services_1.AuditService.logIssueAssign(user, id, issue.assigned_to, data.assigned_to, req);
        // Notify assignee
        await services_1.NotificationService.notifyIssueAssignment(data.assigned_to, id, issue.title);
        // Notify reporter about assignment
        if (issue.reported_by !== user.id) {
            await services_1.NotificationService.create({
                userId: issue.reported_by,
                title: 'Issue Assigned',
                message: `Your issue "${issue.title}" has been assigned to ${assignee.full_name}`,
                type: 'issue',
                referenceId: id,
                referenceType: 'issue',
            });
        }
        (0, response_1.sendSuccess)(res, 'Issue assigned successfully', updatedIssue);
    }
    /**
     * Update issue status
     * PATCH /api/issues/:id/status
     */
    static async updateStatus(req, res) {
        const { id } = req.params;
        const user = req.user;
        const data = (0, validators_1.validate)(validators_1.updateIssueStatusSchema, req.body);
        // Fetch current issue
        const { data: issue, error: fetchError } = await config_1.supabaseAdmin
            .from('issues')
            .select('*')
            .eq('id', id)
            .single();
        if (fetchError || !issue) {
            (0, response_1.sendError)(res, 'Issue not found', 404);
            return;
        }
        // Build update data
        const updateData = {
            status: data.status,
        };
        if (data.notes) {
            updateData.notes = `${issue.notes || ''}\n\n[Status Update - ${new Date().toISOString()}]\n${data.notes}`;
        }
        if (data.status === 'resolved' || data.status === 'closed') {
            updateData.resolved_at = new Date().toISOString();
        }
        // Update issue
        const { data: updatedIssue, error: updateError } = await config_1.supabaseAdmin
            .from('issues')
            .update(updateData)
            .eq('id', id)
            .select('*, reporter:users!reported_by(full_name, email), assignee:users!assigned_to(full_name, email)')
            .single();
        if (updateError) {
            throw new middleware_1.ApiError(`Failed to update issue: ${updateError.message}`, 500);
        }
        // Create audit log
        await services_1.AuditService.logIssueStatusUpdate(user, id, issue.status, data.status, data.notes, req);
        // Notify reporter
        if (issue.reported_by !== user.id) {
            await services_1.NotificationService.notifyIssueStatusChange(issue.reported_by, id, issue.title, data.status);
        }
        (0, response_1.sendSuccess)(res, 'Issue status updated successfully', updatedIssue);
    }
    /**
     * Merge duplicate issues
     * POST /api/issues/merge
     */
    static async merge(req, res) {
        const user = req.user;
        const data = (0, validators_1.validate)(validators_1.mergeIssuesSchema, req.body);
        const result = await services_1.DuplicateMergeService.mergeIssues(user, data.master_issue_id, data.duplicate_issue_ids, data.merge_notes, req);
        (0, response_1.sendSuccess)(res, `Successfully merged ${result.mergedCount} issue(s)`, result);
    }
    /**
     * Find potential duplicate issues
     * GET /api/issues/:id/duplicates
     */
    static async findDuplicates(req, res) {
        const { id } = req.params;
        const limit = parseInt(req.query.limit) || 5;
        const duplicates = await services_1.DuplicateMergeService.findPotentialDuplicates(id, { limit });
        (0, response_1.sendSuccess)(res, 'Potential duplicates retrieved', duplicates);
    }
}
exports.IssuesController = IssuesController;
exports.default = IssuesController;
//# sourceMappingURL=issues.controller.js.map