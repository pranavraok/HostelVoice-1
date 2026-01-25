'use client'

import React, { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AlertCircle, Plus, Trash2, Edit2, Calendar, Pin } from 'lucide-react'

interface Announcement {
  id: string
  title: string
  message: string
  priority: 'low' | 'medium' | 'high'
  category: string
  createdDate: string
  expiryDate: string
  visibility: 'all' | 'students' | 'caretakers'
  isPinned: boolean
}

export default function AnnouncementsManagePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [announcements, setAnnouncements] = useState<Announcement[]>([
    {
      id: '1',
      title: 'Maintenance Schedule',
      message: 'Block A water maintenance on Monday from 10 AM to 4 PM',
      priority: 'high',
      category: 'Maintenance',
      createdDate: '2025-01-20',
      expiryDate: '2025-02-20',
      visibility: 'all',
      isPinned: true
    },
    {
      id: '2',
      title: 'Visiting Hours Updated',
      message: 'New visiting hours: 2 PM to 8 PM on weekends',
      priority: 'medium',
      category: 'Rules',
      createdDate: '2025-01-18',
      expiryDate: '2025-02-18',
      visibility: 'all',
      isPinned: false
    }
  ])

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<{
    title: string
    message: string
    priority: 'low' | 'medium' | 'high'
    category: string
    expiryDate: string
    visibility: 'all' | 'students' | 'caretakers'
  }>({
    title: '',
    message: '',
    priority: 'medium',
    category: 'General',
    expiryDate: '',
    visibility: 'all'
  })

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-8">
        <div className="max-w-md w-full rounded-3xl p-8 border-2 shadow-xl" style={{ borderColor: 'rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.05)' }}>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(239, 68, 68, 0.15)' }}>
              <AlertCircle className="w-6 h-6" style={{ color: '#ef4444' }} />
            </div>
            <div>
              <h3 className="font-bold text-xl text-gray-900 mb-2">Access Denied</h3>
              <p className="text-gray-700 leading-relaxed">Only administrators can manage announcements.</p>
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (editingId) {
      setAnnouncements(
        announcements.map(a =>
          a.id === editingId
            ? {
                ...a,
                ...formData,
                createdDate: a.createdDate
              }
            : a
        )
      )
      setEditingId(null)
    } else {
      const newAnnouncement: Announcement = {
        id: Date.now().toString(),
        ...formData,
        createdDate: new Date().toISOString().split('T')[0],
        isPinned: false
      }
      setAnnouncements([newAnnouncement, ...announcements])
    }

    setFormData({
      title: '',
      message: '',
      priority: 'medium',
      category: 'General',
      expiryDate: '',
      visibility: 'all'
    })
    setShowForm(false)
  }

  const handleEdit = (announcement: Announcement) => {
    setFormData({
      title: announcement.title,
      message: announcement.message,
      priority: announcement.priority,
      category: announcement.category,
      expiryDate: announcement.expiryDate,
      visibility: announcement.visibility
    })
    setEditingId(announcement.id)
    setShowForm(true)
  }

  const handleDelete = (id: string) => {
    setAnnouncements(announcements.filter(a => a.id !== id))
  }

  const togglePin = (id: string) => {
    setAnnouncements(
      announcements.map(a =>
        a.id === id ? { ...a, isPinned: !a.isPinned } : a
      )
    )
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

      <div className="max-w-6xl mx-auto px-4 pt-6 pb-24 md:px-8 md:pt-12 md:pb-12 relative z-10">
        <div className="mb-8 md:mb-12 animate-fade-in">
          <h1 className="text-3xl md:text-5xl font-bold mb-2" style={{ color: '#014b89' }}>
            Manage Announcements
          </h1>
          <p className="text-base md:text-lg text-gray-600">Create, edit, and manage hostel announcements</p>
        </div>

        {/* Create/Edit Form */}
        {showForm && (
          <div className="bg-white border-2 rounded-3xl p-6 md:p-8 mb-8 shadow-xl animate-fade-in" style={{ borderColor: 'rgba(242, 105, 24, 0.2)' }}>
            <h2 className="text-2xl md:text-3xl font-bold mb-6" style={{ color: '#014b89' }}>
              {editingId ? 'Edit Announcement' : 'Create New Announcement'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Title */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-900 mb-2">Title *</label>
                  <Input
                    type="text"
                    name="title"
                    placeholder="Announcement title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full border-2 border-gray-200 focus:border-[#014b89] focus:ring-[#014b89] rounded-xl h-12"
                    required
                  />
                </div>

                {/* Message */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-gray-900 mb-2">Message *</label>
                  <textarea
                    name="message"
                    placeholder="Write your announcement message here..."
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={5}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#014b89] focus:ring-[#014b89] font-medium"
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
                    className="w-full h-12 px-4 border-2 border-gray-200 rounded-xl focus:border-[#014b89] focus:ring-[#014b89] bg-white text-gray-900 font-medium"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full h-12 px-4 border-2 border-gray-200 rounded-xl focus:border-[#014b89] focus:ring-[#014b89] bg-white text-gray-900 font-medium"
                  >
                    <option value="General">General</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Rules">Rules & Regulations</option>
                    <option value="Events">Events</option>
                    <option value="Safety">Safety</option>
                    <option value="Academic">Academic</option>
                  </select>
                </div>

                {/* Expiry Date */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Expiry Date *</label>
                  <Input
                    type="date"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                    className="w-full border-2 border-gray-200 focus:border-[#014b89] focus:ring-[#014b89] rounded-xl h-12"
                    required
                  />
                </div>

                {/* Visibility */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Visibility *</label>
                  <select
                    name="visibility"
                    value={formData.visibility}
                    onChange={handleInputChange}
                    className="w-full h-12 px-4 border-2 border-gray-200 rounded-xl focus:border-[#014b89] focus:ring-[#014b89] bg-white text-gray-900 font-medium"
                  >
                    <option value="all">All Users</option>
                    <option value="students">Students Only</option>
                    <option value="caretakers">Caretakers Only</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  type="submit"
                  className="text-white font-bold h-12 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all"
                  style={{ background: '#014b89' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#012d52'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#014b89'}
                >
                  {editingId ? 'Update Announcement' : 'Create Announcement'}
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setEditingId(null)
                    setFormData({
                      title: '',
                      message: '',
                      priority: 'medium',
                      category: 'General',
                      expiryDate: '',
                      visibility: 'all'
                    })
                  }}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold h-12 px-8 rounded-xl"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Create Button */}
        {!showForm && (
          <Button
            onClick={() => setShowForm(true)}
            className="mb-8 text-white font-bold gap-2 h-12 md:h-14 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
            style={{ background: '#f26918' }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#d95a0f'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#f26918'}
          >
            <Plus className="w-5 h-5" />
            New Announcement
          </Button>
        )}

        {/* Announcements List */}
        <div className="space-y-6">
          {announcements.length === 0 ? (
            <div className="bg-white border-2 border-gray-200 rounded-3xl p-12 text-center shadow-lg">
              <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ background: 'rgba(1, 75, 137, 0.1)' }}>
                <AlertCircle className="w-10 h-10" style={{ color: '#014b89' }} />
              </div>
              <p className="text-gray-600 font-semibold text-lg">No announcements yet. Create one to get started!</p>
            </div>
          ) : (
            announcements.map((announcement, index) => {
              const priorityColor = getPriorityColor(announcement.priority)
              const categoryColor = getCategoryColor(announcement.category)
              const visibilityColor = getVisibilityColor(announcement.visibility)
              
              return (
                <div
                  key={announcement.id}
                  className="bg-white rounded-2xl border-2 border-gray-200 p-6 md:p-8 hover:shadow-xl transition-all duration-300 animate-fade-in"
                  style={{ 
                    animationDelay: `${index * 0.1}s`,
                    borderColor: announcement.isPinned ? 'rgba(242, 105, 24, 0.3)' : undefined,
                    background: announcement.isPinned ? 'linear-gradient(to right, rgba(242, 105, 24, 0.05), transparent)' : 'white'
                  }}
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xl md:text-2xl font-bold text-gray-900">{announcement.title}</h3>
                        {announcement.isPinned && (
                          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(242, 105, 24, 0.15)' }}>
                            <Pin className="w-5 h-5" style={{ color: '#f26918' }} />
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap mb-4">
                        <span 
                          className="text-xs font-bold px-3 py-1.5 rounded-xl border-2"
                          style={{ 
                            background: priorityColor.bg, 
                            color: priorityColor.text,
                            borderColor: priorityColor.border
                          }}
                        >
                          {announcement.priority.toUpperCase()}
                        </span>
                        <span 
                          className="text-xs font-bold px-3 py-1.5 rounded-xl border-2"
                          style={{ 
                            background: categoryColor.bg, 
                            color: categoryColor.text,
                            borderColor: categoryColor.border
                          }}
                        >
                          {announcement.category}
                        </span>
                        <span 
                          className="text-xs font-bold px-3 py-1.5 rounded-xl border-2"
                          style={{ 
                            background: visibilityColor.bg, 
                            color: visibilityColor.text,
                            borderColor: visibilityColor.border
                          }}
                        >
                          👁️ {announcement.visibility}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-6 leading-relaxed">{announcement.message}</p>

                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-6 border-t-2 border-gray-100">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" style={{ color: '#014b89' }} />
                        <span className="font-medium">Created: {new Date(announcement.createdDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" style={{ color: '#f26918' }} />
                        <span className="font-medium">Expires: {new Date(announcement.expiryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <Button
                        onClick={() => togglePin(announcement.id)}
                        variant="outline"
                        className="border-2 font-semibold px-4 py-2 text-sm rounded-xl"
                        style={{ 
                          borderColor: announcement.isPinned ? '#f26918' : '#e5e7eb',
                          color: announcement.isPinned ? '#f26918' : '#6b7280'
                        }}
                      >
                        {announcement.isPinned ? 'Unpin' : 'Pin'}
                      </Button>
                      <Button
                        onClick={() => handleEdit(announcement)}
                        variant="outline"
                        className="border-2 border-gray-300 text-gray-700 hover:bg-gray-100 px-4 py-2 text-sm rounded-xl flex items-center gap-2 font-semibold"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleDelete(announcement.id)}
                        variant="outline"
                        className="border-2 px-4 py-2 text-sm rounded-xl flex items-center gap-2 font-semibold"
                        style={{ borderColor: 'rgba(239, 68, 68, 0.3)', color: '#ef4444' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
