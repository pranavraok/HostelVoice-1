'use client';

// =============================================
// LEAVE API - CARETAKER FUNCTIONS
// =============================================

import { createClient } from '@/lib/supabase/client';
import type {
  CaretakerLeaveRequest,
  CreateCaretakerLeaveInput,
  ReviewCaretakerLeaveInput,
  LeaveApiResponse,
  CalendarDay,
  StaffingInfo,
  CaretakerInfo,
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
// CARETAKER LEAVE API (Own Leaves)
// =============================================

export const caretakerLeaveApi = {
  /**
   * Create a new caretaker leave request
   */
  async create(
    input: CreateCaretakerLeaveInput,
    user: { id: string; name: string; hostelName: string }
  ): Promise<LeaveApiResponse<CaretakerLeaveRequest>> {
    const supabase = createClient();

    // Calculate total days
    const total_days = calculateDays(input.start_date, input.end_date);

    const { data, error } = await supabase
      .from('caretaker_leave_requests')
      .insert({
        caretaker_id: user.id,
        caretaker_name: user.name,
        caretaker_block: user.hostelName,
        leave_type: input.leave_type,
        start_date: input.start_date,
        end_date: input.end_date,
        total_days,
        reason: input.reason,
        replacement_suggestion: input.replacement_suggestion || null,
        document_url: input.document_url || null,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('[caretakerLeaveApi.create] Error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data as CaretakerLeaveRequest };
  },

  /**
   * Get all leave requests for the current caretaker
   */
  async getMyLeaves(): Promise<LeaveApiResponse<CaretakerLeaveRequest[]>> {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { data, error } = await supabase
      .from('caretaker_leave_requests')
      .select('*')
      .eq('caretaker_id', user.id)
      .order('submitted_at', { ascending: false });

    if (error) {
      console.error('[caretakerLeaveApi.getMyLeaves] Error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data as CaretakerLeaveRequest[] };
  },

  /**
   * Get a single leave request by ID
   */
  async getById(id: string): Promise<LeaveApiResponse<CaretakerLeaveRequest>> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('caretaker_leave_requests')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('[caretakerLeaveApi.getById] Error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data as CaretakerLeaveRequest };
  },
};

// =============================================
// ADMIN - CARETAKER LEAVE MANAGEMENT API
// =============================================

export const adminCaretakerLeaveApi = {
  /**
   * Get all caretaker leave requests (for admin)
   */
  async getAllCaretakerLeaves(): Promise<LeaveApiResponse<CaretakerLeaveRequest[]>> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('caretaker_leave_requests')
      .select('*')
      .order('submitted_at', { ascending: false });

    if (error) {
      console.error('[adminCaretakerLeaveApi.getAllCaretakerLeaves] Error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data as CaretakerLeaveRequest[] };
  },

  /**
   * Get pending caretaker leave requests (for admin)
   */
  async getPendingCaretakerLeaves(): Promise<LeaveApiResponse<CaretakerLeaveRequest[]>> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('caretaker_leave_requests')
      .select('*')
      .eq('status', 'pending')
      .order('submitted_at', { ascending: false });

    if (error) {
      console.error('[adminCaretakerLeaveApi.getPendingCaretakerLeaves] Error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data as CaretakerLeaveRequest[] };
  },

  /**
   * Review a caretaker leave request (approve/reject/conditional)
   */
  async review(
    id: string,
    input: ReviewCaretakerLeaveInput,
    reviewerName: string
  ): Promise<LeaveApiResponse<CaretakerLeaveRequest>> {
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Validate: approval requires assigned_replacement
    if (input.status === 'approved' && !input.assigned_replacement) {
      return { success: false, error: 'Approval requires an assigned replacement' };
    }

    const updateData: Record<string, unknown> = {
      status: input.status,
      reviewed_by: user.id,
      reviewed_by_name: reviewerName,
      reviewed_at: new Date().toISOString(),
    };

    if (input.assigned_replacement) {
      updateData.assigned_replacement = input.assigned_replacement;
    }

    if (input.admin_notes) {
      updateData.admin_notes = input.admin_notes;
    }

    if (input.status === 'rejected' && input.rejection_reason) {
      updateData.rejection_reason = input.rejection_reason;
    }

    const { data, error } = await supabase
      .from('caretaker_leave_requests')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[adminCaretakerLeaveApi.review] Error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data as CaretakerLeaveRequest };
  },

  /**
   * Get all available caretakers (not on leave for a date range)
   */
  async getAvailableCaretakers(
    startDate: string,
    endDate: string
  ): Promise<LeaveApiResponse<Array<{ id: string; full_name: string; hostel_name: string }>>> {
    const supabase = createClient();

    // Get all approved caretakers
    const { data: allCaretakers, error: caretakersError } = await supabase
      .from('users')
      .select('id, full_name, hostel_name')
      .eq('role', 'caretaker')
      .eq('approval_status', 'approved');

    if (caretakersError) {
      console.error('[adminCaretakerLeaveApi.getAvailableCaretakers] Error:', caretakersError);
      return { success: false, error: caretakersError.message };
    }

    // Get caretakers on leave during the date range
    const { data: onLeave, error: leaveError } = await supabase
      .from('caretaker_leave_requests')
      .select('caretaker_id')
      .in('status', ['approved', 'conditional'])
      .lte('start_date', endDate)
      .gte('end_date', startDate);

    if (leaveError) {
      console.error('[adminCaretakerLeaveApi.getAvailableCaretakers] Error:', leaveError);
      return { success: false, error: leaveError.message };
    }

    const onLeaveIds = new Set(onLeave?.map(l => l.caretaker_id) || []);
    const available = allCaretakers?.filter(c => !onLeaveIds.has(c.id)) || [];

    return { success: true, data: available };
  },

  /**
   * Get staffing info for a specific date
   */
  async getStaffingInfo(date: string): Promise<LeaveApiResponse<StaffingInfo>> {
    const supabase = createClient();

    // Get total approved caretakers
    const { count: totalCount, error: countError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'caretaker')
      .eq('approval_status', 'approved');

    if (countError) {
      console.error('[adminCaretakerLeaveApi.getStaffingInfo] Error:', countError);
      return { success: false, error: countError.message };
    }

    // Get caretakers on leave for the date
    const { data: onLeave, error: leaveError } = await supabase
      .from('caretaker_leave_requests')
      .select('caretaker_id')
      .in('status', ['approved', 'conditional'])
      .lte('start_date', date)
      .gte('end_date', date);

    if (leaveError) {
      console.error('[adminCaretakerLeaveApi.getStaffingInfo] Error:', leaveError);
      return { success: false, error: leaveError.message };
    }

    const total = totalCount || 0;
    const onLeaveCount = new Set(onLeave?.map(l => l.caretaker_id) || []).size;

    return {
      success: true,
      data: {
        totalCaretakers: total,
        availableCaretakers: total - onLeaveCount,
        onLeave: onLeaveCount,
      },
    };
  },

  /**
   * Get calendar data for a month (with leave info)
   */
  async getCalendarData(
    year: number,
    month: number
  ): Promise<LeaveApiResponse<CalendarDay[]>> {
    const supabase = createClient();

    // Calculate month start and end
    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0);

    const startStr = monthStart.toISOString().split('T')[0];
    const endStr = monthEnd.toISOString().split('T')[0];

    // Get total caretakers
    const { count: totalCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'caretaker')
      .eq('approval_status', 'approved');

    const total = totalCount || 0;

    // Get all approved leaves that overlap with the month
    const { data: leaves, error } = await supabase
      .from('caretaker_leave_requests')
      .select('*')
      .in('status', ['approved', 'conditional'])
      .lte('start_date', endStr)
      .gte('end_date', startStr);

    if (error) {
      console.error('[adminCaretakerLeaveApi.getCalendarData] Error:', error);
      return { success: false, error: error.message };
    }

    // Build calendar days
    const calendarDays: CalendarDay[] = [];
    const current = new Date(monthStart);

    while (current <= monthEnd) {
      const dateStr = current.toISOString().split('T')[0];
      
      // Find leaves that include this date
      const leavesOnDate = (leaves || []).filter(leave => {
        const leaveStart = new Date(leave.start_date);
        const leaveEnd = new Date(leave.end_date);
        const currentDate = new Date(dateStr);
        return currentDate >= leaveStart && currentDate <= leaveEnd;
      });

      const onLeaveCount = new Set(leavesOnDate.map(l => l.caretaker_id)).size;
      const available = total - onLeaveCount;
      const staffingPercentage = total > 0 ? (available / total) * 100 : 100;

      calendarDays.push({
        date: dateStr,
        leaves: leavesOnDate as CaretakerLeaveRequest[],
        totalCaretakers: total,
        availableCaretakers: available,
        onLeave: onLeaveCount,
        staffingPercentage,
      });

      current.setDate(current.getDate() + 1);
    }

    return { success: true, data: calendarDays };
  },
};

// =============================================
// SHARED CARETAKER DATA FETCHING
// =============================================

/**
 * Get all caretakers from the database
 * Used for replacement caretaker dropdowns
 */
export async function getAllCaretakers(): Promise<LeaveApiResponse<CaretakerInfo[]>> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('users')
    .select('id, full_name, hostel_name')
    .eq('role', 'caretaker')
    .order('hostel_name', { ascending: true })
    .order('full_name', { ascending: true });

  if (error) {
    console.error('[getAllCaretakers] Error:', error);
    return { success: false, error: error.message };
  }

  return { 
    success: true, 
    data: (data as CaretakerInfo[]).map(c => ({
      id: c.id,
      full_name: c.full_name,
      hostel_name: c.hostel_name || 'N/A'
    }))
  };
}
