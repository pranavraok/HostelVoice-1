// =============================================
// LEAVE SYSTEM - TYPE DEFINITIONS
// =============================================

// Leave Types
export type StudentLeaveType = 'Home Visit' | 'Medical' | 'Personal' | 'Emergency' | 'Academic' | 'Other';
export type CaretakerLeaveType = 'Casual' | 'Sick' | 'Emergency' | 'Earned' | 'Other';

// Status Types
export type StudentLeaveStatus = 'pending' | 'approved' | 'rejected' | 'more_info';
export type CaretakerLeaveStatus = 'pending' | 'approved' | 'conditional' | 'rejected';
export type ReturnStatus = 'not_returned' | 'returned' | 'overdue';

// =============================================
// CARETAKER DATA
// =============================================

export interface CaretakerInfo {
  id: string;
  full_name: string;
  hostel_name: string;
}

// =============================================
// STUDENT LEAVE INTERFACES
// =============================================

export interface StudentLeaveRequest {
  id: string;
  student_id: string;
  student_name: string;
  hostel_name: string;
  room_number: string;
  leave_type: StudentLeaveType;
  start_date: string; // ISO date string
  end_date: string;
  total_days: number;
  destination: string;
  contact_number: string;
  reason: string;
  document_url: string | null;
  status: StudentLeaveStatus;
  return_status: ReturnStatus;
  actual_return_date: string | null;
  caretaker_notes: string | null;
  rejection_reason: string | null;
  reviewed_by: string | null;
  reviewed_by_name: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateStudentLeaveInput {
  leave_type: StudentLeaveType;
  start_date: string;
  end_date: string;
  destination: string;
  contact_number: string;
  reason: string;
  document_url?: string;
}

export interface UpdateStudentLeaveStatusInput {
  status: StudentLeaveStatus;
  caretaker_notes?: string;
  rejection_reason?: string;
}

export interface MarkReturnInput {
  return_status: 'returned';
  actual_return_date: string;
}

// =============================================
// CARETAKER LEAVE INTERFACES
// =============================================

export interface CaretakerLeaveRequest {
  id: string;
  caretaker_id: string;
  caretaker_name: string;
  caretaker_block: string;
  leave_type: CaretakerLeaveType;
  start_date: string;
  end_date: string;
  total_days: number;
  reason: string;
  document_url: string | null;
  replacement_suggestion: string | null;
  assigned_replacement: string | null;
  status: CaretakerLeaveStatus;
  admin_notes: string | null;
  rejection_reason: string | null;
  reviewed_by: string | null;
  reviewed_by_name: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateCaretakerLeaveInput {
  leave_type: CaretakerLeaveType;
  start_date: string;
  end_date: string;
  reason: string;
  replacement_suggestion?: string;
  document_url?: string;
}

export interface ReviewCaretakerLeaveInput {
  status: CaretakerLeaveStatus;
  assigned_replacement?: string;
  admin_notes?: string;
  rejection_reason?: string;
}

// =============================================
// API RESPONSE TYPES
// =============================================

export interface LeaveApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// =============================================
// CALENDAR TYPES
// =============================================

export interface CalendarDay {
  date: string;
  leaves: CaretakerLeaveRequest[];
  totalCaretakers: number;
  availableCaretakers: number;
  onLeave: number;
  staffingPercentage: number;
}

export interface StaffingInfo {
  totalCaretakers: number;
  availableCaretakers: number;
  onLeave: number;
}
