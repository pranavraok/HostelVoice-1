"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResidentsController = void 0;
const config_1 = require("../config");
const response_1 = require("../utils/response");
const validators_1 = require("../utils/validators");
const services_1 = require("../services");
const middleware_1 = require("../middleware");
/**
 * Residents Controller
 * Handles resident profile management
 */
class ResidentsController {
    /**
     * Add or update resident profile for current user
     * POST /api/residents
     */
    static async add(req, res) {
        const user = req.user;
        const data = (0, validators_1.validate)(validators_1.createResidentSchema, req.body);
        // Check if resident profile already exists
        const { data: existing } = await config_1.supabaseAdmin
            .from('residents')
            .select('id')
            .eq('user_id', user.id)
            .single();
        if (existing) {
            // Update existing profile
            const { data: resident, error } = await config_1.supabaseAdmin
                .from('residents')
                .update({
                ...data,
                is_active: true,
            })
                .eq('user_id', user.id)
                .select('*, user:users!user_id(full_name, email, phone_number, hostel_name, room_number)')
                .single();
            if (error) {
                throw new middleware_1.ApiError(`Failed to update resident profile: ${error.message}`, 500);
            }
            await services_1.AuditService.log({
                userId: user.id,
                action: 'update',
                entityType: 'resident',
                entityId: resident.id,
                newData: data,
                req,
            });
            (0, response_1.sendSuccess)(res, 'Resident profile updated successfully', resident);
            return;
        }
        // Create new resident profile
        const { data: resident, error } = await config_1.supabaseAdmin
            .from('residents')
            .insert({
            ...data,
            user_id: user.id,
            is_active: true,
        })
            .select('*, user:users!user_id(full_name, email, phone_number, hostel_name, room_number)')
            .single();
        if (error) {
            throw new middleware_1.ApiError(`Failed to create resident profile: ${error.message}`, 500);
        }
        await services_1.AuditService.log({
            userId: user.id,
            action: 'create',
            entityType: 'resident',
            entityId: resident.id,
            newData: data,
            req,
        });
        (0, response_1.sendCreated)(res, 'Resident profile created successfully', resident);
    }
    /**
     * Get current user's resident profile
     * GET /api/residents/me
     */
    static async getMe(req, res) {
        const user = req.user;
        const { data: resident, error } = await config_1.supabaseAdmin
            .from('residents')
            .select('*, user:users!user_id(full_name, email, phone_number, hostel_name, room_number, student_id)')
            .eq('user_id', user.id)
            .single();
        if (error || !resident) {
            (0, response_1.sendError)(res, 'Resident profile not found', 404);
            return;
        }
        (0, response_1.sendSuccess)(res, 'Resident profile retrieved successfully', resident);
    }
    /**
     * Update current user's resident profile
     * PATCH /api/residents/me
     */
    static async updateMe(req, res) {
        const user = req.user;
        const data = (0, validators_1.validate)(validators_1.updateResidentSchema, req.body);
        // Fetch existing profile
        const { data: existing, error: fetchError } = await config_1.supabaseAdmin
            .from('residents')
            .select('*')
            .eq('user_id', user.id)
            .single();
        if (fetchError || !existing) {
            (0, response_1.sendError)(res, 'Resident profile not found. Please create one first.', 404);
            return;
        }
        // Update profile
        const { data: resident, error } = await config_1.supabaseAdmin
            .from('residents')
            .update(data)
            .eq('user_id', user.id)
            .select('*, user:users!user_id(full_name, email, phone_number, hostel_name, room_number)')
            .single();
        if (error) {
            throw new middleware_1.ApiError(`Failed to update resident profile: ${error.message}`, 500);
        }
        await services_1.AuditService.log({
            userId: user.id,
            action: 'update',
            entityType: 'resident',
            entityId: resident.id,
            oldData: existing,
            newData: data,
            req,
        });
        (0, response_1.sendSuccess)(res, 'Resident profile updated successfully', resident);
    }
    /**
     * Get residents from users table (role-based access)
     * GET /api/residents
     * Admin: all students
     * Caretaker: students from their hostel
     * Student: only self
     */
    static async getResidents(req, res) {
        const user = req.user;
        const pagination = (0, response_1.parsePaginationParams)(req.query);
        const offset = (0, response_1.getOffset)(pagination.page, pagination.limit);
        let query = config_1.supabaseAdmin
            .from('users')
            .select('id, full_name, email, phone_number, hostel_name, room_number, student_id, created_at, approval_status', {
            count: 'exact',
        });
        // Role-based filtering
        if (user.role === 'student') {
            // Students can only see themselves
            query = query.eq('id', user.id);
        }
        else if (user.role === 'caretaker') {
            // Caretakers see students from their hostel
            // First get caretaker's hostel
            const { data: caretakerData, error: caretakerError } = await config_1.supabaseAdmin
                .from('users')
                .select('hostel_name')
                .eq('id', user.id)
                .single();
            if (caretakerError || !caretakerData?.hostel_name) {
                (0, response_1.sendError)(res, 'Caretaker hostel information not found', 404);
                return;
            }
            // Filter students by caretaker's hostel
            query = query
                .eq('role', 'student')
                .eq('hostel_name', caretakerData.hostel_name);
        }
        else if (user.role === 'admin') {
            // Admins see all students
            query = query.eq('role', 'student');
        }
        else {
            (0, response_1.sendError)(res, 'Access denied', 403);
            return;
        }
        // Apply search filter if provided
        if (req.query.search) {
            const searchTerm = req.query.search;
            query = query.or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,student_id.ilike.%${searchTerm}%,room_number.ilike.%${searchTerm}%`);
        }
        // Apply approval status filter
        if (req.query.approval_status) {
            query = query.eq('approval_status', req.query.approval_status);
        }
        // Apply sorting and pagination
        query = query
            .order(pagination.sortBy || 'created_at', { ascending: pagination.sortOrder === 'asc' })
            .range(offset, offset + pagination.limit - 1);
        const { data: residents, error, count } = await query;
        if (error) {
            throw new middleware_1.ApiError(`Failed to fetch residents: ${error.message}`, 500);
        }
        if (!residents || residents.length === 0) {
            (0, response_1.sendSuccess)(res, 'No residents found', []);
            return;
        }
        (0, response_1.sendPaginated)(res, 'Residents retrieved successfully', residents, pagination, count || 0);
    }
    /**
     * Get all residents (staff only) - DEPRECATED, use getResidents instead
     * GET /api/residents/all
     */
    static async getAll(req, res) {
        const pagination = (0, response_1.parsePaginationParams)(req.query);
        const offset = (0, response_1.getOffset)(pagination.page, pagination.limit);
        let query = config_1.supabaseAdmin
            .from('residents')
            .select('*, user:users!user_id(full_name, email, phone_number, hostel_name, room_number, student_id, role)', {
            count: 'exact',
        });
        // Apply filters
        if (req.query.is_active !== undefined) {
            query = query.eq('is_active', req.query.is_active === 'true');
        }
        if (req.query.hostel_name) {
            query = query.eq('user.hostel_name', req.query.hostel_name);
        }
        if (req.query.blood_group) {
            query = query.eq('blood_group', req.query.blood_group);
        }
        if (req.query.search) {
            // Search in related user fields
            query = query.or(`user.full_name.ilike.%${req.query.search}%,user.email.ilike.%${req.query.search}%,user.student_id.ilike.%${req.query.search}%`);
        }
        // Apply sorting and pagination
        query = query
            .order(pagination.sortBy || 'created_at', { ascending: pagination.sortOrder === 'asc' })
            .range(offset, offset + pagination.limit - 1);
        const { data: residents, error, count } = await query;
        if (error) {
            throw new middleware_1.ApiError(`Failed to fetch residents: ${error.message}`, 500);
        }
        (0, response_1.sendPaginated)(res, 'Residents retrieved successfully', residents || [], pagination, count || 0);
    }
    /**
     * Get a specific resident by ID (staff only)
     * GET /api/residents/:id
     */
    static async getById(req, res) {
        const { id } = req.params;
        const { data: resident, error } = await config_1.supabaseAdmin
            .from('residents')
            .select('*, user:users!user_id(full_name, email, phone_number, hostel_name, room_number, student_id, role, created_at)')
            .eq('id', id)
            .single();
        if (error || !resident) {
            (0, response_1.sendError)(res, 'Resident not found', 404);
            return;
        }
        (0, response_1.sendSuccess)(res, 'Resident retrieved successfully', resident);
    }
    /**
     * Get resident by user ID (staff only)
     * GET /api/residents/user/:userId
     */
    static async getByUserId(req, res) {
        const { userId } = req.params;
        const { data: resident, error } = await config_1.supabaseAdmin
            .from('residents')
            .select('*, user:users!user_id(full_name, email, phone_number, hostel_name, room_number, student_id, role, created_at)')
            .eq('user_id', userId)
            .single();
        if (error || !resident) {
            (0, response_1.sendError)(res, 'Resident profile not found for this user', 404);
            return;
        }
        (0, response_1.sendSuccess)(res, 'Resident retrieved successfully', resident);
    }
    /**
     * Update a resident (staff only)
     * PATCH /api/residents/:id
     */
    static async update(req, res) {
        const { id } = req.params;
        const user = req.user;
        const data = (0, validators_1.validate)(validators_1.updateResidentSchema, req.body);
        // Fetch existing profile
        const { data: existing, error: fetchError } = await config_1.supabaseAdmin
            .from('residents')
            .select('*')
            .eq('id', id)
            .single();
        if (fetchError || !existing) {
            (0, response_1.sendError)(res, 'Resident not found', 404);
            return;
        }
        // Update profile
        const { data: resident, error } = await config_1.supabaseAdmin
            .from('residents')
            .update(data)
            .eq('id', id)
            .select('*, user:users!user_id(full_name, email, phone_number, hostel_name, room_number)')
            .single();
        if (error) {
            throw new middleware_1.ApiError(`Failed to update resident: ${error.message}`, 500);
        }
        await services_1.AuditService.log({
            userId: user.id,
            action: 'update',
            entityType: 'resident',
            entityId: id,
            oldData: existing,
            newData: data,
            req,
        });
        (0, response_1.sendSuccess)(res, 'Resident updated successfully', resident);
    }
    /**
     * Get residents by hostel (for overview)
     * GET /api/residents/hostel/:hostelName
     */
    static async getByHostel(req, res) {
        const { hostelName } = req.params;
        const pagination = (0, response_1.parsePaginationParams)(req.query);
        const offset = (0, response_1.getOffset)(pagination.page, pagination.limit);
        const { data: residents, error, count } = await config_1.supabaseAdmin
            .from('users')
            .select('id, full_name, email, phone_number, room_number, student_id, residents!inner(*)', {
            count: 'exact',
        })
            .eq('hostel_name', hostelName)
            .eq('role', 'student')
            .eq('approval_status', 'approved')
            .range(offset, offset + pagination.limit - 1);
        if (error) {
            throw new middleware_1.ApiError(`Failed to fetch residents: ${error.message}`, 500);
        }
        (0, response_1.sendPaginated)(res, `Residents from ${hostelName} retrieved successfully`, residents || [], pagination, count || 0);
    }
}
exports.ResidentsController = ResidentsController;
exports.default = ResidentsController;
//# sourceMappingURL=residents.controller.js.map