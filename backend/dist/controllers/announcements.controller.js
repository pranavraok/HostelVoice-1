"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnnouncementsController = void 0;
const config_1 = require("../config");
const response_1 = require("../utils/response");
const validators_1 = require("../utils/validators");
const services_1 = require("../services");
const middleware_1 = require("../middleware");
/**
 * Announcements Controller
 * Handles all announcement-related operations
 */
class AnnouncementsController {
    /**
     * Create a new announcement
     * POST /api/announcements
     */
    static async create(req, res) {
        const user = req.user;
        const data = (0, validators_1.validate)(validators_1.createAnnouncementSchema, req.body);
        // Create announcement
        const announcementData = {
            ...data,
            created_by: user.id,
            is_active: true,
        };
        const { data: announcement, error } = await config_1.supabaseAdmin
            .from('announcements')
            .insert(announcementData)
            .select('*, creator:users!created_by(full_name, email, role)')
            .single();
        if (error) {
            throw new middleware_1.ApiError(`Failed to create announcement: ${error.message}`, 500);
        }
        // Create audit log
        await services_1.AuditService.logAnnouncementAction(user, 'create', announcement.id, announcementData, req);
        // Notify targeted users
        await AnnouncementsController.notifyTargetedUsers(announcement);
        (0, response_1.sendCreated)(res, 'Announcement created successfully', announcement);
    }
    /**
     * Notify users based on announcement targeting
     */
    static async notifyTargetedUsers(announcement) {
        let query = config_1.supabaseAdmin
            .from('users')
            .select('id')
            .eq('approval_status', 'approved');
        // Filter by target role
        if (announcement.target_role && announcement.target_role !== 'all') {
            query = query.eq('role', announcement.target_role);
        }
        // Filter by target hostel
        if (announcement.target_hostel) {
            query = query.eq('hostel_name', announcement.target_hostel);
        }
        const { data: users } = await query;
        if (users && users.length > 0) {
            await services_1.NotificationService.notifyNewAnnouncement(users.map((u) => u.id), announcement.id, announcement.title, announcement.priority);
        }
    }
    /**
     * Get announcements targeted to the current user
     * GET /api/announcements
     */
    static async getTargeted(req, res) {
        const user = req.user;
        const pagination = (0, response_1.parsePaginationParams)(req.query);
        const offset = (0, response_1.getOffset)(pagination.page, pagination.limit);
        // Build query for announcements visible to this user
        let query = config_1.supabaseAdmin
            .from('announcements')
            .select('*, creator:users!created_by(full_name, email, role)', { count: 'exact' })
            .eq('is_active', true)
            .or(`target_role.is.null,target_role.eq.all,target_role.eq.${user.role}`);
        // Filter by hostel if user has one
        if (user.hostel_name) {
            query = query.or(`target_hostel.is.null,target_hostel.eq.${user.hostel_name}`);
        }
        else {
            query = query.is('target_hostel', null);
        }
        // Filter out expired announcements
        query = query.or(`expires_at.is.null,expires_at.gte.${new Date().toISOString()}`);
        // Apply filters
        if (req.query.category) {
            query = query.eq('category', req.query.category);
        }
        if (req.query.priority) {
            query = query.eq('priority', req.query.priority);
        }
        // Apply sorting and pagination
        query = query
            .order('priority', { ascending: false }) // Urgent first
            .order('created_at', { ascending: false })
            .range(offset, offset + pagination.limit - 1);
        const { data: announcements, error, count } = await query;
        if (error) {
            throw new middleware_1.ApiError(`Failed to fetch announcements: ${error.message}`, 500);
        }
        (0, response_1.sendPaginated)(res, 'Announcements retrieved successfully', announcements || [], pagination, count || 0);
    }
    /**
     * Get all announcements (for staff management)
     * GET /api/announcements/all
     */
    static async getAll(req, res) {
        const pagination = (0, response_1.parsePaginationParams)(req.query);
        const offset = (0, response_1.getOffset)(pagination.page, pagination.limit);
        let query = config_1.supabaseAdmin
            .from('announcements')
            .select('*, creator:users!created_by(full_name, email, role)', { count: 'exact' });
        // Apply filters
        if (req.query.is_active !== undefined) {
            query = query.eq('is_active', req.query.is_active === 'true');
        }
        if (req.query.category) {
            query = query.eq('category', req.query.category);
        }
        if (req.query.created_by) {
            query = query.eq('created_by', req.query.created_by);
        }
        if (req.query.search) {
            query = query.or(`title.ilike.%${req.query.search}%,content.ilike.%${req.query.search}%`);
        }
        // Apply sorting and pagination
        query = query
            .order(pagination.sortBy || 'created_at', { ascending: pagination.sortOrder === 'asc' })
            .range(offset, offset + pagination.limit - 1);
        const { data: announcements, error, count } = await query;
        if (error) {
            throw new middleware_1.ApiError(`Failed to fetch announcements: ${error.message}`, 500);
        }
        (0, response_1.sendPaginated)(res, 'Announcements retrieved successfully', announcements || [], pagination, count || 0);
    }
    /**
     * Get a single announcement by ID
     * GET /api/announcements/:id
     */
    static async getById(req, res) {
        const { id } = req.params;
        const { data: announcement, error } = await config_1.supabaseAdmin
            .from('announcements')
            .select('*, creator:users!created_by(full_name, email, role)')
            .eq('id', id)
            .single();
        if (error || !announcement) {
            (0, response_1.sendError)(res, 'Announcement not found', 404);
            return;
        }
        (0, response_1.sendSuccess)(res, 'Announcement retrieved successfully', announcement);
    }
    /**
     * Update an announcement
     * PATCH /api/announcements/:id
     */
    static async update(req, res) {
        const { id } = req.params;
        const user = req.user;
        const data = (0, validators_1.validate)(validators_1.updateAnnouncementSchema, req.body);
        // Fetch existing announcement
        const { data: existing, error: fetchError } = await config_1.supabaseAdmin
            .from('announcements')
            .select('*')
            .eq('id', id)
            .single();
        if (fetchError || !existing) {
            (0, response_1.sendError)(res, 'Announcement not found', 404);
            return;
        }
        // Check permission: creator or admin can update
        if (existing.created_by !== user.id && user.role !== 'admin') {
            (0, response_1.sendError)(res, 'Access denied. Only the creator or admin can update this announcement.', 403);
            return;
        }
        // Update announcement
        const { data: announcement, error } = await config_1.supabaseAdmin
            .from('announcements')
            .update(data)
            .eq('id', id)
            .select('*, creator:users!created_by(full_name, email, role)')
            .single();
        if (error) {
            throw new middleware_1.ApiError(`Failed to update announcement: ${error.message}`, 500);
        }
        // Create audit log
        await services_1.AuditService.logAnnouncementAction(user, 'update', id, data, req);
        (0, response_1.sendSuccess)(res, 'Announcement updated successfully', announcement);
    }
    /**
     * Delete an announcement
     * DELETE /api/announcements/:id
     */
    static async delete(req, res) {
        const { id } = req.params;
        const user = req.user;
        // Fetch existing announcement
        const { data: existing, error: fetchError } = await config_1.supabaseAdmin
            .from('announcements')
            .select('*')
            .eq('id', id)
            .single();
        if (fetchError || !existing) {
            (0, response_1.sendError)(res, 'Announcement not found', 404);
            return;
        }
        // Check permission: creator or admin can delete
        if (existing.created_by !== user.id && user.role !== 'admin') {
            (0, response_1.sendError)(res, 'Access denied. Only the creator or admin can delete this announcement.', 403);
            return;
        }
        // Delete announcement
        const { error } = await config_1.supabaseAdmin
            .from('announcements')
            .delete()
            .eq('id', id);
        if (error) {
            throw new middleware_1.ApiError(`Failed to delete announcement: ${error.message}`, 500);
        }
        // Create audit log
        await services_1.AuditService.logAnnouncementAction(user, 'delete', id, { deleted: true }, req);
        (0, response_1.sendNoContent)(res);
    }
    /**
     * Toggle announcement active status
     * PATCH /api/announcements/:id/toggle
     */
    static async toggleActive(req, res) {
        const { id } = req.params;
        const user = req.user;
        // Fetch existing announcement
        const { data: existing, error: fetchError } = await config_1.supabaseAdmin
            .from('announcements')
            .select('*')
            .eq('id', id)
            .single();
        if (fetchError || !existing) {
            (0, response_1.sendError)(res, 'Announcement not found', 404);
            return;
        }
        // Toggle is_active
        const { data: announcement, error } = await config_1.supabaseAdmin
            .from('announcements')
            .update({ is_active: !existing.is_active })
            .eq('id', id)
            .select('*, creator:users!created_by(full_name, email, role)')
            .single();
        if (error) {
            throw new middleware_1.ApiError(`Failed to toggle announcement: ${error.message}`, 500);
        }
        // Create audit log
        await services_1.AuditService.logAnnouncementAction(user, 'update', id, { is_active: !existing.is_active }, req);
        (0, response_1.sendSuccess)(res, `Announcement ${announcement.is_active ? 'activated' : 'deactivated'} successfully`, announcement);
    }
}
exports.AnnouncementsController = AnnouncementsController;
exports.default = AnnouncementsController;
//# sourceMappingURL=announcements.controller.js.map