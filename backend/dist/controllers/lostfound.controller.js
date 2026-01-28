"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LostFoundController = void 0;
const config_1 = require("../config");
const response_1 = require("../utils/response");
const validators_1 = require("../utils/validators");
const services_1 = require("../services");
const middleware_1 = require("../middleware");
/**
 * Lost & Found Controller
 * Handles all lost and found item operations
 */
class LostFoundController {
    /**
     * Report a lost or found item
     * POST /api/lostfound
     */
    static async report(req, res) {
        const user = req.user;
        const data = (0, validators_1.validate)(validators_1.createLostFoundSchema, req.body);
        // Create lost/found item
        const itemData = {
            ...data,
            reported_by: user.id,
            status: 'open',
        };
        const { data: item, error } = await config_1.supabaseAdmin
            .from('lost_found')
            .insert(itemData)
            .select('*, reporter:users!reported_by(full_name, email, phone_number)')
            .single();
        if (error) {
            throw new middleware_1.ApiError(`Failed to report item: ${error.message}`, 500);
        }
        // Create audit log
        await services_1.AuditService.logLostFoundAction(user, 'create', item.id, itemData, req);
        // If found item, check for matching lost items and notify
        if (data.type === 'found') {
            await LostFoundController.checkForMatches(item);
        }
        (0, response_1.sendCreated)(res, `${data.type === 'lost' ? 'Lost' : 'Found'} item reported successfully`, item);
    }
    /**
     * Check for potential matches when a found item is reported
     */
    static async checkForMatches(foundItem) {
        // Find open lost items in the same category
        const { data: potentialMatches } = await config_1.supabaseAdmin
            .from('lost_found')
            .select('id, reported_by, item_name')
            .eq('type', 'lost')
            .eq('status', 'open')
            .eq('category', foundItem.category)
            .limit(10);
        if (potentialMatches && potentialMatches.length > 0) {
            // Notify each potential match owner
            for (const match of potentialMatches) {
                await services_1.NotificationService.notifyLostItemMatch(match.reported_by, foundItem.id, foundItem.item_name);
            }
        }
    }
    /**
     * Get open lost and found items
     * GET /api/lostfound
     */
    static async getOpen(req, res) {
        const pagination = (0, response_1.parsePaginationParams)(req.query);
        const offset = (0, response_1.getOffset)(pagination.page, pagination.limit);
        let query = config_1.supabaseAdmin
            .from('lost_found')
            .select('*, reporter:users!reported_by(full_name, email, phone_number)', { count: 'exact' })
            .eq('status', 'open');
        // Apply filters
        if (req.query.type) {
            query = query.eq('type', req.query.type);
        }
        if (req.query.category) {
            query = query.eq('category', req.query.category);
        }
        if (req.query.search) {
            query = query.or(`item_name.ilike.%${req.query.search}%,description.ilike.%${req.query.search}%`);
        }
        // Apply sorting and pagination
        query = query
            .order('created_at', { ascending: false })
            .range(offset, offset + pagination.limit - 1);
        const { data: items, error, count } = await query;
        if (error) {
            throw new middleware_1.ApiError(`Failed to fetch items: ${error.message}`, 500);
        }
        (0, response_1.sendPaginated)(res, 'Items retrieved successfully', items || [], pagination, count || 0);
    }
    /**
     * Get user's own lost and found reports
     * GET /api/lostfound/my
     */
    static async getMyItems(req, res) {
        const user = req.user;
        const pagination = (0, response_1.parsePaginationParams)(req.query);
        const offset = (0, response_1.getOffset)(pagination.page, pagination.limit);
        let query = config_1.supabaseAdmin
            .from('lost_found')
            .select('*, reporter:users!reported_by(full_name, email), claimer:users!claimed_by(full_name, email)', {
            count: 'exact',
        })
            .eq('reported_by', user.id);
        // Apply filters
        if (req.query.type) {
            query = query.eq('type', req.query.type);
        }
        if (req.query.status) {
            query = query.eq('status', req.query.status);
        }
        // Apply sorting and pagination
        query = query
            .order('created_at', { ascending: false })
            .range(offset, offset + pagination.limit - 1);
        const { data: items, error, count } = await query;
        if (error) {
            throw new middleware_1.ApiError(`Failed to fetch items: ${error.message}`, 500);
        }
        (0, response_1.sendPaginated)(res, 'Items retrieved successfully', items || [], pagination, count || 0);
    }
    /**
     * Get a single item by ID
     * GET /api/lostfound/:id
     */
    static async getById(req, res) {
        const { id } = req.params;
        const { data: item, error } = await config_1.supabaseAdmin
            .from('lost_found')
            .select('*, reporter:users!reported_by(full_name, email, phone_number), claimer:users!claimed_by(full_name, email, phone_number)')
            .eq('id', id)
            .single();
        if (error || !item) {
            (0, response_1.sendError)(res, 'Item not found', 404);
            return;
        }
        (0, response_1.sendSuccess)(res, 'Item retrieved successfully', item);
    }
    /**
     * Claim an item
     * PATCH /api/lostfound/:id/claim
     */
    static async claim(req, res) {
        const { id } = req.params;
        const user = req.user;
        const data = (0, validators_1.validate)(validators_1.claimLostFoundSchema, req.body);
        // Fetch item
        const { data: item, error: fetchError } = await config_1.supabaseAdmin
            .from('lost_found')
            .select('*, reporter:users!reported_by(full_name)')
            .eq('id', id)
            .single();
        if (fetchError || !item) {
            (0, response_1.sendError)(res, 'Item not found', 404);
            return;
        }
        if (item.status !== 'open') {
            (0, response_1.sendError)(res, 'This item is no longer available for claiming', 400);
            return;
        }
        // Can't claim your own item
        if (item.reported_by === user.id) {
            (0, response_1.sendError)(res, 'You cannot claim your own reported item', 400);
            return;
        }
        // Update item
        const { data: updatedItem, error } = await config_1.supabaseAdmin
            .from('lost_found')
            .update({
            claimed_by: user.id,
            status: 'claimed',
            notes: data.notes
                ? `${item.notes || ''}\n\n[Claim Notes - ${new Date().toISOString()}]\n${data.notes}`
                : item.notes,
        })
            .eq('id', id)
            .select('*, reporter:users!reported_by(full_name, email, phone_number), claimer:users!claimed_by(full_name, email, phone_number)')
            .single();
        if (error) {
            throw new middleware_1.ApiError(`Failed to claim item: ${error.message}`, 500);
        }
        // Create audit log
        await services_1.AuditService.logLostFoundAction(user, 'update', id, { claimed_by: user.id, status: 'claimed' }, req);
        // Notify reporter
        await services_1.NotificationService.notifyItemClaimed(item.reported_by, id, item.item_name, user.full_name);
        (0, response_1.sendSuccess)(res, 'Item claimed successfully', updatedItem);
    }
    /**
     * Close an item (mark as returned or resolved)
     * PATCH /api/lostfound/:id/close
     */
    static async close(req, res) {
        const { id } = req.params;
        const user = req.user;
        const { status = 'returned', notes } = req.body;
        // Validate status
        if (!['returned', 'closed'].includes(status)) {
            (0, response_1.sendError)(res, 'Invalid status. Must be "returned" or "closed"', 400);
            return;
        }
        // Fetch item
        const { data: item, error: fetchError } = await config_1.supabaseAdmin
            .from('lost_found')
            .select('*')
            .eq('id', id)
            .single();
        if (fetchError || !item) {
            (0, response_1.sendError)(res, 'Item not found', 404);
            return;
        }
        // Check permission: reporter or staff can close
        if (item.reported_by !== user.id && user.role === 'student') {
            (0, response_1.sendError)(res, 'Access denied. Only the reporter or staff can close this item.', 403);
            return;
        }
        // Update item
        const { data: updatedItem, error } = await config_1.supabaseAdmin
            .from('lost_found')
            .update({
            status,
            notes: notes
                ? `${item.notes || ''}\n\n[Closed - ${new Date().toISOString()}]\n${notes}`
                : item.notes,
        })
            .eq('id', id)
            .select('*, reporter:users!reported_by(full_name, email), claimer:users!claimed_by(full_name, email)')
            .single();
        if (error) {
            throw new middleware_1.ApiError(`Failed to close item: ${error.message}`, 500);
        }
        // Create audit log
        await services_1.AuditService.logLostFoundAction(user, 'update', id, { status }, req);
        (0, response_1.sendSuccess)(res, 'Item closed successfully', updatedItem);
    }
    /**
     * Get all items (staff view)
     * GET /api/lostfound/all
     */
    static async getAll(req, res) {
        const pagination = (0, response_1.parsePaginationParams)(req.query);
        const offset = (0, response_1.getOffset)(pagination.page, pagination.limit);
        let query = config_1.supabaseAdmin
            .from('lost_found')
            .select('*, reporter:users!reported_by(full_name, email), claimer:users!claimed_by(full_name, email)', {
            count: 'exact',
        });
        // Apply filters
        if (req.query.type) {
            query = query.eq('type', req.query.type);
        }
        if (req.query.status) {
            query = query.eq('status', req.query.status);
        }
        if (req.query.category) {
            query = query.eq('category', req.query.category);
        }
        if (req.query.search) {
            query = query.or(`item_name.ilike.%${req.query.search}%,description.ilike.%${req.query.search}%`);
        }
        // Apply sorting and pagination
        query = query
            .order(pagination.sortBy || 'created_at', { ascending: pagination.sortOrder === 'asc' })
            .range(offset, offset + pagination.limit - 1);
        const { data: items, error, count } = await query;
        if (error) {
            throw new middleware_1.ApiError(`Failed to fetch items: ${error.message}`, 500);
        }
        (0, response_1.sendPaginated)(res, 'Items retrieved successfully', items || [], pagination, count || 0);
    }
}
exports.LostFoundController = LostFoundController;
exports.default = LostFoundController;
//# sourceMappingURL=lostfound.controller.js.map