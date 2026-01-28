"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const config_1 = require("../config");
const response_1 = require("../utils/response");
const validators_1 = require("../utils/validators");
const services_1 = require("../services");
const middleware_1 = require("../middleware");
/**
 * Admin Controller
 * Handles admin-specific operations like user approval
 */
class AdminController {
    /**
     * Get pending user approvals
     * GET /api/admin/pending-users
     */
    static async getPendingUsers(req, res) {
        const pagination = (0, response_1.parsePaginationParams)(req.query);
        const offset = (0, response_1.getOffset)(pagination.page, pagination.limit);
        let query = config_1.supabaseAdmin
            .from('users')
            .select('*', { count: 'exact' })
            .eq('approval_status', 'pending');
        // Filter by role if specified
        if (req.query.role) {
            query = query.eq('role', req.query.role);
        }
        // Apply sorting and pagination
        query = query
            .order('created_at', { ascending: false })
            .range(offset, offset + pagination.limit - 1);
        const { data: users, error, count } = await query;
        if (error) {
            throw new middleware_1.ApiError(`Failed to fetch pending users: ${error.message}`, 500);
        }
        (0, response_1.sendPaginated)(res, 'Pending users retrieved', users || [], pagination, count || 0);
    }
    /**
     * Approve a user
     * PATCH /api/admin/approve-user
     */
    static async approveUser(req, res) {
        const admin = req.user;
        const data = (0, validators_1.validate)(validators_1.approveUserSchema, req.body);
        // Fetch user
        const { data: user, error: fetchError } = await config_1.supabaseAdmin
            .from('users')
            .select('*')
            .eq('id', data.user_id)
            .single();
        if (fetchError || !user) {
            (0, response_1.sendError)(res, 'User not found', 404);
            return;
        }
        if (user.approval_status === 'approved') {
            (0, response_1.sendError)(res, 'User is already approved', 400);
            return;
        }
        // Approve user
        const { data: updatedUser, error } = await config_1.supabaseAdmin
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
            throw new middleware_1.ApiError(`Failed to approve user: ${error.message}`, 500);
        }
        // Create audit log
        await services_1.AuditService.logUserApproval(admin, data.user_id, true, undefined, req);
        // Notify user
        await services_1.NotificationService.notifyAccountApproved(data.user_id);
        (0, response_1.sendSuccess)(res, 'User approved successfully', updatedUser);
    }
    /**
     * Reject a user
     * PATCH /api/admin/reject-user
     */
    static async rejectUser(req, res) {
        const admin = req.user;
        const data = (0, validators_1.validate)(validators_1.rejectUserSchema, req.body);
        // Fetch user
        const { data: user, error: fetchError } = await config_1.supabaseAdmin
            .from('users')
            .select('*')
            .eq('id', data.user_id)
            .single();
        if (fetchError || !user) {
            (0, response_1.sendError)(res, 'User not found', 404);
            return;
        }
        if (user.approval_status === 'rejected') {
            (0, response_1.sendError)(res, 'User is already rejected', 400);
            return;
        }
        // Reject user
        const { data: updatedUser, error } = await config_1.supabaseAdmin
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
            throw new middleware_1.ApiError(`Failed to reject user: ${error.message}`, 500);
        }
        // Create audit log
        await services_1.AuditService.logUserApproval(admin, data.user_id, false, data.rejection_reason, req);
        // Notify user
        await services_1.NotificationService.notifyAccountRejected(data.user_id, data.rejection_reason);
        (0, response_1.sendSuccess)(res, 'User rejected', updatedUser);
    }
    /**
     * Get all users (with filters)
     * GET /api/admin/users
     */
    static async getAllUsers(req, res) {
        const pagination = (0, response_1.parsePaginationParams)(req.query);
        const offset = (0, response_1.getOffset)(pagination.page, pagination.limit);
        let query = config_1.supabaseAdmin.from('users').select('*', { count: 'exact' });
        // Apply filters
        if (req.query.role) {
            query = query.eq('role', req.query.role);
        }
        if (req.query.approval_status) {
            query = query.eq('approval_status', req.query.approval_status);
        }
        if (req.query.hostel_name) {
            query = query.eq('hostel_name', req.query.hostel_name);
        }
        if (req.query.search) {
            query = query.or(`full_name.ilike.%${req.query.search}%,email.ilike.%${req.query.search}%,student_id.ilike.%${req.query.search}%`);
        }
        // Apply sorting and pagination
        query = query
            .order(pagination.sortBy || 'created_at', { ascending: pagination.sortOrder === 'asc' })
            .range(offset, offset + pagination.limit - 1);
        const { data: users, error, count } = await query;
        if (error) {
            throw new middleware_1.ApiError(`Failed to fetch users: ${error.message}`, 500);
        }
        (0, response_1.sendPaginated)(res, 'Users retrieved', users || [], pagination, count || 0);
    }
    /**
     * Get a specific user by ID
     * GET /api/admin/users/:id
     */
    static async getUserById(req, res) {
        const { id } = req.params;
        const { data: user, error } = await config_1.supabaseAdmin
            .from('users')
            .select('*, approver:users!approved_by(full_name, email)')
            .eq('id', id)
            .single();
        if (error || !user) {
            (0, response_1.sendError)(res, 'User not found', 404);
            return;
        }
        (0, response_1.sendSuccess)(res, 'User retrieved', user);
    }
    /**
     * Get audit logs
     * GET /api/admin/audit-logs
     */
    static async getAuditLogs(req, res) {
        const pagination = (0, response_1.parsePaginationParams)(req.query);
        const offset = (0, response_1.getOffset)(pagination.page, pagination.limit);
        const filters = {
            limit: pagination.limit,
            offset,
        };
        if (req.query.entity_type) {
            filters.entityType = req.query.entity_type;
        }
        if (req.query.entity_id) {
            filters.entityId = req.query.entity_id;
        }
        if (req.query.user_id) {
            filters.userId = req.query.user_id;
        }
        if (req.query.action) {
            filters.action = req.query.action;
        }
        if (req.query.start_date) {
            filters.startDate = req.query.start_date;
        }
        if (req.query.end_date) {
            filters.endDate = req.query.end_date;
        }
        const { data, count } = await services_1.AuditService.getLogs(filters);
        (0, response_1.sendPaginated)(res, 'Audit logs retrieved', data, pagination, count);
    }
    /**
     * Get system statistics
     * GET /api/admin/stats
     */
    static async getSystemStats(req, res) {
        // Users by role
        const { data: usersByRole } = await config_1.supabaseAdmin
            .from('users')
            .select('role')
            .eq('approval_status', 'approved');
        const roleCounts = { student: 0, caretaker: 0, admin: 0 };
        usersByRole?.forEach((u) => {
            if (u.role in roleCounts)
                roleCounts[u.role]++;
        });
        // Issues by status
        const { data: issuesByStatus } = await config_1.supabaseAdmin.from('issues').select('status');
        const statusCounts = { pending: 0, in_progress: 0, resolved: 0, closed: 0 };
        issuesByStatus?.forEach((i) => {
            if (i.status in statusCounts)
                statusCounts[i.status]++;
        });
        // Recent activity
        const { count: todayIssues } = await config_1.supabaseAdmin
            .from('issues')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', new Date().toISOString().split('T')[0]);
        const { count: todayResolved } = await config_1.supabaseAdmin
            .from('issues')
            .select('*', { count: 'exact', head: true })
            .gte('resolved_at', new Date().toISOString().split('T')[0]);
        (0, response_1.sendSuccess)(res, 'System stats retrieved', {
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
    static async getHostels(req, res) {
        const { data, error } = await config_1.supabaseAdmin
            .from('users')
            .select('hostel_name')
            .not('hostel_name', 'is', null)
            .eq('role', 'student');
        if (error) {
            throw new middleware_1.ApiError(`Failed to fetch hostels: ${error.message}`, 500);
        }
        // Get unique hostel names with counts
        const hostelCounts = {};
        data?.forEach((u) => {
            if (u.hostel_name) {
                hostelCounts[u.hostel_name] = (hostelCounts[u.hostel_name] || 0) + 1;
            }
        });
        const hostels = Object.entries(hostelCounts)
            .map(([name, count]) => ({ name, student_count: count }))
            .sort((a, b) => b.student_count - a.student_count);
        (0, response_1.sendSuccess)(res, 'Hostels retrieved', hostels);
    }
}
exports.AdminController = AdminController;
exports.default = AdminController;
//# sourceMappingURL=admin.controller.js.map