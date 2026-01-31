'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { AlertCircle, Plus, Trash2, Edit2, Calendar, Pin, Loader2, RefreshCw } from 'lucide-react'
import { announcementsApi, Announcement } from '@/lib/api'
import { toast } from 'sonner'

export default function AnnouncementsManagePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [announcementToDelete, setAnnouncementToDelete] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'normal' as 'normal' | 'high' | 'urgent',
    category: 'general',
    expires_at: '',
    target_role: 'all'
  })

  const fetchAnnouncements = useCallback(async () => {
    try {
      setLoading(true)
      const res = await announcementsApi.getAll(1, 100)
      setAnnouncements(res.data || [])
    } catch (error: any) {
      console.error('Error fetching announcements:', error)
      toast.error('Failed to load announcements')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAnnouncements()
  }, [fetchAnnouncements])

  if (user?.role !== 'admin' && user?.role !== 'caretaker') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4 sm:p-8">
        <div className="max-w-md w-full rounded-2xl sm:rounded-3xl p-6 sm:p-8 border-2 shadow-xl" style={{ borderColor: 'rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.05)' }}>
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(239, 68, 68, 0.15)' }}>
              <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: '#ef4444' }} />
            </div>
            <div>
              <h3 className="font-bold text-lg sm:text-xl text-gray-900 mb-2">Access Denied</h3>
              <p className="text-sm sm:text-base text-gray-700 leading-relaxed">Only administrators and caretakers can manage announcements.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const expiresAt = formData.expires_at ? new Date(formData.expires_at).toISOString() : undefined

      if (editingId) {
        await announcementsApi.update(editingId, {
          title: formData.title,
          content: formData.content,
          priority: formData.priority,
          category: formData.category,
          expires_at: expiresAt,
          target_role: formData.target_role
        })
        toast.success('Announcement updated successfully')
      } else {
        await announcementsApi.create({
          title: formData.title,
          content: formData.content,
          priority: formData.priority,
          category: formData.category,
          expires_at: expiresAt,
          target_role: formData.target_role
        })
        toast.success('Announcement created successfully')
      }

      setFormData({
        title: '',
        content: '',
        priority: 'normal',
        category: 'general',
        expires_at: '',
        target_role: 'all'
      })
      setEditingId(null)
      setShowForm(false)
      fetchAnnouncements()
    } catch (error: any) {
      console.error('Error saving announcement:', error)
      toast.error(error.message || 'Failed to save announcement')
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (announcement: Announcement) => {
    setFormData({
      title: announcement.title,
      content: announcement.content,
      priority: announcement.priority as 'normal' | 'high' | 'urgent',
      category: announcement.category,
      expires_at: announcement.expires_at?.split('T')[0] || '',
      target_role: announcement.target_role
    })
    setEditingId(announcement.id)
    setShowForm(true)
  }

  const handleDelete = (id: string) => {
    console.log('Delete clicked for announcement:', id)
    setAnnouncementToDelete(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!announcementToDelete) return

    try {
      console.log('Deleting announcement:', announcementToDelete)
      await announcementsApi.delete(announcementToDelete)
      toast.success('Announcement deleted successfully')
      fetchAnnouncements()
    } catch (error: any) {
      console.error('Delete error:', error)
      // Handle specific permission errors from backend
      if (error.status === 403 || error.message?.includes('permission') || error.message?.includes('authorized')) {
        toast.error('You do not have permission to delete this announcement')
      } else {
        toast.error(error.message || 'Failed to delete announcement')
      }
    } finally {
      setDeleteDialogOpen(false)
      setAnnouncementToDelete(null)
    }
  }

  const togglePin = async (id: string) => {
    try {
      await announcementsApi.toggle(id)
      toast.success('Announcement toggled')
      fetchAnnouncements()
    } catch (error: any) {
      toast.error(error.message || 'Failed to toggle announcement')
    }
  }

  const canEditAnnouncement = (announcement: Announcement): boolean => {
    if (!user) return false
    // Allow both admins and caretakers to see edit/delete buttons
    // Backend will handle actual permission validation
    return user.role === 'admin' || user.role === 'caretaker'
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return { bg: 'rgba(239, 68, 68, 0.1)', text: '#ef4444', border: 'rgba(239, 68, 68, 0.3)' }
      case 'medium':
        return { bg: 'rgba(242, 105, 24, 0.1)', text: '#f26918', border: 'rgba(242, 105, 24, 0.3)' }
      case 'low':
        return { bg: 'rgba(16, 185, 129, 0.1)', text: '#10b981', border: 'rgba(16, 185, 129, 0.3)' }
      default:
        return { bg: 'rgba(107, 114, 128, 0.1)', text: '#6b7280', border: 'rgba(107, 114, 128, 0.3)' }
    }
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, { bg: string, text: string, border: string }> = {
      Maintenance: { bg: 'rgba(242, 105, 24, 0.1)', text: '#f26918', border: 'rgba(242, 105, 24, 0.3)' },
      Rules: { bg: 'rgba(1, 75, 137, 0.1)', text: '#014b89', border: 'rgba(1, 75, 137, 0.3)' },
      Events: { bg: 'rgba(6, 182, 212, 0.1)', text: '#06b6d4', border: 'rgba(6, 182, 212, 0.3)' },
      Safety: { bg: 'rgba(239, 68, 68, 0.1)', text: '#ef4444', border: 'rgba(239, 68, 68, 0.3)' },
      Academic: { bg: 'rgba(168, 85, 247, 0.1)', text: '#a855f7', border: 'rgba(168, 85, 247, 0.3)' },
      General: { bg: 'rgba(107, 114, 128, 0.1)', text: '#6b7280', border: 'rgba(107, 114, 128, 0.3)' }
    }
    return colors[category] || colors.General
  }

  const getVisibilityColor = (visibility: string) => {
    const colors: Record<string, { bg: string, text: string, border: string }> = {
      all: { bg: 'rgba(168, 85, 247, 0.1)', text: '#a855f7', border: 'rgba(168, 85, 247, 0.3)' },
      students: { bg: 'rgba(1, 75, 137, 0.1)', text: '#014b89', border: 'rgba(1, 75, 137, 0.3)' },
      caretakers: { bg: 'rgba(242, 105, 24, 0.1)', text: '#f26918', border: 'rgba(242, 105, 24, 0.3)' }
    }
    return colors[visibility] || colors.all
  }

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.6s ease-out;
        }
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
        <div className="mb-6 sm:mb-8 md:mb-12 animate-fade-in">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-1 sm:mb-2" style={{ color: '#014b89' }}>
            Manage Announcements
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-gray-600">
            {user?.role === 'admin' ? 'Create, edit, and manage all hostel announcements' : 'Create and manage your announcements'}
          </p>
        </div>

        {/* Create/Edit Form - Mobile Optimized */}
        {showForm && (
          <div className="bg-white border-2 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 mb-6 sm:mb-8 shadow-xl animate-fade-in" style={{ borderColor: 'rgba(242, 105, 24, 0.2)' }}>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6" style={{ color: '#014b89' }}>
              {editingId ? 'Edit Announcement' : 'Create New Announcement'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {/* Title */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-900 mb-2">Title *</label>
                  <Input
                    type="text"
                    name="title"
                    placeholder="Announcement title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full border-2 border-gray-200 focus:border-[#014b89] focus:ring-[#014b89] rounded-xl h-11 sm:h-12 text-sm sm:text-base"
                    required
                  />
                </div>

                {/* Content */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-900 mb-2">Content *</label>
                  <textarea
                    name="content"
                    placeholder="Write your announcement content here..."
                    value={formData.content}
                    onChange={handleInputChange}
                    rows={5}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-200 rounded-xl focus:border-[#014b89] focus:ring-[#014b89] font-medium text-sm sm:text-base"
                    required
                  />
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Priority *</label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="w-full h-11 sm:h-12 px-3 sm:px-4 border-2 border-gray-200 rounded-xl focus:border-[#014b89] focus:ring-[#014b89] bg-white text-gray-900 font-medium text-sm sm:text-base"
                  >
                    <option value="normal">Normal</option>
                    <option value="high">High (Pinned)</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full h-11 sm:h-12 px-3 sm:px-4 border-2 border-gray-200 rounded-xl focus:border-[#014b89] focus:ring-[#014b89] bg-white text-gray-900 font-medium text-sm sm:text-base"
                  >
                    <option value="general">General</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="policy">Policy</option>
                    <option value="event">Event</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                {/* Expiry Date */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Expiry Date</label>
                  <Input
                    type="date"
                    name="expires_at"
                    value={formData.expires_at}
                    onChange={handleInputChange}
                    className="w-full border-2 border-gray-200 focus:border-[#014b89] focus:ring-[#014b89] rounded-xl h-11 sm:h-12 text-sm sm:text-base"
                  />
                </div>

                {/* Target Role */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Target Audience *</label>
                  <select
                    name="target_role"
                    value={formData.target_role}
                    onChange={handleInputChange}
                    className="w-full h-11 sm:h-12 px-3 sm:px-4 border-2 border-gray-200 rounded-xl focus:border-[#014b89] focus:ring-[#014b89] bg-white text-gray-900 font-medium text-sm sm:text-base"
                  >
                    <option value="all">All Users</option>
                    <option value="student">Students Only</option>
                    <option value="caretaker">Caretakers Only</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2 sm:pt-4">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="text-white font-bold h-11 sm:h-12 px-6 sm:px-8 rounded-xl shadow-lg hover:shadow-xl transition-all gap-2 text-sm sm:text-base"
                  style={{ background: '#014b89' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#012d52'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#014b89'}
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingId ? 'Update Announcement' : 'Create Announcement'}
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setEditingId(null)
                    setFormData({
                      title: '',
                      content: '',
                      priority: 'normal',
                      category: 'general',
                      expires_at: '',
                      target_role: 'all'
                    })
                  }}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold h-11 sm:h-12 px-6 sm:px-8 rounded-xl text-sm sm:text-base"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Create Button & Refresh - Mobile Optimized */}
        {!showForm && (
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-6 sm:mb-8">
            <Button
              onClick={() => setShowForm(true)}
              className="text-white font-bold gap-2 h-11 sm:h-12 md:h-14 px-4 sm:px-6 rounded-xl shadow-lg hover:shadow-xl transition-all text-sm sm:text-base"
              style={{ background: '#f26918' }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#d95a0f'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#f26918'}
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              New Announcement
            </Button>
            <Button
              variant="outline"
              onClick={fetchAnnouncements}
              disabled={loading}
              className="gap-2 h-11 sm:h-12 text-sm sm:text-base"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-12 sm:py-16 md:py-20">
            <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 animate-spin" style={{ color: '#014b89' }} />
          </div>
        ) : (
          /* Announcements List - Mobile Optimized */
          <div className="space-y-4 sm:space-y-6">
            {announcements.length === 0 ? (
              <div className="bg-white border-2 border-gray-200 rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center shadow-lg">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full mx-auto mb-4 sm:mb-6 flex items-center justify-center" style={{ background: 'rgba(1, 75, 137, 0.1)' }}>
                  <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10" style={{ color: '#014b89' }} />
                </div>
                <p className="text-gray-600 font-semibold text-base sm:text-lg">No announcements yet. Create one to get started!</p>
              </div>
            ) : (
              announcements.map((announcement, index) => {
                const priorityColor = getPriorityColor(announcement.priority)
                const categoryColor = getCategoryColor(announcement.category)
                const visibilityColor = getVisibilityColor(announcement.target_role)
                const isPinned = announcement.priority === 'high' || announcement.is_pinned
                
                return (
                  <div
                    key={announcement.id}
                    className="bg-white rounded-xl sm:rounded-2xl border-2 border-gray-200 p-4 sm:p-6 md:p-8 hover:shadow-xl transition-all duration-300 animate-fade-in"
                    style={{ 
                      animationDelay: `${index * 0.1}s`,
                      borderColor: isPinned ? 'rgba(242, 105, 24, 0.3)' : undefined,
                      background: isPinned ? 'linear-gradient(to right, rgba(242, 105, 24, 0.05), transparent)' : 'white'
                    }}
                  >
                    <div className="flex items-start justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                          <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900 break-words flex-1">{announcement.title}</h3>
                          {isPinned && (
                            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(242, 105, 24, 0.15)' }}>
                              <Pin className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: '#f26918' }} />
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap mb-3 sm:mb-4">
                          <span 
                            className="text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl border-2"
                            style={{ 
                              background: priorityColor.bg, 
                              color: priorityColor.text,
                              borderColor: priorityColor.border
                            }}
                          >
                            {announcement.priority.toUpperCase()}
                          </span>
                          <span 
                            className="text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl border-2"
                            style={{ 
                              background: categoryColor.bg, 
                              color: categoryColor.text,
                              borderColor: categoryColor.border
                            }}
                          >
                            {announcement.category}
                          </span>
                          <span 
                            className="text-[10px] sm:text-xs font-bold px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl border-2"
                            style={{ 
                              background: visibilityColor.bg, 
                              color: visibilityColor.text,
                              borderColor: visibilityColor.border
                            }}
                          >
                            👁️ {announcement.target_role}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm sm:text-base text-gray-700 mb-4 sm:mb-6 leading-relaxed break-words">{announcement.content}</p>

                    <div className="flex flex-col gap-3 sm:gap-4 pt-4 sm:pt-6 border-t-2 border-gray-100">
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" style={{ color: '#014b89' }} />
                          <span className="font-medium">Created: {new Date(announcement.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                        {announcement.expires_at && (
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" style={{ color: '#f26918' }} />
                            <span className="font-medium">Expires: {new Date(announcement.expires_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-wrap">
                        {user?.role === 'admin' && (
                          <Button
                            onClick={() => togglePin(announcement.id)}
                            variant="outline"
                            className="border-2 font-semibold px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-xl h-9 sm:h-auto"
                            style={{ 
                              borderColor: isPinned ? '#f26918' : '#e5e7eb',
                              color: isPinned ? '#f26918' : '#6b7280'
                            }}
                          >
                            {isPinned ? 'Unpin' : 'Pin'}
                          </Button>
                        )}
                        {canEditAnnouncement(announcement) && (
                          <>
                            <Button
                              onClick={() => handleEdit(announcement)}
                              variant="outline"
                              className="border-2 border-gray-300 text-gray-700 hover:bg-gray-100 px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 font-semibold h-9 sm:h-auto"
                            >
                              <Edit2 className="w-3 h-3 sm:w-4 sm:h-4" />
                              Edit
                            </Button>
                            <Button
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                handleDelete(announcement.id)
                              }}
                              variant="outline"
                              className="border-2 px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 font-semibold h-9 sm:h-auto"
                              style={{ borderColor: 'rgba(239, 68, 68, 0.3)', color: '#ef4444' }}
                              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)'}
                              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                              Delete
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-md mx-4 rounded-2xl bg-white" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-left" style={{ color: '#014b89' }}>
              Delete Announcement
            </DialogTitle>
            <DialogDescription className="text-gray-600 mt-2 text-left">
              Are you sure you want to delete this announcement? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <Button
              onClick={confirmDelete}
              className="text-white font-bold h-11 px-6 rounded-xl shadow-lg transition-all flex-1"
              style={{ background: '#ef4444' }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#dc2626'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#ef4444'}
            >
              Delete
            </Button>
            <Button
              onClick={() => {
                setDeleteDialogOpen(false)
                setAnnouncementToDelete(null)
              }}
              className="bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold h-11 px-6 rounded-xl flex-1"
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
