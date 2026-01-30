'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CalendarIcon, Upload, CheckCircle2, AlertCircle, XCircle, Clock, MapPin, Phone, FileText, PlusCircle, List, MessageSquare, User, Loader2, RefreshCw } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { toast } from 'sonner';
import { 
  StudentLeaveRequest, 
  CaretakerLeaveRequest,
  CaretakerInfo,
  caretakerStudentLeaveApi,
  caretakerLeaveApi,
  getAllCaretakers
} from '@/lib/leave';

// Helper function to format status for display
const formatStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    'pending': 'Pending',
    'approved': 'Approved',
    'rejected': 'Rejected',
    'more_info_needed': 'More Info Needed'
  };
  return statusMap[status] || status;
};

export default function CaretakerLeavePage() {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('review-students');
  
  // Loading states
  const [isLoadingStudentLeaves, setIsLoadingStudentLeaves] = useState(true);
  const [isLoadingMyLeaves, setIsLoadingMyLeaves] = useState(true);
  const [isRefreshingStudentLeaves, setIsRefreshingStudentLeaves] = useState(false);
  const [isRefreshingMyLeaves, setIsRefreshingMyLeaves] = useState(false);
  const [isLoadingCaretakers, setIsLoadingCaretakers] = useState(false);
  
  // Student Leave Review State
  const [studentLeaves, setStudentLeaves] = useState<StudentLeaveRequest[]>([]);
  const [selectedStudentLeave, setSelectedStudentLeave] = useState<StudentLeaveRequest | null>(null);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | 'moreinfo' | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);

  // Apply Leave State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [applyFormData, setApplyFormData] = useState({
    leaveType: '',
    reason: '',
    replacementCaretaker: '',
    document: null as File | null
  });

  // My Leaves State
  const [myLeaves, setMyLeaves] = useState<CaretakerLeaveRequest[]>([]);
  const [selectedMyLeave, setSelectedMyLeave] = useState<CaretakerLeaveRequest | null>(null);
  const [isMyLeaveDialogOpen, setIsMyLeaveDialogOpen] = useState(false);

  // Caretaker list for replacement dropdown
  const [allCaretakers, setAllCaretakers] = useState<CaretakerInfo[]>([]);

  // Fetch student leaves for caretaker's hostel
  const fetchStudentLeaves = useCallback(async () => {
    if (!user?.hostelName) return;
    
    try {
      const response = await caretakerStudentLeaveApi.getStudentLeaves(user.hostelName);
      if (response.success && response.data) {
        setStudentLeaves(response.data);
      } else {
        toast.error(response.error || 'Failed to fetch student leave requests');
      }
    } catch (error) {
      console.error('Error fetching student leaves:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoadingStudentLeaves(false);
      setIsRefreshingStudentLeaves(false);
    }
  }, [user?.hostelName]);

  // Fetch caretaker's own leave requests
  const fetchMyLeaves = useCallback(async () => {
    try {
      const response = await caretakerLeaveApi.getMyLeaves();
      if (response.success && response.data) {
        setMyLeaves(response.data);
      } else {
        toast.error(response.error || 'Failed to fetch your leave requests');
      }
    } catch (error) {
      console.error('Error fetching my leaves:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoadingMyLeaves(false);
      setIsRefreshingMyLeaves(false);
    }
  }, []);

  // Fetch all caretakers for replacement dropdown
  const fetchCaretakers = useCallback(async () => {
    setIsLoadingCaretakers(true);
    try {
      const response = await getAllCaretakers();
      if (response.success && response.data) {
        // Exclude current user from the list
        const filtered = response.data.filter(c => c.id !== user?.id);
        setAllCaretakers(filtered);
      } else {
        toast.error(response.error || 'Failed to fetch caretakers');
      }
    } catch (error) {
      console.error('Error fetching caretakers:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoadingCaretakers(false);
    }
  }, [user?.id]);

  // Initial data fetch
  useEffect(() => {
    fetchStudentLeaves();
    fetchMyLeaves();
    fetchCaretakers();
  }, [fetchStudentLeaves, fetchMyLeaves, fetchCaretakers]);

  // Refresh handlers
  const handleRefreshStudentLeaves = () => {
    setIsRefreshingStudentLeaves(true);
    fetchStudentLeaves();
  };

  const handleRefreshMyLeaves = () => {
    setIsRefreshingMyLeaves(true);
    fetchMyLeaves();
  };

  // Review Functions
  const openReviewDialog = (leave: StudentLeaveRequest, type: 'approve' | 'reject' | 'moreinfo') => {
    setSelectedStudentLeave(leave);
    setReviewAction(type);
    setReviewNotes('');
    setIsReviewDialogOpen(true);
  };

  const handleReview = async () => {
    if (!selectedStudentLeave || !reviewAction || !user) return;
    
    setIsReviewing(true);
    try {
      const newStatus = reviewAction === 'approve' ? 'approved' : 
                        reviewAction === 'reject' ? 'rejected' : 'more_info';
      
      const response = await caretakerStudentLeaveApi.updateStatus(
        selectedStudentLeave.id,
        {
          status: newStatus as 'approved' | 'rejected' | 'more_info',
          caretaker_notes: reviewAction === 'approve' ? reviewNotes : undefined,
          rejection_reason: reviewAction === 'reject' ? reviewNotes : undefined,
        },
        user.name || 'Caretaker'
      );
      
      if (response.success) {
        toast.success(`Leave request ${reviewAction === 'approve' ? 'approved' : reviewAction === 'reject' ? 'rejected' : 'marked for more info'} successfully`);
        fetchStudentLeaves();
        setIsReviewDialogOpen(false);
        setSelectedStudentLeave(null);
        setReviewAction(null);
        setReviewNotes('');
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

  // Helper function to get caretaker display name from ID
  const getCaretakerName = (caretakerId: string | null | undefined): string => {
    if (!caretakerId) return 'Not specified';
    const caretaker = allCaretakers.find(c => c.id === caretakerId);
    if (caretaker) {
      return `${caretaker.full_name} - ${caretaker.hostel_name}`;
    }
    return caretakerId;
  };

  const calculateDays = () => {
    if (startDate && endDate) {
      return differenceInDays(endDate, startDate) + 1;
    }
    return 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!startDate || !endDate || !user) {
      toast.error('Please select start and end dates');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const response = await caretakerLeaveApi.create(
        {
          leave_type: applyFormData.leaveType as 'Casual' | 'Sick' | 'Emergency' | 'Earned' | 'Other',
          start_date: format(startDate, 'yyyy-MM-dd'),
          end_date: format(endDate, 'yyyy-MM-dd'),
          reason: applyFormData.reason,
          replacement_suggestion: applyFormData.replacementCaretaker
        },
        {
          id: user.id,
          name: user.name || 'Unknown',
          hostelName: user.hostelName || 'Unknown'
        }
      );
      
      if (response.success) {
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
          setActiveTab('my-status');
          setApplyFormData({ leaveType: '', reason: '', replacementCaretaker: '', document: null });
          setStartDate(undefined);
          setEndDate(undefined);
          fetchMyLeaves();
        }, 2000);
      } else {
        toast.error(response.error || 'Failed to submit leave request');
      }
    } catch (error) {
      console.error('Error submitting leave:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const displayStatus = formatStatus(status);
    const styles: Record<string, { bg: string; color: string; border: string }> = {
      'pending': { bg: 'rgba(234, 179, 8, 0.1)', color: '#eab308', border: 'rgba(234, 179, 8, 0.3)' },
      'approved': { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: 'rgba(16, 185, 129, 0.3)' },
      'rejected': { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'rgba(239, 68, 68, 0.3)' },
      'more_info_needed': { bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: 'rgba(59, 130, 246, 0.3)' },
      'conditional': { bg: 'rgba(168, 85, 247, 0.1)', color: '#a855f7', border: 'rgba(168, 85, 247, 0.3)' }
    };
    const style = styles[status] || { bg: '#f3f4f6', color: '#6b7280', border: '#e5e7eb' };
    return (
      <Badge className="gap-1 text-xs font-bold px-2 sm:px-3 py-1 border-2 whitespace-nowrap" style={{ background: style.bg, color: style.color, borderColor: style.border }}>
        {status === 'pending' && <AlertCircle className="h-3 w-3" />}
        {status === 'approved' && <CheckCircle2 className="h-3 w-3" />}
        {status === 'rejected' && <XCircle className="h-3 w-3" />}
        <span className="hidden sm:inline">{displayStatus}</span>
        <span className="sm:hidden">{status === 'more_info_needed' ? 'Info' : displayStatus}</span>
      </Badge>
    );
  };

  const pendingStudentLeaves = studentLeaves.filter(l => l.status === 'pending');
  const reviewedStudentLeaves = studentLeaves.filter(l => l.status !== 'pending');

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
            Caretaker Leave Management
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-gray-600">
            Review student leaves, apply for your leave, and track your leave status
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full max-w-3xl grid-cols-3 h-11 sm:h-12 bg-gray-100">
            <TabsTrigger value="review-students" className="gap-1 sm:gap-2 text-[10px] sm:text-xs md:text-sm font-semibold data-[state=active]:bg-white px-1 sm:px-3">
              <List className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Review Students</span>
              <span className="sm:hidden">Review</span>
            </TabsTrigger>
            <TabsTrigger value="apply" className="gap-1 sm:gap-2 text-[10px] sm:text-xs md:text-sm font-semibold data-[state=active]:bg-white px-1 sm:px-3">
              <PlusCircle className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Apply for Leave</span>
              <span className="sm:hidden">Apply</span>
            </TabsTrigger>
            <TabsTrigger value="my-status" className="gap-1 sm:gap-2 text-[10px] sm:text-xs md:text-sm font-semibold data-[state=active]:bg-white px-1 sm:px-3">
              <User className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">My Status</span>
              <span className="sm:hidden">Status</span>
            </TabsTrigger>
          </TabsList>

          {/* Review Student Leaves */}
          <TabsContent value="review-students" className="space-y-4 sm:space-y-6 mt-0">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-lg font-bold" style={{ color: '#014b89' }}>Student Leave Requests</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshStudentLeaves}
                disabled={isRefreshingStudentLeaves}
                className="gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshingStudentLeaves ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
            
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              {[
                { label: 'Total', value: studentLeaves.length, color: '#014b89' },
                { label: 'Pending', value: pendingStudentLeaves.length, color: '#eab308' },
                { label: 'Reviewed', value: reviewedStudentLeaves.length, color: '#10b981' }
              ].map((stat) => (
                <div 
                  key={stat.label}
                  className="bg-white border-2 border-gray-100 rounded-xl sm:rounded-2xl p-3 sm:p-5 md:p-6 hover:shadow-xl transition-all"
                >
                  <p className="text-[10px] sm:text-xs md:text-sm font-semibold text-gray-600 mb-1 sm:mb-2 uppercase truncate">{stat.label}</p>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
                </div>
              ))}
            </div>

            {isLoadingStudentLeaves ? (
              <div className="bg-white border-2 border-gray-200 rounded-2xl sm:rounded-3xl shadow-lg overflow-hidden">
                <div className="p-8 sm:p-12 text-center flex flex-col items-center gap-3">
                  <Loader2 className="h-8 w-8 animate-spin" style={{ color: '#014b89' }} />
                  <p className="text-sm sm:text-base text-gray-600">Loading student leave requests...</p>
                </div>
              </div>
            ) : (
            <div>
              <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4" style={{ color: '#014b89' }}>Pending Leave Requests</h3>
              {pendingStudentLeaves.length === 0 ? (
                <div className="bg-white border-2 border-gray-200 rounded-2xl sm:rounded-3xl shadow-lg overflow-hidden">
                  <div className="p-8 sm:p-12 text-center">
                    <p className="text-sm sm:text-base text-gray-600">No pending leave requests</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingStudentLeaves.map((leave) => (
                    <div key={leave.id} className="bg-white border-2 border-gray-200 rounded-xl sm:rounded-2xl overflow-hidden hover:shadow-lg transition-all">
                      <div className="p-4 sm:p-5 md:p-6 border-b-2 border-gray-100">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(1, 75, 137, 0.1)' }}>
                                <User className="h-4 w-4" style={{ color: '#014b89' }} />
                              </div>
                              <div className="min-w-0 flex-1">
                                <h3 className="text-base sm:text-lg font-bold truncate" style={{ color: '#014b89' }}>
                                  {leave.student_name || 'Unknown Student'}
                                </h3>
                                <p className="text-xs text-gray-600">Room {leave.room_number || 'N/A'} • {formatStatus(leave.leave_type)}</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            {getStatusBadge(leave.status)}
                          </div>
                        </div>
                      </div>

                      <div className="p-4 sm:p-5 md:p-6 space-y-4">
                        <div className="space-y-3">
                          <div className="flex items-start gap-2 sm:gap-3">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(242, 105, 24, 0.1)' }}>
                              <CalendarIcon className="h-4 w-4" style={{ color: '#f26918' }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs sm:text-sm text-gray-600 break-words">
                                {format(new Date(leave.start_date), 'PPP')} - {format(new Date(leave.end_date), 'PPP')}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-2 sm:gap-3">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
                              <MapPin className="h-4 w-4" style={{ color: '#10b981' }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs sm:text-sm text-gray-600 break-words">{leave.destination}</p>
                            </div>
                          </div>

                          <div className="flex items-start gap-2 sm:gap-3">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(59, 130, 246, 0.1)' }}>
                              <Phone className="h-4 w-4" style={{ color: '#3b82f6' }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs sm:text-sm text-gray-600">{leave.contact_number}</p>
                            </div>
                          </div>
                        </div>

                        <div className="pt-3 border-t-2 border-gray-100">
                          <p className="text-sm font-bold text-gray-900 mb-1">Reason:</p>
                          <p className="text-xs sm:text-sm text-gray-600 break-words">{leave.reason}</p>
                        </div>

                        {leave.document_url && (
                          <div className="flex items-center gap-2 text-xs sm:text-sm">
                            <FileText className="h-4 w-4 flex-shrink-0" style={{ color: '#014b89' }} />
                            <a href={leave.document_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">
                              View Document
                            </a>
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
                              onClick={() => openReviewDialog(leave, 'moreinfo')}
                              className="font-bold h-10 sm:h-11 text-xs sm:text-sm rounded-xl border-2"
                              variant="outline"
                              style={{ borderColor: '#3b82f6', color: '#3b82f6' }}
                            >
                              <MessageSquare className="h-4 w-4 mr-2" />
                              More Info
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
                  ))}
                </div>
              )}
            </div>
            )}

            {!isLoadingStudentLeaves && reviewedStudentLeaves.length > 0 && (
              <div>
                <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4" style={{ color: '#014b89' }}>Reviewed Requests</h3>
                <div className="space-y-4">
                  {reviewedStudentLeaves.map((leave) => (
                    <div key={leave.id} className="bg-white border-2 border-gray-200 rounded-xl sm:rounded-2xl overflow-hidden hover:shadow-lg transition-all">
                      <div className="p-4 sm:p-5 md:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base sm:text-lg font-bold truncate" style={{ color: '#014b89' }}>{leave.student_name || 'Unknown Student'}</h3>
                            <p className="text-xs sm:text-sm text-gray-600">Room {leave.room_number || 'N/A'}</p>
                          </div>
                          {getStatusBadge(leave.status)}
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600">
                          {format(new Date(leave.start_date), 'PPP')} - {format(new Date(leave.end_date), 'PPP')}
                        </p>
                        {leave.reviewed_at && (
                          <p className="text-xs text-gray-500 mt-2">
                            Reviewed on {format(new Date(leave.reviewed_at), 'PPP')} by {leave.reviewed_by_name || 'Caretaker'}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Apply for Leave */}
          <TabsContent value="apply" className="mt-0">
            {isSuccess ? (
              <div className="bg-white border-2 border-gray-200 rounded-2xl sm:rounded-3xl shadow-lg overflow-hidden">
                <div className="p-8 sm:p-12 text-center space-y-4">
                  <div className="flex justify-center">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
                      <CheckCircle2 className="h-8 w-8 sm:h-10 sm:w-10" style={{ color: '#10b981' }} />
                    </div>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold" style={{ color: '#014b89' }}>Leave Request Submitted!</h3>
                  <p className="text-sm sm:text-base text-gray-600">
                    Your leave request has been submitted successfully. The admin will review it shortly.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-white border-2 border-gray-100 rounded-2xl sm:rounded-3xl shadow-lg overflow-hidden">
                <div className="p-4 sm:p-6 md:p-8">
                  <h2 className="text-xl sm:text-2xl font-bold mb-2" style={{ color: '#014b89' }}>Apply for Leave</h2>
                  <p className="text-sm sm:text-base text-gray-600 mb-6">
                    Submit your leave request for admin approval
                  </p>

                  <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-bold">Leave Type *</Label>
                      <Select
                        value={applyFormData.leaveType}
                        onValueChange={(value) =>
                          setApplyFormData({ ...applyFormData, leaveType: value })
                        }
                      >
                        <SelectTrigger className="border-2 h-10 sm:h-11">
                          <SelectValue placeholder="Select leave type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Casual">Casual Leave</SelectItem>
                          <SelectItem value="Sick">Sick Leave</SelectItem>
                          <SelectItem value="Emergency">Emergency Leave</SelectItem>
                          <SelectItem value="Earned">Earned Leave</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-bold">Start Date *</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal border-2 h-10 sm:h-11"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {startDate ? format(startDate, 'PPP') : 'Pick a date'}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={startDate}
                              onSelect={setStartDate}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-bold">End Date *</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal border-2 h-10 sm:h-11"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {endDate ? format(endDate, 'PPP') : 'Pick a date'}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={endDate}
                              onSelect={setEndDate}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>

                    {startDate && endDate && (
                      <div className="p-3 sm:p-4 rounded-xl border-2" style={{ background: 'rgba(1, 75, 137, 0.05)', borderColor: 'rgba(1, 75, 137, 0.3)' }}>
                        <p className="text-sm font-bold" style={{ color: '#014b89' }}>
                          Total Days: <strong>{calculateDays()}</strong>
                        </p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label className="text-sm font-bold">Reason for Leave *</Label>
                      <Textarea
                        placeholder="Provide detailed reason for your leave"
                        rows={4}
                        value={applyFormData.reason}
                        onChange={(e) =>
                          setApplyFormData({ ...applyFormData, reason: e.target.value })
                        }
                        className="border-2 rounded-xl text-sm sm:text-base resize-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-bold">Replacement Caretaker Suggestion *</Label>
                      <Select
                        value={applyFormData.replacementCaretaker}
                        onValueChange={(value) =>
                          setApplyFormData({ ...applyFormData, replacementCaretaker: value })
                        }
                        disabled={isLoadingCaretakers}
                      >
                        <SelectTrigger className="border-2 h-10 sm:h-11">
                          <SelectValue placeholder={isLoadingCaretakers ? "Loading caretakers..." : "Suggest replacement"} />
                        </SelectTrigger>
                        <SelectContent>
                          {allCaretakers.map((caretaker) => (
                            <SelectItem key={caretaker.id} value={caretaker.id}>
                              {caretaker.full_name} - {caretaker.hostel_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-bold">Supporting Document (if required)</Label>
                      <Input
                        type="file"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          setApplyFormData({ ...applyFormData, document: file });
                        }}
                        className="border-2 h-10 sm:h-11 text-sm sm:text-base"
                      />
                      <p className="text-xs text-gray-500">
                        Upload medical certificate for sick leave
                      </p>
                    </div>

                    <Button
                      type="submit"
                      className="w-full font-bold h-10 sm:h-11 text-sm sm:text-base rounded-xl text-white"
                      disabled={
                        isSubmitting ||
                        !applyFormData.leaveType ||
                        !startDate ||
                        !endDate ||
                        !applyFormData.reason ||
                        !applyFormData.replacementCaretaker
                      }
                      style={{ background: '#014b89' }}
                    >
                      {isSubmitting ? (
                        <>
                          <Clock className="mr-2 h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Submit Leave Request
                        </>
                      )}
                    </Button>
                  </form>
                </div>
              </div>
            )}
          </TabsContent>

          {/* My Status */}
          <TabsContent value="my-status" className="space-y-4 sm:space-y-6 mt-0">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-lg font-bold" style={{ color: '#014b89' }}>My Leave Status</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshMyLeaves}
                disabled={isRefreshingMyLeaves}
                className="gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshingMyLeaves ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
            
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              {[
                { label: 'Total', value: myLeaves.length, color: '#014b89' },
                { label: 'Pending', value: myLeaves.filter((l) => l.status === 'pending').length, color: '#eab308' },
                { label: 'Approved', value: myLeaves.filter((l) => l.status === 'approved').length, color: '#10b981' }
              ].map((stat) => (
                <div 
                  key={stat.label}
                  className="bg-white border-2 border-gray-100 rounded-xl sm:rounded-2xl p-3 sm:p-5 md:p-6 hover:shadow-xl transition-all"
                >
                  <p className="text-[10px] sm:text-xs md:text-sm font-semibold text-gray-600 mb-1 sm:mb-2 uppercase truncate">{stat.label}</p>
                  <p className="text-xl sm:text-2xl md:text-3xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
                </div>
              ))}
            </div>

            {isLoadingMyLeaves ? (
              <div className="bg-white border-2 border-gray-200 rounded-2xl sm:rounded-3xl shadow-lg overflow-hidden">
                <div className="p-8 sm:p-12 text-center flex flex-col items-center gap-3">
                  <Loader2 className="h-8 w-8 animate-spin" style={{ color: '#014b89' }} />
                  <p className="text-sm sm:text-base text-gray-600">Loading your leave requests...</p>
                </div>
              </div>
            ) : (
            <div>
              <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4" style={{ color: '#014b89' }}>My Leave Requests</h3>
              {myLeaves.length === 0 ? (
                <div className="bg-white border-2 border-gray-200 rounded-2xl sm:rounded-3xl shadow-lg overflow-hidden">
                  <div className="p-8 sm:p-12 text-center">
                    <p className="text-sm sm:text-base text-gray-600">
                      You haven't submitted any leave requests yet
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {myLeaves.map((leave) => (
                    <div
                      key={leave.id}
                      className="bg-white border-2 border-gray-200 rounded-xl sm:rounded-2xl overflow-hidden hover:shadow-lg transition-all cursor-pointer"
                      onClick={() => {
                        setSelectedMyLeave(leave);
                        setIsMyLeaveDialogOpen(true);
                      }}
                    >
                      <div className="p-4 sm:p-5 md:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base sm:text-lg font-bold" style={{ color: '#014b89' }}>
                              {formatStatus(leave.leave_type)} Leave
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-600 mt-1 break-words">
                              {format(new Date(leave.start_date), 'PPP')} - {format(new Date(leave.end_date), 'PPP')}
                            </p>
                          </div>
                          {getStatusBadge(leave.status)}
                        </div>
                        <div className="text-xs sm:text-sm space-y-1">
                          <p className="text-gray-600">
                            <strong>Duration:</strong> {leave.total_days} days
                          </p>
                          <p className="text-gray-600">
                            <strong>Submitted:</strong> {format(new Date(leave.created_at), 'PPP')}
                          </p>
                          {leave.assigned_replacement && (
                            <p className="text-gray-600">
                              <strong>Replacement:</strong> {getCaretakerName(leave.assigned_replacement)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Student Review Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-lg mx-auto max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">
              {reviewAction === 'approve' && 'Approve Leave Request'}
              {reviewAction === 'reject' && 'Reject Leave Request'}
              {reviewAction === 'moreinfo' && 'Request More Information'}
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              {selectedStudentLeave && (
                <>
                  Student: {selectedStudentLeave.student_name || 'Unknown'} (Room{' '}
                  {selectedStudentLeave.room_number || 'N/A'})
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-bold">
                {reviewAction === 'moreinfo' ? 'Message to Student' : 'Notes'}
              </Label>
              <Textarea
                placeholder={
                  reviewAction === 'reject'
                    ? 'Provide reason for rejection'
                    : reviewAction === 'moreinfo'
                    ? 'What additional information do you need?'
                    : 'Optional notes about this approval'
                }
                rows={4}
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                className="border-2 rounded-xl text-sm sm:text-base resize-none"
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
                (reviewAction === 'reject' && !reviewNotes.trim())
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
                  {reviewAction === 'moreinfo' && 'Send Request'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* My Leave Details Dialog */}
      <Dialog open={isMyLeaveDialogOpen} onOpenChange={setIsMyLeaveDialogOpen}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-lg mx-auto max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Leave Request Details</DialogTitle>
          </DialogHeader>
          {selectedMyLeave && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold">Status:</span>
                {getStatusBadge(selectedMyLeave.status)}
              </div>
              <div>
                <p className="text-sm font-bold mb-1">Leave Type:</p>
                <p className="text-sm text-gray-600">{formatStatus(selectedMyLeave.leave_type)}</p>
              </div>
              <div>
                <p className="text-sm font-bold mb-1">Duration:</p>
                <p className="text-sm text-gray-600">
                  {format(new Date(selectedMyLeave.start_date), 'PPP')} -{' '}
                  {format(new Date(selectedMyLeave.end_date), 'PPP')} ({selectedMyLeave.total_days}{' '}
                  days)
                </p>
              </div>
              <div>
                <p className="text-sm font-bold mb-1">Reason:</p>
                <p className="text-sm text-gray-600 break-words">{selectedMyLeave.reason}</p>
              </div>
              <div>
                <p className="text-sm font-bold mb-1">Suggested Replacement:</p>
                <p className="text-sm text-gray-600">
                  {getCaretakerName(selectedMyLeave.replacement_suggestion)}
                </p>
              </div>
              {selectedMyLeave.assigned_replacement && (
                <div>
                  <p className="text-sm font-bold mb-1">Assigned Replacement:</p>
                  <p className="text-sm text-gray-600">
                    {getCaretakerName(selectedMyLeave.assigned_replacement)}
                  </p>
                </div>
              )}
              {selectedMyLeave.admin_notes && (
                <div>
                  <p className="text-sm font-bold mb-1">Admin Notes:</p>
                  <p className="text-sm text-gray-600 break-words">{selectedMyLeave.admin_notes}</p>
                </div>
              )}
              {selectedMyLeave.reviewed_at && (
                <div>
                  <p className="text-xs text-gray-500">
                    Reviewed on {format(new Date(selectedMyLeave.reviewed_at), 'PPP')} by{' '}
                    {selectedMyLeave.reviewed_by_name || 'Admin'}
                  </p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button 
              onClick={() => setIsMyLeaveDialogOpen(false)}
              className="w-full font-bold h-10 sm:h-11 text-sm sm:text-base rounded-xl text-white"
              style={{ background: '#014b89' }}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
