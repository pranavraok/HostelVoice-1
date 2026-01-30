'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CalendarIcon, CheckCircle2, AlertCircle, XCircle, FileText, Shield, ChevronLeft, ChevronRight, Users, Clock, Loader2, RefreshCw } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, differenceInDays } from 'date-fns';
import { toast } from 'sonner';
import { 
  CaretakerLeaveRequest, 
  CalendarDay,
  CaretakerInfo,
  adminCaretakerLeaveApi,
  getAllCaretakers
} from '@/lib/leave';

// Helper function to format status for display
const formatStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    'pending': 'Pending',
    'approved': 'Approved',
    'rejected': 'Rejected',
    'conditional': 'Conditionally Approved'
  };
  return statusMap[status] || status;
};

// Helper function to format leave type for display
const formatLeaveType = (type: string): string => {
  const typeMap: Record<string, string> = {
    'casual': 'Casual',
    'sick': 'Sick',
    'emergency': 'Emergency',
    'earned': 'Earned'
  };
  return typeMap[type] || type;
};

export default function AdminLeaveManagementPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('review-caretakers');
  
  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingCalendar, setIsLoadingCalendar] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [isLoadingCaretakers, setIsLoadingCaretakers] = useState(false);
  
  // Caretaker Leave Review State
  const [caretakerLeaves, setCaretakerLeaves] = useState<CaretakerLeaveRequest[]>([]);
  const [selectedCaretakerLeave, setSelectedCaretakerLeave] = useState<CaretakerLeaveRequest | null>(null);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | 'conditional' | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [assignedReplacement, setAssignedReplacement] = useState('');
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);

  // Calendar State
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [filterCaretaker, setFilterCaretaker] = useState<string>('all');
  const [calendarData, setCalendarData] = useState<CalendarDay[]>([]);

  // Caretaker list for replacement dropdown
  const [allCaretakers, setAllCaretakers] = useState<CaretakerInfo[]>([]);

  // Fetch caretaker leave requests
  const fetchCaretakerLeaves = useCallback(async () => {
    try {
      const response = await adminCaretakerLeaveApi.getAllCaretakerLeaves();
      if (response.success && response.data) {
        setCaretakerLeaves(response.data);
      } else {
        toast.error(response.error || 'Failed to fetch caretaker leave requests');
      }
    } catch (error) {
      console.error('Error fetching caretaker leaves:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Fetch calendar data
  const fetchCalendarData = useCallback(async () => {
    setIsLoadingCalendar(true);
    try {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      
      const response = await adminCaretakerLeaveApi.getCalendarData(year, month);
      
      if (response.success && response.data) {
        // Filter by block if needed
        if (filterCaretaker !== 'all') {
          const filtered = response.data.map(day => ({
            ...day,
            leaves: day.leaves.filter(leave => 
              leave.caretaker_block && leave.caretaker_block.includes(filterCaretaker)
            ),
          }));
          setCalendarData(filtered);
        } else {
          setCalendarData(response.data);
        }
      }
    } catch (error) {
      console.error('Error fetching calendar data:', error);
    } finally {
      setIsLoadingCalendar(false);
    }
  }, [currentMonth, filterCaretaker]);

  // Fetch all caretakers for replacement dropdown
  const fetchCaretakers = useCallback(async () => {
    setIsLoadingCaretakers(true);
    try {
      const response = await getAllCaretakers();
      if (response.success && response.data) {
        setAllCaretakers(response.data);
      } else {
        toast.error(response.error || 'Failed to fetch caretakers');
      }
    } catch (error) {
      console.error('Error fetching caretakers:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoadingCaretakers(false);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchCaretakerLeaves();
    fetchCaretakers();
  }, [fetchCaretakerLeaves, fetchCaretakers]);

  // Fetch calendar data when month or filter changes
  useEffect(() => {
    if (activeTab === 'calendar') {
      fetchCalendarData();
    }
  }, [fetchCalendarData, activeTab]);

  // Refresh handler
  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchCaretakerLeaves();
  };

  // Review Caretaker Leaves Functions
  const openReviewDialog = (leave: CaretakerLeaveRequest, type: 'approve' | 'reject' | 'conditional') => {
    setSelectedCaretakerLeave(leave);
    setReviewAction(type);
    setReviewNotes('');
    setAssignedReplacement(leave.replacement_suggestion || '');
    setIsReviewDialogOpen(true);
  };

  const handleReview = async () => {
    if (!selectedCaretakerLeave || !reviewAction || !user) return;
    
    setIsReviewing(true);
    try {
      const newStatus = reviewAction === 'approve' ? 'approved' : 
                        reviewAction === 'reject' ? 'rejected' : 'conditional';
      
      const response = await adminCaretakerLeaveApi.review(
        selectedCaretakerLeave.id,
        {
          status: newStatus as 'approved' | 'rejected' | 'conditional',
          admin_notes: reviewNotes || undefined,
          assigned_replacement: (reviewAction === 'approve' || reviewAction === 'conditional') ? assignedReplacement : undefined,
          rejection_reason: reviewAction === 'reject' ? reviewNotes : undefined,
        },
        user.name || 'Admin'
      );
      
      if (response.success) {
        toast.success(`Leave request ${formatStatus(newStatus).toLowerCase()} successfully`);
        fetchCaretakerLeaves();
        setIsReviewDialogOpen(false);
        setSelectedCaretakerLeave(null);
        setReviewAction(null);
        setReviewNotes('');
        setAssignedReplacement('');
      } else {
        toast.error(response.error || 'Failed to update leave request');
      }
    } catch (error) {
      console.error('Error reviewing leave:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsReviewing(false);
    }
  };

  // Calendar Functions - use API data or fallback to local calculation
  const getCalendarDays = (): CalendarDay[] => {
    if (calendarData.length > 0) {
      return calendarData;
    }
    
    // Fallback: Calculate locally from caretakerLeaves
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    return days.map(date => {
      const leavesOnDay = caretakerLeaves.filter(leave => {
        const matchesFilter = filterCaretaker === 'all' || (leave.caretaker_block && leave.caretaker_block.includes(filterCaretaker));
        const startDate = new Date(leave.start_date);
        const endDate = new Date(leave.end_date);
        return matchesFilter && leave.status === 'approved' && date >= startDate && date <= endDate;
      });

      const total = 8; // Default total caretakers
      const onLeaveCount = leavesOnDay.length;
      const available = total - onLeaveCount;

      return {
        date: date.toISOString(),
        leaves: leavesOnDay,
        totalCaretakers: total,
        availableCaretakers: available,
        onLeave: onLeaveCount,
        staffingPercentage: Math.round((available / total) * 100)
      };
    });
  };

  const getStaffingColor = (availableCaretakers: number, totalCaretakers: number) => {
    const percentage = (availableCaretakers / totalCaretakers) * 100;
    if (percentage >= 75) return '#10b981';
    if (percentage >= 50) return '#eab308';
    return '#ef4444';
  };

  const getStatusBadge = (status: string) => {
    const displayStatus = formatStatus(status);
    const styles: Record<string, { bg: string; color: string; border: string }> = {
      'pending': { bg: 'rgba(234, 179, 8, 0.1)', color: '#eab308', border: 'rgba(234, 179, 8, 0.3)' },
      'approved': { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: 'rgba(16, 185, 129, 0.3)' },
      'rejected': { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'rgba(239, 68, 68, 0.3)' },
      'conditional': { bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: 'rgba(59, 130, 246, 0.3)' }
    };
    const style = styles[status] || { bg: '#f3f4f6', color: '#6b7280', border: '#e5e7eb' };

    return (
      <Badge 
        className="gap-1 text-xs font-bold px-2 sm:px-3 py-1 border-2 whitespace-nowrap"
        style={{ background: style.bg, color: style.color, borderColor: style.border }}
      >
        {status === 'pending' && <AlertCircle className="h-3 w-3" />}
        {status === 'approved' && <CheckCircle2 className="h-3 w-3" />}
        {status === 'rejected' && <XCircle className="h-3 w-3" />}
        <span className="hidden sm:inline">{displayStatus}</span>
        <span className="sm:hidden">{status === 'conditional' ? 'Cond.' : displayStatus}</span>
      </Badge>
    );
  };

  // Helper function to get caretaker display name from ID
  const getCaretakerName = (caretakerId: string | null | undefined): string => {
    if (!caretakerId) return 'Not specified';
    const caretaker = allCaretakers.find(c => c.id === caretakerId);
    if (caretaker) {
      return `${caretaker.full_name} - ${caretaker.hostel_name}`;
    }
    return caretakerId;
  };

  const getLeaveTypeBadge = (type: string) => {
    const displayType = formatLeaveType(type);
    const styles: Record<string, { bg: string; color: string; border: string }> = {
      'emergency': { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'rgba(239, 68, 68, 0.3)' },
      'sick': { bg: 'rgba(242, 105, 24, 0.1)', color: '#f26918', border: 'rgba(242, 105, 24, 0.3)' },
      'casual': { bg: 'rgba(1, 75, 137, 0.1)', color: '#014b89', border: 'rgba(1, 75, 137, 0.3)' },
      'earned': { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: 'rgba(16, 185, 129, 0.3)' }
    };
    const style = styles[type] || { bg: 'rgba(107, 114, 128, 0.1)', color: '#6b7280', border: 'rgba(107, 114, 128, 0.3)' };

    return (
      <Badge 
        className="text-xs font-bold px-2 sm:px-3 py-1 border-2"
        style={{ background: style.bg, color: style.color, borderColor: style.border }}
      >
        {displayType}
      </Badge>
    );
  };

  const CaretakerLeaveCard = ({ leave }: { leave: CaretakerLeaveRequest }) => {
    return (
      <div className="bg-white border-2 border-gray-200 rounded-xl sm:rounded-2xl overflow-hidden mb-4 hover:shadow-lg transition-all">
        <div className="p-4 sm:p-5 md:p-6 border-b-2 border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(1, 75, 137, 0.1)' }}>
                  <Shield className="h-4 w-4" style={{ color: '#014b89' }} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base sm:text-lg font-bold truncate" style={{ color: '#014b89' }}>
                    {leave.caretaker_name || 'Unknown Caretaker'}
                  </h3>
                  <p className="text-xs text-gray-600">{leave.caretaker_block || 'Unknown Block'}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {getLeaveTypeBadge(leave.leave_type)}
              </div>
            </div>
            <div className="flex-shrink-0">
              {getStatusBadge(leave.status)}
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-5 md:p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(242, 105, 24, 0.1)' }}>
                <CalendarIcon className="h-4 w-4" style={{ color: '#f26918' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 mb-1">Leave Period</p>
                <p className="text-xs sm:text-sm text-gray-600 break-words">
                  {format(new Date(leave.start_date), 'PPP')} - {format(new Date(leave.end_date), 'PPP')}
                </p>
                <p className="text-xs font-bold mt-1" style={{ color: '#014b89' }}>
                  Duration: {leave.total_days} {leave.total_days === 1 ? 'day' : 'days'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2 sm:gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(107, 114, 128, 0.1)' }}>
                <Clock className="h-4 w-4" style={{ color: '#6b7280' }} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-900 mb-1">Submitted</p>
                <p className="text-xs sm:text-sm text-gray-600">
                  {format(new Date(leave.created_at), 'PPP')}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2 sm:gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(1, 75, 137, 0.1)' }}>
              <FileText className="h-4 w-4" style={{ color: '#014b89' }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 mb-1">Reason</p>
              <p className="text-xs sm:text-sm text-gray-600 break-words">{leave.reason}</p>
            </div>
          </div>

          <div className="flex items-start gap-2 sm:gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
              <Users className="h-4 w-4" style={{ color: '#10b981' }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 mb-1">Replacement Suggestion</p>
              <p className="text-xs sm:text-sm text-gray-600">{getCaretakerName(leave.replacement_suggestion)}</p>
            </div>
          </div>

          {leave.document_url && (
            <div>
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2 border-2 h-9 text-xs w-full sm:w-auto"
                style={{ borderColor: '#014b89', color: '#014b89' }}
                onClick={() => window.open(leave.document_url!, '_blank')}
              >
                <FileText className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">View Document</span>
              </Button>
            </div>
          )}

          {leave.reviewed_at && (
            <div className="border-t-2 border-gray-100 pt-4">
              <div className="p-3 sm:p-4 rounded-xl" style={{ background: 'rgba(1, 75, 137, 0.05)' }}>
                <p className="text-sm font-bold mb-2" style={{ color: '#014b89' }}>Review Details</p>
                <p className="text-xs sm:text-sm text-gray-700 mb-2">
                  Reviewed by <strong>{leave.reviewed_by_name || 'Admin'}</strong> on {format(new Date(leave.reviewed_at), 'PPP')}
                </p>
                
                {leave.assigned_replacement && (
                  <div className="mt-2 p-3 rounded-lg border-2" style={{ background: 'rgba(1, 75, 137, 0.05)', borderColor: 'rgba(1, 75, 137, 0.3)' }}>
                    <p className="text-xs sm:text-sm font-medium" style={{ color: '#014b89' }}>
                      <strong>Assigned Replacement:</strong> {getCaretakerName(leave.assigned_replacement)}
                    </p>
                  </div>
                )}

                {leave.admin_notes && leave.status === 'conditional' && (
                  <div className="mt-2 p-3 rounded-lg border-2" style={{ background: 'rgba(59, 130, 246, 0.05)', borderColor: 'rgba(59, 130, 246, 0.3)' }}>
                    <p className="text-xs sm:text-sm font-medium" style={{ color: '#3b82f6' }}>
                      <strong>Conditions:</strong> {leave.admin_notes}
                    </p>
                  </div>
                )}
                
                {leave.rejection_reason && leave.status === 'rejected' && (
                  <div className="mt-2 p-3 rounded-lg border-2" style={{ background: 'rgba(239, 68, 68, 0.05)', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
                    <p className="text-xs sm:text-sm font-medium" style={{ color: '#ef4444' }}>
                      <strong>Rejection Reason:</strong> {leave.rejection_reason}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {leave.status === 'pending' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-4 border-t-2 border-gray-100">
              <Button 
                onClick={() => openReviewDialog(leave, 'approve')}
                className="font-bold h-10 sm:h-11 text-xs sm:text-sm rounded-xl text-white"
                style={{ background: '#10b981' }}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Approve
              </Button>
              <Button 
                onClick={() => openReviewDialog(leave, 'conditional')}
                className="font-bold h-10 sm:h-11 text-xs sm:text-sm rounded-xl text-white"
                style={{ background: '#3b82f6' }}
              >
                Conditional
              </Button>
              <Button 
                onClick={() => openReviewDialog(leave, 'reject')}
                className="font-bold h-10 sm:h-11 text-xs sm:text-sm rounded-xl text-white"
                style={{ background: '#ef4444' }}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const pendingCaretakerLeaves = caretakerLeaves.filter(l => l.status === 'pending');
  const reviewedCaretakerLeaves = caretakerLeaves.filter(l => l.status !== 'pending');
  const calendarDays = getCalendarDays();

  if (!user) return null;

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fadeIn 0.6s ease-out; }
      `}</style>

      {/* Background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(1, 75, 137, 0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(1, 75, 137, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-4 sm:pt-6 md:pt-12 pb-12 sm:pb-16 md:pb-24 relative z-10">
        {/* Header */}
        <div className="mb-6 sm:mb-8 md:mb-12 animate-fade-in">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-1 sm:mb-2" style={{ color: '#014b89' }}>
            Admin Leave Management
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-gray-600">
            Review caretaker leave requests and manage staffing calendar
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full max-w-3xl grid-cols-2 h-11 sm:h-12 bg-gray-100">
            <TabsTrigger 
              value="review-caretakers" 
              className="gap-1 sm:gap-2 text-xs sm:text-sm font-semibold data-[state=active]:bg-white"
            >
              <Shield className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Review Caretakers</span>
              <span className="sm:hidden">Review</span>
            </TabsTrigger>
            <TabsTrigger 
              value="calendar" 
              className="gap-1 sm:gap-2 text-xs sm:text-sm font-semibold data-[state=active]:bg-white"
            >
              <CalendarIcon className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Leave Calendar</span>
              <span className="sm:hidden">Calendar</span>
            </TabsTrigger>
          </TabsList>

          {/* Review Caretaker Leaves Tab */}
          <TabsContent value="review-caretakers" className="space-y-4 sm:space-y-6 mt-0">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-lg font-bold" style={{ color: '#014b89' }}>Caretaker Leave Requests</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
            
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              {[
                { label: 'Total', value: caretakerLeaves.length, color: '#014b89' },
                { label: 'Pending', value: pendingCaretakerLeaves.length, color: '#eab308' },
                { label: 'Reviewed', value: reviewedCaretakerLeaves.length, color: '#10b981' }
              ].map((stat) => (
                <div 
                  key={stat.label}
                  className="bg-white border-2 border-gray-100 rounded-xl sm:rounded-2xl p-3 sm:p-5 md:p-6 hover:shadow-xl transition-all"
                >
                  <p className="text-[10px] sm:text-xs md:text-sm font-semibold text-gray-600 mb-1 sm:mb-2 uppercase">{stat.label}</p>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
                </div>
              ))}
            </div>

            {isLoading ? (
              <div className="bg-white border-2 border-gray-200 rounded-2xl sm:rounded-3xl shadow-lg overflow-hidden">
                <div className="p-8 sm:p-12 text-center flex flex-col items-center gap-3">
                  <Loader2 className="h-8 w-8 animate-spin" style={{ color: '#014b89' }} />
                  <p className="text-sm sm:text-base text-gray-600">Loading caretaker leave requests...</p>
                </div>
              </div>
            ) : (
            <>
            <div>
              <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4" style={{ color: '#014b89' }}>Pending Requests</h3>
              {pendingCaretakerLeaves.length === 0 ? (
                <div className="bg-white border-2 border-gray-200 rounded-2xl sm:rounded-3xl shadow-lg overflow-hidden">
                  <div className="p-8 sm:p-12 text-center">
                    <p className="text-sm sm:text-base text-gray-600">No pending caretaker leave requests</p>
                  </div>
                </div>
              ) : (
                pendingCaretakerLeaves.map(leave => (
                  <CaretakerLeaveCard key={leave.id} leave={leave} />
                ))
              )}
            </div>

            {reviewedCaretakerLeaves.length > 0 && (
              <div>
                <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4" style={{ color: '#014b89' }}>Reviewed Requests</h3>
                {reviewedCaretakerLeaves.map(leave => (
                  <CaretakerLeaveCard key={leave.id} leave={leave} />
                ))}
              </div>
            )}
            </>
            )}
          </TabsContent>

          {/* Leave Calendar Tab */}
          <TabsContent value="calendar" className="space-y-4 sm:space-y-6 mt-0">
            <div className="bg-white border-2 border-gray-100 rounded-2xl sm:rounded-3xl shadow-lg overflow-hidden">
              <div className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold truncate" style={{ color: '#014b89' }}>
                      {format(currentMonth, 'MMMM yyyy')}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600">Staff leave calendar and staffing levels</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                      className="border-2 h-9 px-3"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentMonth(new Date())}
                      className="border-2 h-9 px-3 text-xs sm:text-sm"
                    >
                      Today
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                      className="border-2 h-9 px-3"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="mb-4">
                  <Label className="text-sm font-bold mb-2 block">Filter by Block</Label>
                  <Select value={filterCaretaker} onValueChange={setFilterCaretaker}>
                    <SelectTrigger className="w-full sm:w-64 border-2 h-10 sm:h-11">
                      <SelectValue placeholder="All Blocks" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Blocks</SelectItem>
                      <SelectItem value="A">Block A</SelectItem>
                      <SelectItem value="B">Block B</SelectItem>
                      <SelectItem value="C">Block C</SelectItem>
                      <SelectItem value="D">Block D</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {isLoadingCalendar ? (
                  <div className="p-8 text-center flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin" style={{ color: '#014b89' }} />
                    <p className="text-sm text-gray-600">Loading calendar data...</p>
                  </div>
                ) : (
                <>
                <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                    <div key={idx} className="text-center text-[10px] sm:text-xs md:text-sm font-bold text-gray-700 p-1 sm:p-2">
                      <span className="hidden sm:inline">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][idx]}</span>
                      <span className="sm:hidden">{day}</span>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1 sm:gap-2">
                  {calendarDays.map((day, idx) => {
                    const dateObj = typeof day.date === 'string' ? new Date(day.date) : day.date;
                    const staffingColor = getStaffingColor(day.availableCaretakers, day.totalCaretakers);
                    const isToday = isSameDay(dateObj, new Date());
                    
                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedDate(dateObj)}
                        className="aspect-square p-1 sm:p-2 border-2 rounded-lg transition-all hover:shadow-md relative"
                        style={{
                          borderColor: isToday ? '#014b89' : '#e5e7eb',
                          backgroundColor: day.leaves.length > 0 ? `${staffingColor}15` : 'white'
                        }}
                      >
                        <div className="text-[10px] sm:text-xs md:text-sm font-bold" style={{ color: isToday ? '#014b89' : '#1f2937' }}>
                          {format(dateObj, 'd')}
                        </div>
                        {day.leaves.length > 0 && (
                          <div className="mt-0.5 sm:mt-1">
                            <div 
                              className="w-full h-0.5 sm:h-1 rounded-full"
                              style={{ backgroundColor: staffingColor }}
                            />
                            <div className="text-[8px] sm:text-[10px] font-bold mt-0.5 sm:mt-1" style={{ color: staffingColor }}>
                              {day.availableCaretakers}/{day.totalCaretakers}
                            </div>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
                </>
                )}

                <div className="mt-4 sm:mt-6 pt-4 border-t-2">
                  <h4 className="text-xs sm:text-sm font-bold mb-2 sm:mb-3" style={{ color: '#014b89' }}>Staffing Level Legend</h4>
                  <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-4 text-[10px] sm:text-xs md:text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 sm:w-4 sm:h-4 rounded flex-shrink-0" style={{ backgroundColor: '#10b981' }} />
                      <span>Good (75%+)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 sm:w-4 sm:h-4 rounded flex-shrink-0" style={{ backgroundColor: '#eab308' }} />
                      <span>Adequate (50-75%)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 sm:w-4 sm:h-4 rounded flex-shrink-0" style={{ backgroundColor: '#ef4444' }} />
                      <span>Low (&lt;50%)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {selectedDate && (
              <div className="bg-white border-2 border-gray-100 rounded-2xl sm:rounded-3xl shadow-lg overflow-hidden">
                <div className="p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-bold mb-4" style={{ color: '#014b89' }}>
                    Leaves on {format(selectedDate, 'PPP')}
                  </h3>
                  {(() => {
                    const dayData = calendarDays.find(d => {
                      const dateObj = typeof d.date === 'string' ? new Date(d.date) : d.date;
                      return isSameDay(dateObj, selectedDate);
                    });
                    const leaves = dayData?.leaves || [];
                    
                    return leaves.length === 0 ? (
                      <p className="text-sm text-gray-600">No leaves on this day</p>
                    ) : (
                      <div className="space-y-2 sm:space-y-3">
                        {leaves.map(leave => (
                          <div key={leave.id} className="p-3 sm:p-4 border-2 rounded-lg">
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <div className="min-w-0 flex-1">
                                <p className="font-bold truncate" style={{ color: '#014b89' }}>{leave.caretaker_name || 'Unknown'}</p>
                                <p className="text-xs text-gray-600">{leave.caretaker_block || 'Unknown Block'}</p>
                              </div>
                              {getLeaveTypeBadge(leave.leave_type)}
                            </div>
                            {leave.assigned_replacement && (
                              <p className="text-xs text-gray-600 mt-2">
                                Replacement: <strong>{leave.assigned_replacement}</strong>
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Review Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-lg mx-auto max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">
              {reviewAction === 'approve' && 'Approve Leave Request'}
              {reviewAction === 'reject' && 'Reject Leave Request'}
              {reviewAction === 'conditional' && 'Conditionally Approve Leave'}
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              {selectedCaretakerLeave && `${selectedCaretakerLeave.caretaker_name || 'Unknown'} - ${selectedCaretakerLeave.caretaker_block || 'Unknown Block'}`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {(reviewAction === 'approve' || reviewAction === 'conditional') && (
              <div className="space-y-2">
                <Label className="text-sm font-bold">Assign Replacement Caretaker *</Label>
                <Select value={assignedReplacement} onValueChange={setAssignedReplacement} disabled={isLoadingCaretakers}>
                  <SelectTrigger className="border-2 h-10 sm:h-11">
                    <SelectValue placeholder={isLoadingCaretakers ? "Loading caretakers..." : "Select replacement"} />
                  </SelectTrigger>
                  <SelectContent>
                    {allCaretakers
                      .filter(c => c.id !== selectedCaretakerLeave?.caretaker_id)
                      .map((caretaker) => (
                        <SelectItem key={caretaker.id} value={caretaker.id}>
                          {caretaker.full_name} - {caretaker.hostel_name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-sm font-bold">
                {reviewAction === 'approve' && 'Admin Notes (Optional)'}
                {reviewAction === 'reject' && 'Reason for Rejection *'}
                {reviewAction === 'conditional' && 'Conditions for Approval *'}
              </Label>
              <Textarea
                placeholder={
                  reviewAction === 'approve' ? 'Add any notes for this approval...' :
                  reviewAction === 'reject' ? 'Explain why this leave request is being rejected...' :
                  'Specify conditions that must be met for final approval...'
                }
                rows={4}
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                required={reviewAction !== 'approve'}
                className="border-2 border-gray-200 rounded-xl text-sm sm:text-base resize-none"
              />
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsReviewDialogOpen(false)}
              disabled={isReviewing}
              className="w-full sm:w-auto border-2 h-10 sm:h-11 text-sm sm:text-base rounded-xl"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleReview}
              disabled={
                isReviewing ||
                (reviewAction !== 'approve' && !reviewNotes) ||
                ((reviewAction === 'approve' || reviewAction === 'conditional') && !assignedReplacement)
              }
              className="w-full sm:w-auto font-bold h-10 sm:h-11 text-sm sm:text-base rounded-xl text-white"
              style={{
                background: reviewAction === 'approve' ? '#10b981' : 
                           reviewAction === 'reject' ? '#ef4444' : '#3b82f6'
              }}
            >
              {isReviewing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {reviewAction === 'approve' && 'Approve'}
                  {reviewAction === 'reject' && 'Reject'}
                  {reviewAction === 'conditional' && 'Conditionally Approve'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
