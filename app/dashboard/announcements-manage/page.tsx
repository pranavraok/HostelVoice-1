'use client'

import React, { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AlertCircle, Plus, Trash2, Edit2, Calendar, Eye, EyeOff } from 'lucide-react'

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
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    priority: 'medium' as const,
    category: 'General',
    expiryDate: '',
    visibility: 'all' as const
  })

  if (user?.role !== 'admin') {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900">Access Denied</h3>
            <p className="text-sm text-red-700">Only administrators can manage announcements.</p>
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
        return 'bg-red-100 text-red-700 border-red-300'
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300'
      case 'low':
        return 'bg-green-100 text-green-700 border-green-300'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Announcements</h1>
        <p className="text-gray-600">Create, edit, and manage hostel announcements</p>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {editingId ? 'Edit Announcement' : 'Create New Announcement'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-900 mb-2">Title</label>
                <Input
                  type="text"
                  name="title"
                  placeholder="Announcement title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full border-gray-300"
                  required
                />
              </div>

              {/* Message */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-900 mb-2">Message</label>
                <textarea
                  name="message"
                  placeholder="Write your announcement message here..."
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={5}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-cyan-500 focus:ring-cyan-500 font-sans text-gray-900"
                  required
                />
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Priority</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-cyan-500 focus:ring-cyan-500 bg-white text-gray-900"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-cyan-500 focus:ring-cyan-500 bg-white text-gray-900"
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
                <label className="block text-sm font-semibold text-gray-900 mb-2">Expiry Date</label>
                <Input
                  type="date"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleInputChange}
                  className="w-full border-gray-300"
                  required
                />
              </div>

              {/* Visibility */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Visibility</label>
                <select
                  name="visibility"
                  value={formData.visibility}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-cyan-500 focus:ring-cyan-500 bg-white text-gray-900"
                >
                  <option value="all">All Users</option>
                  <option value="students">Students Only</option>
                  <option value="caretakers">Caretakers Only</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-semibold px-8 py-2 rounded-lg"
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
                className="bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold px-8 py-2 rounded-lg"
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
          className="mb-8 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-semibold px-6 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          New Announcement
        </Button>
      )}

      {/* Announcements List */}
      <div className="space-y-4">
        {announcements.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <p className="text-gray-600 font-medium">No announcements yet. Create one to get started!</p>
          </div>
        ) : (
          announcements.map(announcement => (
            <div
              key={announcement.id}
              className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-200"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{announcement.title}</h3>
                    {announcement.isPinned && (
                      <span className="w-3 h-3 rounded-full bg-cyan-500"></span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap mb-3">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${getPriorityColor(announcement.priority)}`}>
                      {announcement.priority.toUpperCase()}
                    </span>
                    <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
                      {announcement.category}
                    </span>
                    <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-medium">
                      {announcement.visibility}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-gray-700 mb-4 leading-relaxed">{announcement.message}</p>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Created: {announcement.createdDate}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Expires: {announcement.expiryDate}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => togglePin(announcement.id)}
                    variant="outline"
                    className="border-gray-300 text-gray-700 hover:bg-gray-100 px-3 py-2 text-sm"
                  >
                    {announcement.isPinned ? 'Unpin' : 'Pin'}
                  </Button>
                  <Button
                    onClick={() => handleEdit(announcement)}
                    variant="outline"
                    className="border-gray-300 text-gray-700 hover:bg-gray-100 px-3 py-2 text-sm flex items-center gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDelete(announcement.id)}
                    variant="outline"
                    className="border-red-300 text-red-700 hover:bg-red-50 px-3 py-2 text-sm flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
