import { Request, Response, NextFunction } from 'express';

// User type matching your database schema
export type UserRole = 'student' | 'caretaker' | 'admin';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface AuthenticatedUser {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  phone_number?: string;
  approval_status: ApprovalStatus;
  
  // Student specific
  student_id?: string;
  hostel_name?: string;
  room_number?: string;
  
  // Caretaker specific
  caretaker_id?: string;
  department?: string;
  experience?: string;
  
  // Admin specific
  admin_id?: string;
  university?: string;
  position?: string;
  
  created_at: string;
  updated_at: string;
}

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      accessToken?: string;
    }
  }
}

// Issue types
export type IssueCategory = 'maintenance' | 'cleanliness' | 'security' | 'food' | 'other';
export type IssuePriority = 'low' | 'medium' | 'high' | 'urgent';
export type IssueStatus = 'pending' | 'in_progress' | 'resolved' | 'closed';

export interface Issue {
  id: string;
  title: string;
  description: string;
  category: IssueCategory;
  priority: IssuePriority;
  status: IssueStatus;
  reported_by: string;
  assigned_to?: string;
  hostel_name?: string;
  room_number?: string;
  location?: string;
  images?: string[];
  notes?: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
}

// Announcement types
export type AnnouncementCategory = 'general' | 'urgent' | 'maintenance' | 'event' | 'policy';
export type AnnouncementPriority = 'normal' | 'high' | 'urgent';
export type TargetRole = 'all' | 'student' | 'caretaker' | 'admin';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: AnnouncementCategory;
  priority: AnnouncementPriority;
  created_by: string;
  target_role?: TargetRole;
  target_hostel?: string;
  is_active: boolean;
  expires_at?: string;
  attachments?: string[];
  created_at: string;
  updated_at: string;
}

// Lost & Found types
export type LostFoundType = 'lost' | 'found';
export type LostFoundCategory = 'electronics' | 'documents' | 'clothing' | 'accessories' | 'books' | 'other';
export type LostFoundStatus = 'open' | 'claimed' | 'returned' | 'closed';

export interface LostFoundItem {
  id: string;
  item_name: string;
  description: string;
  type: LostFoundType;
  category: LostFoundCategory;
  status: LostFoundStatus;
  reported_by: string;
  claimed_by?: string;
  location_found?: string;
  location_lost?: string;
  date_found?: string;
  date_lost?: string;
  images?: string[];
  contact_info?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Notification types
export type NotificationType = 'issue' | 'announcement' | 'lost_found' | 'system' | 'approval';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  reference_id?: string;
  reference_type?: string;
  is_read: boolean;
  created_at: string;
  read_at?: string;
}

// Audit log types
export type AuditAction = 'create' | 'update' | 'delete' | 'approve' | 'reject' | 'assign' | 'merge';
export type EntityType = 'issue' | 'announcement' | 'lost_found' | 'user' | 'resident' | 'notification';

export interface AuditLog {
  id: string;
  user_id: string;
  action: AuditAction;
  entity_type: EntityType;
  entity_id: string;
  old_data?: Record<string, unknown>;
  new_data?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

// Resident types
export interface Resident {
  id: string;
  user_id: string;
  guardian_name?: string;
  guardian_phone?: string;
  guardian_email?: string;
  permanent_address?: string;
  blood_group?: string;
  medical_conditions?: string;
  emergency_contact?: string;
  check_in_date?: string;
  check_out_date?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

// Pagination params
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Analytics types
export interface IssueAnalytics {
  total_issues: number;
  pending_issues: number;
  in_progress_issues: number;
  resolved_issues: number;
  closed_issues: number;
  by_category: Record<IssueCategory, number>;
  by_priority: Record<IssuePriority, number>;
  by_hostel: Record<string, number>;
  avg_resolution_time_hours: number;
}

// Middleware types
export type AsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>;
