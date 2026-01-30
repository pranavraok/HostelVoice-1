'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/auth-context'
import { issuesApi, Issue, ApiError } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AlertCircle, X, Plus, CheckCircle, Clock, ArrowRight, Loader2, RefreshCw, UserPlus } from 'lucide-react'
import { toast } from 'sonner'

export default function IssuesPage() {
  const { user } = useAuth()
  const [showForm, setShowForm] = useState(false)
  const [issues, setIssues] = useState<Issue[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // For viewing issue details
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [detailsIssue, setDetailsIssue] = useState<Issue | null>(null)
  
  // For staff: assignment modal
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null)
  const [assignData, setAssignData] = useState({ assigned_to: '', notes: '' })
  
  // For staff: status update modal
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [statusData, setStatusData] = useState({ status: '', notes: '' })

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'maintenance',
    priority: 'medium',
    location: ''
  })

  // Fetch issues
  const fetchIssues = useCallback(async () => {
    if (!user) return

    setIsLoading(true)
    setError(null)

    try {
      const response = user.role === 'student'
        ? await issuesApi.getMyIssues(1, 50)
        : await issuesApi.getAllIssues({ page: 1, limit: 50 })

      if (response.data) {
        setIssues(response.data)
      }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to load issues'
      setError(message)
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchIssues()
  }, [fetchIssues])

  // Create issue
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsSubmitting(true)

    try {
      const response = await issuesApi.create({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        priority: formData.priority,
        hostel_name: user.hostelName,
        room_number: user.roomNumber,
        location: formData.location || undefined,
      })

      if (response.data) {
        setIssues(prev => [response.data!, ...prev])
        toast.success('Issue reported successfully!')
        setFormData({ title: '', description: '', category: 'maintenance', priority: 'medium', location: '' })
        setShowForm(false)
      }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to create issue'
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Assign issue (staff only)
  const handleAssign = async () => {
    if (!selectedIssue || !assignData.assigned_to) return

    setIsSubmitting(true)
    try {
      const response = await issuesApi.assign(selectedIssue.id, {
        assigned_to: assignData.assigned_to,
        notes: assignData.notes || undefined,
      })

      if (response.data) {
        setIssues(prev => prev.map(i => i.id === selectedIssue.id ? response.data! : i))
        toast.success('Issue assigned successfully!')
        setShowAssignModal(false)
        setSelectedIssue(null)
        setAssignData({ assigned_to: '', notes: '' })
      }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to assign issue'
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Update status (staff only)
  const handleStatusUpdate = async () => {
    if (!selectedIssue || !statusData.status) return

    setIsSubmitting(true)
    try {
      const response = await issuesApi.updateStatus(selectedIssue.id, {
        status: statusData.status,
        notes: statusData.notes || undefined,
      })

      if (response.data) {
        setIssues(prev => prev.map(i => i.id === selectedIssue.id ? response.data! : i))
        toast.success('Status updated successfully!')
        setShowStatusModal(false)
        setSelectedIssue(null)
        setStatusData({ status: '', notes: '' })
      }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to update status'
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
      case 'closed':
        return <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: '#10b981' }} />
      case 'in_progress':
        return <Clock className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: '#f26918' }} />
      default:
        return <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: '#014b89' }} />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
      case 'closed':
        return { bg: 'rgba(16, 185, 129, 0.1)', text: '#10b981', border: 'rgba(16, 185, 129, 0.3)' }
      case 'in_progress':
        return { bg: 'rgba(242, 105, 24, 0.1)', text: '#f26918', border: 'rgba(242, 105, 24, 0.3)' }
      default:
        return { bg: 'rgba(1, 75, 137, 0.1)', text: '#014b89', border: 'rgba(1, 75, 137, 0.3)' }
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return { bg: 'rgba(239, 68, 68, 0.1)', text: '#ef4444', border: 'rgba(239, 68, 68, 0.3)' }
      case 'high':
        return { bg: 'rgba(249, 115, 22, 0.1)', text: '#f97316', border: 'rgba(249, 115, 22, 0.3)' }
      case 'medium':
        return { bg: 'rgba(234, 179, 8, 0.1)', text: '#eab308', border: 'rgba(234, 179, 8, 0.3)' }
      default:
        return { bg: 'rgba(34, 197, 94, 0.1)', text: '#22c55e', border: 'rgba(34, 197, 94, 0.3)' }
    }
  }

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  }

  if (!user) return null

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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 pt-4 sm:pt-6 md:pt-12 pb-12 sm:pb-16 md:pb-24 relative z-10">
        {/* Header - Mobile Optimized */}
        <div className="flex flex-col gap-3 sm:gap-4 mb-6 sm:mb-8 md:mb-12 animate-fade-in">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-1 sm:mb-2" style={{ color: '#014b89' }}>
              {user.role === 'student' ? 'Report & Track Issues' : 'Manage Issues'}
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-gray-600">
              {user.role === 'student' 
                ? 'Report maintenance issues and track their status'
                : 'Manage and track all reported issues'}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button
              onClick={fetchIssues}
              variant="outline"
              className="gap-2 h-11 sm:h-12 rounded-xl font-semibold border-2 text-sm sm:text-base"
              style={{ borderColor: '#014b89', color: '#014b89' }}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            {user.role === 'student' && (
              <Button
                onClick={() => setShowForm(!showForm)}
                className="text-white font-bold gap-2 w-full sm:flex-1 md:w-auto h-11 sm:h-12 md:h-14 rounded-xl shadow-lg hover:shadow-xl transition-all text-sm sm:text-base"
                style={{ background: '#014b89' }}
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                Report New Issue
              </Button>
            )}
          </div>
        </div>

        {/* Report Form - Mobile Optimized */}
        {showForm && user.role === 'student' && (
          <div className="bg-white border-2 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 mb-6 sm:mb-8 shadow-xl animate-fade-in" style={{ borderColor: 'rgba(1, 75, 137, 0.2)' }}>
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold" style={{ color: '#014b89' }}>Report a New Issue</h2>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0">
                <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div>
                <label className="text-sm font-bold text-gray-900 mb-2 block">Issue Title *</label>
                <Input
                  type="text"
                  placeholder="e.g., Water leakage in bathroom"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="border-2 border-gray-200 focus:border-[#014b89] rounded-xl h-11 sm:h-12 text-sm sm:text-base"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="text-sm font-bold text-gray-900 mb-2 block">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full h-11 sm:h-12 px-3 sm:px-4 border-2 border-gray-200 rounded-xl focus:border-[#014b89] bg-white text-gray-900 font-medium text-sm sm:text-base"
                  >
                    <option value="maintenance">Maintenance</option>
                    <option value="cleanliness">Cleanliness</option>
                    <option value="security">Security</option>
                    <option value="food">Food</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-bold text-gray-900 mb-2 block">Priority *</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full h-11 sm:h-12 px-3 sm:px-4 border-2 border-gray-200 rounded-xl focus:border-[#014b89] bg-white text-gray-900 font-medium text-sm sm:text-base"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-bold text-gray-900 mb-2 block">Location (Optional)</label>
                <Input
                  type="text"
                  placeholder="e.g., Room 101, First Floor"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="border-2 border-gray-200 focus:border-[#014b89] rounded-xl h-11 sm:h-12 text-sm sm:text-base"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-gray-900 mb-2 block">Description *</label>
                <textarea
                  placeholder="Provide details about the issue..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-xl focus:border-[#014b89] resize-none font-medium text-sm sm:text-base"
                  rows={4}
                  required
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
                <Button 
                  type="submit" 
                  className="text-white font-bold w-full sm:flex-1 h-11 sm:h-12 rounded-xl shadow-lg text-sm sm:text-base"
                  style={{ background: '#014b89' }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit Issue'}
                </Button>
                <Button
                  type="button"
                  onClick={() => setShowForm(false)}
                  variant="outline"
                  className="border-2 w-full sm:w-auto h-11 sm:h-12 rounded-xl font-semibold text-sm sm:text-base"
                  style={{ borderColor: '#014b89', color: '#014b89' }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12 sm:py-16 md:py-20">
            <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 animate-spin mb-4" style={{ color: '#014b89' }} />
            <p className="text-sm sm:text-base text-gray-600 font-medium">Loading issues...</p>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center mb-6 sm:mb-8">
            <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-bold text-red-700 mb-2">Failed to Load Issues</h3>
            <p className="text-sm sm:text-base text-red-600 mb-4">{error}</p>
            <Button onClick={fetchIssues} className="bg-red-600 hover:bg-red-700 text-white h-11 sm:h-12 text-sm sm:text-base">
              Try Again
            </Button>
          </div>
        )}

        {/* Issues List - Mobile Optimized */}
        {!isLoading && !error && (
          <div className="space-y-3 sm:space-y-4 md:space-y-6">
            {issues.length === 0 ? (
              <div className="bg-white border-2 border-gray-200 rounded-2xl sm:rounded-3xl p-8 sm:p-12 md:p-16 text-center shadow-lg animate-fade-in">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full mx-auto mb-4 sm:mb-6 flex items-center justify-center" style={{ background: 'rgba(1, 75, 137, 0.1)' }}>
                  <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10" style={{ color: '#014b89' }} />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">
                  {user.role === 'student' ? 'No issues reported yet' : 'No issues to manage'}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 max-w-md mx-auto">
                  {user.role === 'student' 
                    ? 'When you report an issue, it will appear here and you can track its progress'
                    : 'All reported issues will appear here for management'}
                </p>
                {user.role === 'student' && (
                  <Button
                    onClick={() => setShowForm(true)}
                    className="text-white font-bold gap-2 h-11 sm:h-12 px-6 sm:px-8 rounded-xl shadow-lg text-sm sm:text-base"
                    style={{ background: '#014b89' }}
                  >
                    <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                    Report Your First Issue
                  </Button>
                )}
              </div>
            ) : (
              issues.map((issue, index) => {
                const statusColor = getStatusColor(issue.status)
                const priorityColor = getPriorityColor(issue.priority)
                
                // Get solid color for priority badge
                const getPrioritySolidColor = (priority: string) => {
                  switch (priority) {
                    case 'urgent': return '#ef4444'
                    case 'high': return '#f97316'
                    case 'medium': return '#eab308'
                    default: return '#22c55e'
                  }
                }
                
                return (
                  <div
                    key={issue.id}
                    className="bg-white border-2 border-gray-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 hover:border-gray-300 hover:shadow-xl transition-all duration-300 animate-fade-in relative overflow-visible"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    {/* Priority Badge - Top Right Corner */}
                    <span 
                      className="absolute -top-3 -right-3 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-sm sm:text-base font-extrabold uppercase tracking-wider z-10 transform rotate-3"
                      style={{ 
                        background: getPrioritySolidColor(issue.priority),
                        color: 'white',
                        borderColor: 'white',
                        borderWidth: '3px',
                        borderStyle: 'solid',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3)'
                      }}
                    >
                      {issue.priority}
                    </span>

                    <div className="flex items-start justify-between mb-3 sm:mb-4">
                      <div className="flex-1 min-w-0 pr-20">
                        <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: statusColor.bg }}>
                            {getStatusIcon(issue.status)}
                          </div>
                          <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 flex-1 min-w-0 break-words">{issue.title}</h3>
                        </div>
                        <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 leading-relaxed break-words">{issue.description}</p>

                        {/* Metadata - Mobile Optimized */}
                        <div className="flex flex-wrap gap-2">
                          <span className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-gray-100 text-gray-700 text-xs sm:text-sm font-semibold border-2 border-gray-200 capitalize">
                            {issue.category}
                          </span>
                          <span 
                            className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold border-2"
                            style={{ background: statusColor.bg, color: statusColor.text, borderColor: statusColor.border }}
                          >
                            {formatStatus(issue.status)}
                          </span>
                          {issue.hostel_name && (
                            <span className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-gray-100 text-gray-700 text-xs sm:text-sm font-semibold border-2 border-gray-200">
                              {issue.hostel_name}
                            </span>
                          )}
                        </div>

                        {/* Assignee info - Mobile Optimized */}
                        {issue.assignee && (
                          <div className="mt-3 sm:mt-4 px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl bg-blue-50 border-2 border-blue-100 inline-flex items-center gap-2">
                            <UserPlus className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 flex-shrink-0" />
                            <span className="text-xs sm:text-sm font-medium text-blue-700 truncate">
                              Assigned to: {issue.assignee.full_name}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Dates - Mobile Optimized */}
                    <div className="text-xs sm:text-sm text-gray-600 border-t-2 border-gray-100 pt-3 sm:pt-4 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">Reported:</span>
                        <span className="truncate">{new Date(issue.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                      </div>
                      {issue.resolved_at && (
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">Resolved:</span>
                          <span className="truncate">{new Date(issue.resolved_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons - Mobile Optimized */}
                    {(user.role === 'caretaker' || user.role === 'admin') && issue.status !== 'resolved' && issue.status !== 'closed' && (
                      <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row gap-2 sm:gap-3">
                        {/* Assign button - Only shown for admins, not caretakers */}
                        {user.role === 'admin' && !issue.assigned_to && (
                          <Button
                            onClick={() => {
                              setSelectedIssue(issue)
                              setShowAssignModal(true)
                            }}
                            variant="outline"
                            className="flex-1 sm:flex-none border-2 font-semibold h-10 sm:h-11 rounded-xl gap-2 text-sm sm:text-base"
                            style={{ borderColor: '#014b89', color: '#014b89' }}
                          >
                            <UserPlus className="w-4 h-4" />
                            Assign
                          </Button>
                        )}
                        <Button
                          onClick={() => {
                            setSelectedIssue(issue)
                            setStatusData({ status: '', notes: '' })
                            setShowStatusModal(true)
                          }}
                          className="flex-1 sm:flex-none font-semibold h-10 sm:h-11 rounded-xl gap-2 text-white text-sm sm:text-base"
                          style={{ background: '#f26918' }}
                        >
                          Update Status
                        </Button>
                      </div>
                    )}

                    {user.role === 'student' && (
                      <div className="mt-4 sm:mt-6">
                        <Button
                          onClick={() => {
                            setDetailsIssue(issue)
                            setShowDetailsModal(true)
                          }}
                          variant="outline"
                          className="border-2 font-semibold h-10 sm:h-11 rounded-xl gap-2 group transition-all text-sm sm:text-base"
                          style={{ borderColor: '#014b89', color: '#014b89' }}
                        >
                          View Details
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>

      {/* Assign Modal - Mobile Optimized (Admin Only) */}
      {user.role === 'admin' && showAssignModal && selectedIssue && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4" style={{ color: '#014b89' }}>Assign Issue</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">Assign &ldquo;{selectedIssue.title}&rdquo; to a caretaker</p>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-gray-900 mb-2 block">Caretaker ID *</label>
                <Input
                  placeholder="Enter caretaker user ID"
                  value={assignData.assigned_to}
                  onChange={(e) => setAssignData({ ...assignData, assigned_to: e.target.value })}
                  className="border-2 rounded-xl h-11 sm:h-12 text-sm sm:text-base"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-gray-900 mb-2 block">Notes (Optional)</label>
                <textarea
                  placeholder="Add assignment notes..."
                  value={assignData.notes}
                  onChange={(e) => setAssignData({ ...assignData, notes: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-xl resize-none text-sm sm:text-base"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-6">
              <Button
                onClick={handleAssign}
                className="flex-1 h-11 sm:h-12 rounded-xl text-white font-bold text-sm sm:text-base"
                style={{ background: '#014b89' }}
                disabled={isSubmitting || !assignData.assigned_to}
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Assign'}
              </Button>
              <Button
                onClick={() => { setShowAssignModal(false); setSelectedIssue(null); }}
                variant="outline"
                className="h-11 sm:h-12 rounded-xl font-semibold border-2 text-sm sm:text-base"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal - Mobile Optimized */}
      {showStatusModal && selectedIssue && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4" style={{ color: '#014b89' }}>Update Status</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">Update status for &ldquo;{selectedIssue.title}&rdquo;</p>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-gray-900 mb-2 block">New Status *</label>
                <select
                  value={statusData.status}
                  onChange={(e) => setStatusData({ ...statusData, status: e.target.value })}
                  className="w-full h-11 sm:h-12 px-3 sm:px-4 border-2 border-gray-200 rounded-xl bg-white text-gray-900 font-medium text-sm sm:text-base"
                >
                  <option value="">Select status...</option>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-bold text-gray-900 mb-2 block">Notes (Optional)</label>
                <textarea
                  placeholder="Add status update notes..."
                  value={statusData.notes}
                  onChange={(e) => setStatusData({ ...statusData, notes: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-xl resize-none text-sm sm:text-base"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-6">
              <Button
                onClick={handleStatusUpdate}
                className="flex-1 h-11 sm:h-12 rounded-xl text-white font-bold text-sm sm:text-base"
                style={{ background: '#f26918' }}
                disabled={isSubmitting || !statusData.status}
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Update Status'}
              </Button>
              <Button
                onClick={() => { setShowStatusModal(false); setSelectedIssue(null); }}
                variant="outline"
                className="h-11 sm:h-12 rounded-xl font-semibold border-2 text-sm sm:text-base"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Issue Details Modal - Mobile Optimized */}
      {showDetailsModal && detailsIssue && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold" style={{ color: '#014b89' }}>Issue Details</h2>
              <button
                onClick={() => { setShowDetailsModal(false); setDetailsIssue(null); }}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center hover:bg-gray-100 transition-colors flex-shrink-0"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            <div className="space-y-4 sm:space-y-6">
              {/* Title */}
              <div>
                <label className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Title</label>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 break-words">{detailsIssue.title}</h3>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Description</label>
                <p className="text-sm sm:text-base text-gray-700 leading-relaxed bg-gray-50 p-3 sm:p-4 rounded-xl border-2 border-gray-100 break-words">
                  {detailsIssue.description}
                </p>
              </div>

              {/* Status, Category, Priority - Mobile Optimized */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                <div>
                  <label className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Status</label>
                  <span 
                    className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold border-2 inline-block"
                    style={{ 
                      background: getStatusColor(detailsIssue.status).bg, 
                      color: getStatusColor(detailsIssue.status).text, 
                      borderColor: getStatusColor(detailsIssue.status).border 
                    }}
                  >
                    {formatStatus(detailsIssue.status)}
                  </span>
                </div>

                <div>
                  <label className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Category</label>
                  <span className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-gray-100 text-gray-700 text-xs sm:text-sm font-semibold border-2 border-gray-200 inline-block capitalize">
                    {detailsIssue.category}
                  </span>
                </div>

                <div className="col-span-2 md:col-span-1">
                  <label className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Priority</label>
                  <span 
                    className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold border-2 inline-block capitalize"
                    style={{ 
                      background: getPriorityColor(detailsIssue.priority).bg, 
                      color: getPriorityColor(detailsIssue.priority).text, 
                      borderColor: getPriorityColor(detailsIssue.priority).border 
                    }}
                  >
                    {detailsIssue.priority}
                  </span>
                </div>
              </div>

              {/* Location & Hostel */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {detailsIssue.hostel_name && (
                  <div>
                    <label className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Hostel</label>
                    <p className="text-sm sm:text-base text-gray-900 font-semibold">📍 {detailsIssue.hostel_name}</p>
                  </div>
                )}
                {detailsIssue.room_number && (
                  <div>
                    <label className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Room</label>
                    <p className="text-sm sm:text-base text-gray-900 font-semibold">{detailsIssue.room_number}</p>
                  </div>
                )}
              </div>

              {detailsIssue.location && (
                <div>
                  <label className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Location</label>
                  <p className="text-sm sm:text-base text-gray-900 font-medium break-words">{detailsIssue.location}</p>
                </div>
              )}

              {/* Assignee */}
              {detailsIssue.assignee && (
                <div>
                  <label className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Assigned To</label>
                  <div className="px-3 sm:px-4 py-2 sm:py-3 rounded-xl bg-blue-50 border-2 border-blue-100 flex items-center gap-2">
                    <UserPlus className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
                    <span className="text-xs sm:text-sm font-medium text-blue-700 truncate">{detailsIssue.assignee.full_name}</span>
                  </div>
                </div>
              )}

              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-3 sm:pt-4 border-t-2 border-gray-100">
                <div>
                  <label className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Reported On</label>
                  <p className="text-xs sm:text-sm text-gray-900 font-medium">
                    {new Date(detailsIssue.created_at).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                {detailsIssue.resolved_at && (
                  <div>
                    <label className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Resolved On</label>
                    <p className="text-xs sm:text-sm text-gray-900 font-medium">
                      {new Date(detailsIssue.resolved_at).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Note */}
              <div className="bg-blue-50 border-2 border-blue-100 rounded-xl p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-blue-700 font-medium">
                  Track your issue status here. You'll be notified when it's updated by the caretaker.
                </p>
              </div>
            </div>

            <div className="mt-6 sm:mt-8">
              <Button
                onClick={() => { setShowDetailsModal(false); setDetailsIssue(null); }}
                className="w-full h-11 sm:h-12 rounded-xl text-white font-bold text-sm sm:text-base"
                style={{ background: '#014b89' }}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
