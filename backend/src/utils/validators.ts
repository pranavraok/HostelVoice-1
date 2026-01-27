import { z } from 'zod';

// Common validators
export const uuidSchema = z.string().uuid('Invalid UUID format');

export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Issue validators
export const issueCategorySchema = z.enum(['maintenance', 'cleanliness', 'security', 'food', 'other']);
export const issuePrioritySchema = z.enum(['low', 'medium', 'high', 'urgent']);
export const issueStatusSchema = z.enum(['pending', 'in_progress', 'resolved', 'closed']);

export const createIssueSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title too long'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(5000, 'Description too long'),
  category: issueCategorySchema,
  priority: issuePrioritySchema.default('medium'),
  hostel_name: z.string().optional(),
  room_number: z.string().optional(),
  location: z.string().optional(),
  images: z.array(z.string().url()).max(5).optional(),
});

export const updateIssueStatusSchema = z.object({
  status: issueStatusSchema,
  notes: z.string().max(1000).optional(),
});

export const assignIssueSchema = z.object({
  assigned_to: uuidSchema,
  notes: z.string().max(1000).optional(),
});

export const mergeIssuesSchema = z.object({
  master_issue_id: uuidSchema,
  duplicate_issue_ids: z.array(uuidSchema).min(1, 'At least one duplicate issue is required'),
  merge_notes: z.string().max(1000).optional(),
});

// Announcement validators
export const announcementCategorySchema = z.enum(['general', 'urgent', 'maintenance', 'event', 'policy']);
export const announcementPrioritySchema = z.enum(['normal', 'high', 'urgent']);
export const targetRoleSchema = z.enum(['all', 'student', 'caretaker', 'admin']);

export const createAnnouncementSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title too long'),
  content: z.string().min(10, 'Content must be at least 10 characters').max(10000, 'Content too long'),
  category: announcementCategorySchema,
  priority: announcementPrioritySchema.default('normal'),
  target_role: targetRoleSchema.default('all'),
  target_hostel: z.string().optional(),
  expires_at: z.string().datetime().optional(),
  attachments: z.array(z.string().url()).max(10).optional(),
});

export const updateAnnouncementSchema = createAnnouncementSchema.partial().extend({
  is_active: z.boolean().optional(),
});

// Lost & Found validators
export const lostFoundTypeSchema = z.enum(['lost', 'found']);
export const lostFoundCategorySchema = z.enum(['electronics', 'documents', 'clothing', 'accessories', 'books', 'other']);
export const lostFoundStatusSchema = z.enum(['open', 'claimed', 'returned', 'closed']);

export const createLostFoundSchema = z.object({
  item_name: z.string().min(2, 'Item name must be at least 2 characters').max(100, 'Item name too long'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000, 'Description too long'),
  type: lostFoundTypeSchema,
  category: lostFoundCategorySchema,
  location_found: z.string().max(200).optional(),
  location_lost: z.string().max(200).optional(),
  date_found: z.string().datetime().optional(),
  date_lost: z.string().datetime().optional(),
  images: z.array(z.string().url()).max(5).optional(),
  contact_info: z.string().max(200).optional(),
});

export const claimLostFoundSchema = z.object({
  notes: z.string().max(500).optional(),
});

// Resident validators
export const createResidentSchema = z.object({
  guardian_name: z.string().max(100).optional(),
  guardian_phone: z.string().max(20).optional(),
  guardian_email: z.string().email().optional(),
  permanent_address: z.string().max(500).optional(),
  blood_group: z.string().max(5).optional(),
  medical_conditions: z.string().max(1000).optional(),
  emergency_contact: z.string().max(20).optional(),
  check_in_date: z.string().datetime().optional(),
});

export const updateResidentSchema = createResidentSchema.partial().extend({
  check_out_date: z.string().datetime().optional(),
  is_active: z.boolean().optional(),
});

// Admin validators
export const approveUserSchema = z.object({
  user_id: uuidSchema,
});

export const rejectUserSchema = z.object({
  user_id: uuidSchema,
  rejection_reason: z.string().min(5, 'Reason must be at least 5 characters').max(500, 'Reason too long'),
});

// File upload validators
export const signedUrlSchema = z.object({
  bucket: z.enum(['issue-images', 'lost-found-images', 'announcement-attachments', 'resident-documents']),
  filename: z.string().min(1).max(200),
  contentType: z.string().min(1),
});

// Notification validators
export const markNotificationReadSchema = z.object({
  notification_ids: z.array(uuidSchema).min(1).max(50),
});

/**
 * Validate data against a schema
 * Returns validated data or throws an error with details
 */
export function validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
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
export function safeValidate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);
  
  if (!result.success) {
    const errors = result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
    return { success: false, error: errors };
  }
  
  return { success: true, data: result.data };
}
