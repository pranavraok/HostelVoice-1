"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.markNotificationReadSchema = exports.signedUrlSchema = exports.rejectUserSchema = exports.approveUserSchema = exports.updateResidentSchema = exports.createResidentSchema = exports.claimLostFoundSchema = exports.createLostFoundSchema = exports.lostFoundStatusSchema = exports.lostFoundCategorySchema = exports.lostFoundTypeSchema = exports.updateAnnouncementSchema = exports.createAnnouncementSchema = exports.targetRoleSchema = exports.announcementPrioritySchema = exports.announcementCategorySchema = exports.mergeIssuesSchema = exports.assignIssueSchema = exports.updateIssueStatusSchema = exports.createIssueSchema = exports.issueStatusSchema = exports.issuePrioritySchema = exports.issueCategorySchema = exports.paginationSchema = exports.uuidSchema = void 0;
exports.validate = validate;
exports.safeValidate = safeValidate;
const zod_1 = require("zod");
// Common validators
exports.uuidSchema = zod_1.z.string().uuid('Invalid UUID format');
exports.paginationSchema = zod_1.z.object({
    page: zod_1.z.coerce.number().min(1).default(1),
    limit: zod_1.z.coerce.number().min(1).max(100).default(10),
    sortBy: zod_1.z.string().optional(),
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('desc'),
});
// Issue validators
exports.issueCategorySchema = zod_1.z.enum(['maintenance', 'cleanliness', 'security', 'food', 'other']);
exports.issuePrioritySchema = zod_1.z.enum(['low', 'medium', 'high', 'urgent']);
exports.issueStatusSchema = zod_1.z.enum(['pending', 'in_progress', 'resolved', 'closed']);
exports.createIssueSchema = zod_1.z.object({
    title: zod_1.z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title too long'),
    description: zod_1.z.string().min(10, 'Description must be at least 10 characters').max(5000, 'Description too long'),
    category: exports.issueCategorySchema,
    priority: exports.issuePrioritySchema.default('medium'),
    hostel_name: zod_1.z.string().optional(),
    room_number: zod_1.z.string().optional(),
    location: zod_1.z.string().optional(),
    images: zod_1.z.array(zod_1.z.string().url()).max(5).optional(),
});
exports.updateIssueStatusSchema = zod_1.z.object({
    status: exports.issueStatusSchema,
    notes: zod_1.z.string().max(1000).optional(),
});
exports.assignIssueSchema = zod_1.z.object({
    assigned_to: exports.uuidSchema,
    notes: zod_1.z.string().max(1000).optional(),
});
exports.mergeIssuesSchema = zod_1.z.object({
    master_issue_id: exports.uuidSchema,
    duplicate_issue_ids: zod_1.z.array(exports.uuidSchema).min(1, 'At least one duplicate issue is required'),
    merge_notes: zod_1.z.string().max(1000).optional(),
});
// Announcement validators
exports.announcementCategorySchema = zod_1.z.enum(['general', 'urgent', 'maintenance', 'event', 'policy']);
exports.announcementPrioritySchema = zod_1.z.enum(['normal', 'high', 'urgent']);
exports.targetRoleSchema = zod_1.z.enum(['all', 'student', 'caretaker', 'admin']);
exports.createAnnouncementSchema = zod_1.z.object({
    title: zod_1.z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title too long'),
    content: zod_1.z.string().min(10, 'Content must be at least 10 characters').max(10000, 'Content too long'),
    category: exports.announcementCategorySchema,
    priority: exports.announcementPrioritySchema.default('normal'),
    target_role: exports.targetRoleSchema.default('all'),
    target_hostel: zod_1.z.string().optional(),
    expires_at: zod_1.z.string().datetime().optional(),
    attachments: zod_1.z.array(zod_1.z.string().url()).max(10).optional(),
});
exports.updateAnnouncementSchema = exports.createAnnouncementSchema.partial().extend({
    is_active: zod_1.z.boolean().optional(),
});
// Lost & Found validators
exports.lostFoundTypeSchema = zod_1.z.enum(['lost', 'found']);
exports.lostFoundCategorySchema = zod_1.z.enum(['electronics', 'documents', 'clothing', 'accessories', 'books', 'other']);
exports.lostFoundStatusSchema = zod_1.z.enum(['open', 'claimed', 'returned', 'closed']);
exports.createLostFoundSchema = zod_1.z.object({
    item_name: zod_1.z.string().min(2, 'Item name must be at least 2 characters').max(100, 'Item name too long'),
    description: zod_1.z.string().min(10, 'Description must be at least 10 characters').max(2000, 'Description too long'),
    type: exports.lostFoundTypeSchema,
    category: exports.lostFoundCategorySchema,
    location_found: zod_1.z.string().max(200).optional(),
    location_lost: zod_1.z.string().max(200).optional(),
    date_found: zod_1.z.string().datetime().optional(),
    date_lost: zod_1.z.string().datetime().optional(),
    images: zod_1.z.array(zod_1.z.string().url()).max(5).optional(),
    contact_info: zod_1.z.string().max(200).optional(),
});
exports.claimLostFoundSchema = zod_1.z.object({
    notes: zod_1.z.string().max(500).optional(),
});
// Resident validators
exports.createResidentSchema = zod_1.z.object({
    guardian_name: zod_1.z.string().max(100).optional(),
    guardian_phone: zod_1.z.string().max(20).optional(),
    guardian_email: zod_1.z.string().email().optional(),
    permanent_address: zod_1.z.string().max(500).optional(),
    blood_group: zod_1.z.string().max(5).optional(),
    medical_conditions: zod_1.z.string().max(1000).optional(),
    emergency_contact: zod_1.z.string().max(20).optional(),
    check_in_date: zod_1.z.string().datetime().optional(),
});
exports.updateResidentSchema = exports.createResidentSchema.partial().extend({
    check_out_date: zod_1.z.string().datetime().optional(),
    is_active: zod_1.z.boolean().optional(),
});
// Admin validators
exports.approveUserSchema = zod_1.z.object({
    user_id: exports.uuidSchema,
});
exports.rejectUserSchema = zod_1.z.object({
    user_id: exports.uuidSchema,
    rejection_reason: zod_1.z.string().min(5, 'Reason must be at least 5 characters').max(500, 'Reason too long'),
});
// File upload validators
exports.signedUrlSchema = zod_1.z.object({
    bucket: zod_1.z.enum(['issue-images', 'lost-found-images', 'announcement-attachments', 'resident-documents']),
    filename: zod_1.z.string().min(1).max(200),
    contentType: zod_1.z.string().min(1),
});
// Notification validators
exports.markNotificationReadSchema = zod_1.z.object({
    notification_ids: zod_1.z.array(exports.uuidSchema).min(1).max(50),
});
/**
 * Validate data against a schema
 * Returns validated data or throws an error with details
 */
function validate(schema, data) {
    const result = schema.safeParse(data);
    if (!result.success) {
        const errors = result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
        throw new Error(`Validation failed: ${errors}`);
    }
    return result.data;
}
/**
 * Safe validation that returns result object instead of throwing
 */
function safeValidate(schema, data) {
    const result = schema.safeParse(data);
    if (!result.success) {
        const errors = result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
        return { success: false, error: errors };
    }
    return { success: true, data: result.data };
}
//# sourceMappingURL=validators.js.map