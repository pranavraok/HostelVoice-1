'use client';

// =============================================
// LEAVE API - STUDENT FUNCTIONS
// =============================================

import { createClient } from '@/lib/supabase/client';
import type {
  StudentLeaveRequest,
  CreateStudentLeaveInput,
  UpdateStudentLeaveStatusInput,
  MarkReturnInput,
  LeaveApiResponse,
} from './types';

// Calculate days between two dates
function calculateDays(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays;
}

// =============================================
// STUDENT LEAVE API
// =============================================

export const studentLeaveApi = {
  /**
   * Create a new student leave request
   * @param input Leave request data
   * @param user Current user data (id, name, hostel, room)
   */
  async create(
    input: CreateStudentLeaveInput,
    user: { id: string; name: string; hostelName: string; roomNumber?: string }
  ): Promise<LeaveApiResponse<StudentLeaveRequest>> {
    const supabase = createClient();

    // Calculate total days
    const total_days = calculateDays(input.start_date, input.end_date);

    const { data, error } = await supabase
      .from('student_leave_requests')
      .insert({
        student_id: user.id,
        student_name: user.name,
        hostel_name: user.hostelName,
        room_number: user.roomNumber || 'N/A',
        leave_type: input.leave_type,
        start_date: input.start_date,
        end_date: input.end_date,
        total_days,
        destination: input.destination,
        contact_number: input.contact_number,
        reason: input.reason,
        document_url: input.document_url || null,
        status: 'pending',
        return_status: 'not_returned',
      })
      .select()
      .single();

    if (error) {
      console.error('[studentLeaveApi.create] Error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data as StudentLeaveRequest };
  },

  /**
   * Get all leave requests for the current student
   */
  async getMyLeaves(): Promise<LeaveApiResponse<StudentLeaveRequest[]>> {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { data, error } = await supabase
      .from('student_leave_requests')
      .select('*')
      .eq('student_id', user.id)
      .order('submitted_at', { ascending: false });

    if (error) {
      console.error('[studentLeaveApi.getMyLeaves] Error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data as StudentLeaveRequest[] };
  },

  /**
   * Get a single leave request by ID
   */
  async getById(id: string): Promise<LeaveApiResponse<StudentLeaveRequest>> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('student_leave_requests')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('[studentLeaveApi.getById] Error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data as StudentLeaveRequest };
  },

  /**
   * Mark student as returned from leave
   */
  async markReturn(
    id: string,
    input: MarkReturnInput
  ): Promise<LeaveApiResponse<StudentLeaveRequest>> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('student_leave_requests')
      .update({
        return_status: input.return_status,
        actual_return_date: input.actual_return_date,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[studentLeaveApi.markReturn] Error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data as StudentLeaveRequest };
  },
};

// =============================================
// CARETAKER - STUDENT LEAVE MANAGEMENT API
// =============================================

export const caretakerStudentLeaveApi = {
  /**
   * Get all student leave requests for the caretaker's hostel
   * @param hostelName The caretaker's assigned hostel
   */
  async getStudentLeaves(
    hostelName: string
  ): Promise<LeaveApiResponse<StudentLeaveRequest[]>> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('student_leave_requests')
      .select('*')
      .eq('hostel_name', hostelName)
      .order('submitted_at', { ascending: false });

    if (error) {
      console.error('[caretakerStudentLeaveApi.getStudentLeaves] Error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data as StudentLeaveRequest[] };
  },

  /**
   * Get pending student leave requests for the caretaker's hostel
   */
  async getPendingStudentLeaves(
    hostelName: string
  ): Promise<LeaveApiResponse<StudentLeaveRequest[]>> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('student_leave_requests')
      .select('*')
      .eq('hostel_name', hostelName)
      .eq('status', 'pending')
      .order('submitted_at', { ascending: false });

    if (error) {
      console.error('[caretakerStudentLeaveApi.getPendingStudentLeaves] Error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data as StudentLeaveRequest[] };
  },

  /**
   * Update student leave request status (approve/reject/more_info)
   */
  async updateStatus(
    id: string,
    input: UpdateStudentLeaveStatusInput,
    reviewerName: string
  ): Promise<LeaveApiResponse<StudentLeaveRequest>> {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const updateData: Record<string, unknown> = {
      status: input.status,
      reviewed_by: user.id,
      reviewed_by_name: reviewerName,
      reviewed_at: new Date().toISOString(),
    };

    if (input.caretaker_notes) {
      updateData.caretaker_notes = input.caretaker_notes;
    }

    if (input.status === 'rejected' && input.rejection_reason) {
      updateData.rejection_reason = input.rejection_reason;
    }

    const { data, error } = await supabase
      .from('student_leave_requests')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[caretakerStudentLeaveApi.updateStatus] Error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data as StudentLeaveRequest };
  },
};
