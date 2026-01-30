'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import { studentLeaveApi, StudentLeaveRequest, StudentLeaveType } from '@/lib/leave';
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CalendarIcon, Upload, CheckCircle2, AlertCircle, XCircle, Clock, MapPin, Phone, FileText, PlusCircle, List, Loader2, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

// Helper to format status for display
const formatStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    'pending': 'Pending',
    'approved': 'Approved',
    'rejected': 'Rejected',
    'more_info': 'More Info Needed'
  };
  return statusMap[status] || status;
};

// Helper to format return status for display
const formatReturnStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    'not_returned': 'Not Returned',
    'returned': 'Returned',
    'overdue': 'Overdue'
  };
  return statusMap[status] || status;
};

export default function StudentLeavePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('my-leaves');
  const [leaves, setLeaves] = useState<StudentLeaveRequest[]>([]);
  const [selectedLeave, setSelectedLeave] = useState<StudentLeaveRequest | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isReturnDialogOpen, setIsReturnDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Apply form state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [formData, setFormData] = useState({
    leaveType: '' as StudentLeaveType | '',
    startTime: '',
    endTime: '',
    reason: '',
    destination: '',
    contactNumber: '',
    document: null as File | null
  });

  // Fetch leaves on mount
  const fetchLeaves = useCallback(async () => {
    if (!user) return;
    
    try {
      const response = await studentLeaveApi.getMyLeaves();
      if (response.success && response.data) {
        setLeaves(response.data);
      } else {
        toast.error(response.error || 'Failed to load leave requests');
      }
    } catch (error) {
      console.error('Error fetching leaves:', error);
      toast.error('Failed to load leave requests');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchLeaves();
  };

  const handleInputChange = (field: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, document: e.target.files![0] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !startDate || !endDate || !formData.leaveType) return;

    setIsSubmitting(true);

    try {
      // Combine date and time
      const startDateTime = new Date(startDate);
      if (formData.startTime) {
        const [hours, minutes] = formData.startTime.split(':');
        startDateTime.setHours(parseInt(hours), parseInt(minutes));
      }

      const endDateTime = new Date(endDate);
      if (formData.endTime) {
        const [hours, minutes] = formData.endTime.split(':');
        endDateTime.setHours(parseInt(hours), parseInt(minutes));
      }

      const response = await studentLeaveApi.create(
        {
          leave_type: formData.leaveType as StudentLeaveType,
          start_date: startDateTime.toISOString(),
          end_date: endDateTime.toISOString(),
          destination: formData.destination,
          contact_number: formData.contactNumber,
          reason: formData.reason,
          // TODO: Handle document upload to Supabase Storage
        },
        {
          id: user.id,
          name: user.name,
          hostelName: user.hostelName,
          roomNumber: user.roomNumber,
        }
      );

      if (response.success && response.data) {
        setIsSuccess(true);
        // Add to local state
        setLeaves(prev => [response.data!, ...prev]);
        
        setTimeout(() => {
          setIsSuccess(false);
          setActiveTab('my-leaves');
          setFormData({
            leaveType: '',
            startTime: '',
            endTime: '',
            reason: '',
            destination: '',
            contactNumber: '',
            document: null
          });
          setStartDate(undefined);
          setEndDate(undefined);
        }, 2000);
      } else {
        toast.error(response.error || 'Failed to submit leave request');
      }
    } catch (error) {
      console.error('Error submitting leave:', error);
      toast.error('Failed to submit leave request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewDetails = (leave: StudentLeaveRequest) => {
    setSelectedLeave(leave);
    setIsDetailDialogOpen(true);
  };

  const handleMarkReturn = (leave: StudentLeaveRequest) => {
    setSelectedLeave(leave);
    setIsReturnDialogOpen(true);
  };

  const confirmReturn = async () => {
    if (!selectedLeave) return;

    try {
      const response = await studentLeaveApi.markReturn(selectedLeave.id, {
        return_status: 'returned',
        actual_return_date: new Date().toISOString(),
      });

      if (response.success && response.data) {
        // Update local state
        setLeaves(prev => prev.map(leave => 
          leave.id === selectedLeave.id ? response.data! : leave
        ));
        toast.success('Return marked successfully!');
      } else {
        toast.error(response.error || 'Failed to mark return');
      }
    } catch (error) {
      console.error('Error marking return:', error);
      toast.error('Failed to mark return');
    } finally {
      setIsReturnDialogOpen(false);
      setSelectedLeave(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { bg: string; color: string; border: string }> = {
      pending: { bg: 'rgba(234, 179, 8, 0.1)', color: '#eab308', border: 'rgba(234, 179, 8, 0.3)' },
      approved: { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: 'rgba(16, 185, 129, 0.3)' },
      rejected: { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'rgba(239, 68, 68, 0.3)' },
      more_info: { bg: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: 'rgba(59, 130, 246, 0.3)' }
    };
    const style = styles[status] || { bg: '#f3f4f6', color: '#6b7280', border: '#e5e7eb' };

    return (
      <Badge 
        className="gap-1 text-xs font-bold px-2 sm:px-3 py-1 border-2"
        style={{ background: style.bg, color: style.color, borderColor: style.border }}
      >
        {status === 'pending' && <AlertCircle className="h-3 w-3" />}
        {status === 'approved' && <CheckCircle2 className="h-3 w-3" />}
        {status === 'rejected' && <XCircle className="h-3 w-3" />}
        {status === 'more_info' && <AlertCircle className="h-3 w-3" />}
        {formatStatus(status)}
      </Badge>
    );
  };

  const getReturnBadge = (returnStatus: string) => {
    const styles: Record<string, { bg: string; color: string; border: string }> = {
      returned: { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: 'rgba(16, 185, 129, 0.3)' },
      overdue: { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'rgba(239, 68, 68, 0.3)' },
      not_returned: { bg: 'rgba(107, 114, 128, 0.1)', color: '#6b7280', border: 'rgba(107, 114, 128, 0.3)' }
    };
    const style = styles[returnStatus] || styles.not_returned;

    return (
      <Badge 
        className="text-xs font-bold px-2 sm:px-3 py-1 border-2"
        style={{ background: style.bg, color: style.color, borderColor: style.border }}
      >
        {formatReturnStatus(returnStatus)}
      </Badge>
    );
  };

  const LeaveCard = ({ leave }: { leave: StudentLeaveRequest }) => {
    const startDate = new Date(leave.start_date);
    const endDate = new Date(leave.end_date);
    const duration = leave.total_days;
    const isActive = leave.status === 'approved' && leave.return_status === 'not_returned' && new Date() >= startDate && new Date() <= endDate;
    
    return (
      <div 
        className="bg-white border-2 rounded-xl sm:rounded-2xl overflow-hidden mb-4 hover:shadow-lg transition-all"
        style={{ borderColor: isActive ? '#10b981' : '#e5e7eb' }}
      >
        <div className="p-4 sm:p-5 md:p-6 border-b-2 border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg md:text-xl font-bold mb-2 break-words" style={{ color: '#014b89' }}>
                {leave.leave_type}
                {isActive && (
                  <Badge 
                    className="ml-2 text-xs font-bold px-2 py-1 border-2"
                    style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.3)' }}
                  >
                    Active
                  </Badge>
                )}
              </h3>
              <div className="flex flex-wrap gap-2">
                {getStatusBadge(leave.status)}
                {leave.status === 'approved' && getReturnBadge(leave.return_status)}
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-5 md:p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-2 sm:gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(1, 75, 137, 0.1)' }}>
                <CalendarIcon className="h-4 w-4" style={{ color: '#014b89' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 mb-1">Leave Period</p>
                <p className="text-xs sm:text-sm text-gray-600 break-words">
                  {format(startDate, 'PPP')} - {format(endDate, 'PPP')}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Duration: {duration} {duration === 1 ? 'day' : 'days'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2 sm:gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(242, 105, 24, 0.1)' }}>
                <Clock className="h-4 w-4" style={{ color: '#f26918' }} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-900 mb-1">Submitted</p>
                <p className="text-xs sm:text-sm text-gray-600">
                  {format(new Date(leave.submitted_at), 'PPP')}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2 sm:gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(107, 114, 128, 0.1)' }}>
              <FileText className="h-4 w-4" style={{ color: '#6b7280' }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 mb-1">Reason</p>
              <p className="text-xs sm:text-sm text-gray-600 break-words">{leave.reason}</p>
            </div>
          </div>

          {leave.reviewed_at && (
            <div className="border-t-2 border-gray-100 pt-4">
              <div className="p-3 sm:p-4 rounded-xl" style={{ background: 'rgba(1, 75, 137, 0.05)' }}>
                <p className="text-sm font-bold mb-2" style={{ color: '#014b89' }}>Review Details</p>
                <p className="text-xs sm:text-sm text-gray-700 mb-2">
                  Reviewed by <strong>{leave.reviewed_by_name || 'Caretaker'}</strong> on {format(new Date(leave.reviewed_at), 'PPP')}
                </p>
                {leave.caretaker_notes && (
                  <p className="text-xs sm:text-sm text-gray-600 mt-2">
                    <strong>Notes:</strong> {leave.caretaker_notes}
                  </p>
                )}
                {leave.rejection_reason && (
                  <div className="mt-2 p-3 rounded-lg border-2" style={{ background: 'rgba(239, 68, 68, 0.05)', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
                    <p className="text-xs sm:text-sm font-medium" style={{ color: '#ef4444' }}>
                      <strong>Rejection Reason:</strong> {leave.rejection_reason}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {leave.actual_return_date && (
            <div className="p-3 sm:p-4 rounded-xl border-2" style={{ background: 'rgba(16, 185, 129, 0.05)', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
              <p className="text-sm font-bold" style={{ color: '#10b981' }}>
                <CheckCircle2 className="h-4 w-4 inline mr-2" />
                Returned on {format(new Date(leave.actual_return_date), 'PPP')}
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t-2 border-gray-100">
            <Button 
              variant="outline" 
              onClick={() => handleViewDetails(leave)}
              className="flex-1 border-2 font-semibold h-10 sm:h-11 text-xs sm:text-sm rounded-xl"
              style={{ borderColor: '#014b89', color: '#014b89' }}
            >
              View Details
            </Button>
            
            {leave.status === 'approved' && leave.return_status === 'not_returned' && (
              <Button 
                onClick={() => handleMarkReturn(leave)}
                className="flex-1 font-bold h-10 sm:h-11 text-xs sm:text-sm rounded-xl text-white"
                style={{ background: '#10b981' }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#059669'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#10b981'}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                I'm Back
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };

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
            Leave Management
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-gray-600">Apply for leave and track your requests</p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2 h-11 sm:h-12 bg-gray-100">
            <TabsTrigger 
              value="my-leaves" 
              className="gap-1 sm:gap-2 text-xs sm:text-sm font-semibold data-[state=active]:bg-white"
            >
              <List className="h-3 w-3 sm:h-4 sm:w-4" />
              My Leaves
            </TabsTrigger>
            <TabsTrigger 
              value="apply" 
              className="gap-1 sm:gap-2 text-xs sm:text-sm font-semibold data-[state=active]:bg-white"
            >
              <PlusCircle className="h-3 w-3 sm:h-4 sm:w-4" />
              Apply for Leave
            </TabsTrigger>
          </TabsList>

          {/* My Leaves Tab */}
          <TabsContent value="my-leaves" className="space-y-4 sm:space-y-6 mt-0">
            {/* Refresh Button */}
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="border-2 gap-2"
                style={{ borderColor: '#014b89', color: '#014b89' }}
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {[
                { label: 'Total Requests', value: leaves.length, color: '#014b89' },
                { label: 'Pending', value: leaves.filter(l => l.status === 'pending').length, color: '#eab308' },
                { label: 'Approved', value: leaves.filter(l => l.status === 'approved').length, color: '#10b981' },
                { label: 'Rejected', value: leaves.filter(l => l.status === 'rejected').length, color: '#ef4444' }
              ].map((stat, i) => (
                <div 
                  key={stat.label}
                  className="bg-white border-2 border-gray-100 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 hover:shadow-xl transition-all"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <p className="text-[10px] sm:text-xs md:text-sm font-semibold text-gray-600 mb-2 uppercase">{stat.label}</p>
                  <p className="text-2xl sm:text-3xl md:text-4xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-12 w-12 animate-spin mb-4" style={{ color: '#014b89' }} />
                <p className="text-gray-600">Loading your leave requests...</p>
              </div>
            )}

            {/* Leave Requests List */}
            {!isLoading && (
              <div>
                {leaves.length === 0 ? (
                  <div className="bg-white border-2 border-gray-200 rounded-2xl sm:rounded-3xl shadow-lg overflow-hidden">
                    <div className="p-8 sm:p-12 text-center">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full mx-auto mb-4 sm:mb-6 flex items-center justify-center" style={{ background: 'rgba(1, 75, 137, 0.1)' }}>
                        <List className="w-8 h-8 sm:w-10 sm:h-10" style={{ color: '#014b89' }} />
                      </div>
                      <p className="text-sm sm:text-base text-gray-600 mb-4">You haven't applied for any leave yet</p>
                      <Button 
                        onClick={() => setActiveTab('apply')}
                        className="text-white font-bold h-10 sm:h-11 px-6 rounded-xl text-sm sm:text-base"
                        style={{ background: '#014b89' }}
                      >
                        Apply for Leave
                      </Button>
                    </div>
                  </div>
                ) : (
                  leaves.map(leave => <LeaveCard key={leave.id} leave={leave} />)
                )}
              </div>
            )}
          </TabsContent>

          {/* Apply for Leave Tab */}
          <TabsContent value="apply" className="mt-0">
            {isSuccess ? (
              <div className="bg-white border-2 border-gray-100 rounded-2xl sm:rounded-3xl shadow-lg overflow-hidden max-w-2xl mx-auto">
                <div className="p-8 sm:p-12 text-center">
                  <CheckCircle2 className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6" style={{ color: '#10b981' }} />
                  <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4" style={{ color: '#014b89' }}>Leave Request Submitted!</h2>
                  <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                    Your leave application has been submitted successfully. You will be notified once it's reviewed.
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Status: <span className="font-bold" style={{ color: '#eab308' }}>Pending Approval</span>
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="bg-white border-2 border-gray-100 rounded-2xl sm:rounded-3xl shadow-lg overflow-hidden max-w-3xl mx-auto">
                  <div className="p-4 sm:p-6 md:p-8">
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2" style={{ color: '#014b89' }}>
                      Leave Application Form
                    </h2>
                    <p className="text-xs sm:text-sm md:text-base text-gray-600 mb-6 sm:mb-8">Fill in all required details for your leave request</p>

                    <div className="space-y-4 sm:space-y-6">
                      {/* Leave Type */}
                      <div className="space-y-2">
                        <Label htmlFor="leaveType" className="text-sm font-bold">Leave Type *</Label>
                        <Select 
                          required
                          value={formData.leaveType}
                          onValueChange={(value) => handleInputChange('leaveType', value)}
                        >
                          <SelectTrigger className="h-10 sm:h-11 border-2 border-gray-200 rounded-xl text-sm sm:text-base">
                            <SelectValue placeholder="Select leave type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Home Visit">Home Visit</SelectItem>
                            <SelectItem value="Emergency">Emergency</SelectItem>
                            <SelectItem value="Medical">Medical</SelectItem>
                            <SelectItem value="Personal">Personal</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Start Date and Time */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-bold">Start Date *</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full justify-start text-left font-normal h-10 sm:h-11 border-2 border-gray-200 rounded-xl text-sm sm:text-base"
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {startDate ? format(startDate, 'PPP') : 'Pick a date'}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
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
                          <Label htmlFor="startTime" className="text-sm font-bold">Start Time *</Label>
                          <Input
                            id="startTime"
                            type="time"
                            required
                            value={formData.startTime}
                            onChange={(e) => handleInputChange('startTime', e.target.value)}
                            className="h-10 sm:h-11 border-2 border-gray-200 rounded-xl text-sm sm:text-base"
                          />
                        </div>
                      </div>

                      {/* End Date and Time */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-bold">End Date *</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full justify-start text-left font-normal h-10 sm:h-11 border-2 border-gray-200 rounded-xl text-sm sm:text-base"
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {endDate ? format(endDate, 'PPP') : 'Pick a date'}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={endDate}
                                onSelect={setEndDate}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="endTime" className="text-sm font-bold">End Time *</Label>
                          <Input
                            id="endTime"
                            type="time"
                            required
                            value={formData.endTime}
                            onChange={(e) => handleInputChange('endTime', e.target.value)}
                            className="h-10 sm:h-11 border-2 border-gray-200 rounded-xl text-sm sm:text-base"
                          />
                        </div>
                      </div>

                      {/* Reason */}
                      <div className="space-y-2">
                        <Label htmlFor="reason" className="text-sm font-bold">Reason for Leave *</Label>
                        <Textarea
                          id="reason"
                          placeholder="Please provide a detailed reason for your leave..."
                          required
                          rows={4}
                          value={formData.reason}
                          onChange={(e) => handleInputChange('reason', e.target.value)}
                          className="border-2 border-gray-200 rounded-xl text-sm sm:text-base resize-none"
                        />
                      </div>

                      {/* Destination */}
                      <div className="space-y-2">
                        <Label htmlFor="destination" className="text-sm font-bold">Destination / Going To *</Label>
                        <Input
                          id="destination"
                          placeholder="Full address where you'll be staying"
                          required
                          value={formData.destination}
                          onChange={(e) => handleInputChange('destination', e.target.value)}
                          className="h-10 sm:h-11 border-2 border-gray-200 rounded-xl text-sm sm:text-base"
                        />
                      </div>

                      {/* Contact Number */}
                      <div className="space-y-2">
                        <Label htmlFor="contactNumber" className="text-sm font-bold">Contact Number During Leave *</Label>
                        <Input
                          id="contactNumber"
                          type="tel"
                          placeholder="+91 XXXXX XXXXX"
                          required
                          value={formData.contactNumber}
                          onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                          className="h-10 sm:h-11 border-2 border-gray-200 rounded-xl text-sm sm:text-base"
                        />
                      </div>

                      {/* Supporting Document */}
                      <div className="space-y-2">
                        <Label htmlFor="document" className="text-sm font-bold">Supporting Document (Optional)</Label>
                        <div className="flex items-center gap-2 sm:gap-4">
                          <Input
                            id="document"
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={handleFileChange}
                            className="flex-1 h-10 sm:h-11 border-2 border-gray-200 rounded-xl text-sm sm:text-base"
                          />
                          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(1, 75, 137, 0.1)' }}>
                            <Upload className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: '#014b89' }} />
                          </div>
                        </div>
                        <p className="text-xs text-gray-500">
                          Upload medical certificate, parent letter, etc. (PDF, JPG, PNG)
                        </p>
                        {formData.document && (
                          <p className="text-xs sm:text-sm font-medium" style={{ color: '#10b981' }}>
                            Selected: {formData.document.name}
                          </p>
                        )}
                      </div>

                      {/* Submit Button */}
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 pt-4">
                        <Button
                          type="submit"
                          disabled={isSubmitting || !startDate || !endDate}
                          className="flex-1 text-white font-bold h-11 sm:h-12 rounded-xl text-sm sm:text-base"
                          style={{ background: '#014b89' }}
                        >
                          {isSubmitting ? 'Submitting...' : 'Submit Leave Request'}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setActiveTab('my-leaves')}
                          className="border-2 font-semibold h-11 sm:h-12 rounded-xl text-sm sm:text-base"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Details Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-2xl mx-auto max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Leave Request Details</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">Complete information about your leave request</DialogDescription>
          </DialogHeader>
          
          {selectedLeave && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-bold text-gray-900 mb-1">Leave Type</p>
                  <p className="text-sm text-gray-600">{selectedLeave.leave_type}</p>
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 mb-1">Status</p>
                  {getStatusBadge(selectedLeave.status)}
                </div>
              </div>

              <div>
                <p className="text-sm font-bold text-gray-900 mb-1">Leave Period</p>
                <p className="text-sm text-gray-600">
                  {format(new Date(selectedLeave.start_date), 'PPP p')} to {format(new Date(selectedLeave.end_date), 'PPP p')}
                </p>
                <p className="text-xs text-gray-500 mt-1">Duration: {selectedLeave.total_days} day(s)</p>
              </div>

              <div>
                <p className="text-sm font-bold text-gray-900 mb-1">Reason</p>
                <p className="text-sm text-gray-600">{selectedLeave.reason}</p>
              </div>

              <div>
                <p className="text-sm font-bold text-gray-900 mb-1">Destination</p>
                <p className="text-sm text-gray-600">{selectedLeave.destination}</p>
              </div>

              <div>
                <p className="text-sm font-bold text-gray-900 mb-1">Contact Number</p>
                <p className="text-sm text-gray-600">{selectedLeave.contact_number}</p>
              </div>

              {selectedLeave.document_url && (
                <div>
                  <p className="text-sm font-bold text-gray-900 mb-2">Supporting Document</p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-2 h-9 text-xs"
                    style={{ borderColor: '#014b89', color: '#014b89' }}
                  >
                    <FileText className="h-3 w-3 mr-2" />
                    View Document
                  </Button>
                </div>
              )}

              {selectedLeave.reviewed_by_name && selectedLeave.reviewed_at && (
                <div className="border-t-2 border-gray-100 pt-4">
                  <p className="text-sm font-bold text-gray-900 mb-2">Review Information</p>
                  <p className="text-sm text-gray-600 mb-2">
                    Reviewed by {selectedLeave.reviewed_by_name} on {format(new Date(selectedLeave.reviewed_at), 'PPP p')}
                  </p>
                  {selectedLeave.caretaker_notes && (
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Notes:</strong> {selectedLeave.caretaker_notes}
                    </p>
                  )}
                  {selectedLeave.rejection_reason && (
                    <div className="mt-2 p-3 rounded-lg border-2" style={{ background: 'rgba(239, 68, 68, 0.05)', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
                      <p className="text-sm font-medium" style={{ color: '#ef4444' }}>
                        <strong>Rejection Reason:</strong> {selectedLeave.rejection_reason}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Return Confirmation Dialog */}
      <Dialog open={isReturnDialogOpen} onOpenChange={setIsReturnDialogOpen}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Confirm Your Return</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Mark that you have returned to the hostel
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to mark yourself as returned? This will notify the caretaker that you are back at the hostel.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsReturnDialogOpen(false)} 
              className="flex-1 border-2 h-10 sm:h-11 text-sm sm:text-base rounded-xl"
            >
              Cancel
            </Button>
            <Button 
              onClick={confirmReturn} 
              className="flex-1 font-bold h-10 sm:h-11 text-sm sm:text-base rounded-xl text-white"
              style={{ background: '#10b981' }}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Yes, I'm Back
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
