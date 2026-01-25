'use client'

import React from "react"

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Megaphone, X, Plus, Pin } from 'lucide-react'

interface Announcement {
  id: string
  title: string
  content: string
  author: string
  category: string
  createdAt: string
  isPinned: boolean
}

export default function AnnouncementsPage() {
  const { user } = useAuth()
  const [showForm, setShowForm] = useState(false)
  const [announcements, setAnnouncements] = useState<Announcement[]>([
    {
      id: '1',
      title: 'Hostel WiFi Maintenance - This Weekend',
      content: 'The WiFi network will be under maintenance on Saturday and Sunday. We apologize for any inconvenience.',
      author: 'Admin',
      category: 'Maintenance',
      createdAt: '2026-01-24',
      isPinned: true
    },
    {
      id: '2',
      title: 'Guest Policy Update',
      content: 'New guest policy has been implemented. Please review the updated rules in the hostel notice board.',
      author: 'Caretaker',
      category: 'Policy',
      createdAt: '2026-01-23',
      isPinned: true
    },
    {
      id: '3',
      title: 'Laundry Services Available',
      content: 'Complimentary laundry service is now available on Wednesdays and Sundays.',
      author: 'Admin',
      category: 'Services',
      createdAt: '2026-01-22',
      isPinned: false
    },
    {
      id: '4',
      title: 'Sports Tournament Registration',
      content: 'Annual inter-hostel sports tournament registration is now open. Teams of 6 members can participate.',
      author: 'Admin',
      category: 'Events',
      createdAt: '2026-01-21',
      isPinned: false
    }
  ])

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'General'
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newAnnouncement: Announcement = {
      id: String(announcements.length + 1),
      title: formData.title,
      content: formData.content,
      author: user?.name || 'Unknown',
      category: formData.category,
      createdAt: new Date().toISOString().split('T')[0],
      isPinned: false
    }
    setAnnouncements([newAnnouncement, ...announcements])
    setFormData({ title: '', content: '', category: 'General' })
    setShowForm(false)
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Maintenance: 'bg-accent/10 text-accent',
      Policy: 'bg-secondary/10 text-secondary',
      Services: 'bg-purple-500/10 text-purple-400',
      Events: 'bg-cyan-500/10 text-cyan-400',
      General: 'bg-muted/50 text-muted-foreground'
    }
    return colors[category] || colors.General
  }

  if (!user) return null

  const pinnedAnnouncements = announcements.filter((a) => a.isPinned)
  const regularAnnouncements = announcements.filter((a) => !a.isPinned)

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Announcements</h1>
          <p className="text-muted-foreground">
            Stay updated with the latest hostel announcements and news
          </p>
        </div>
        {user.role === 'caretaker' && (
          <Button
            onClick={() => setShowForm(!showForm)}
            className="mt-4 md:mt-0 bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
          >
            <Plus className="w-4 h-4" />
            Post Announcement
          </Button>
        )}
      </div>

      {/* Post Form */}
      {showForm && user.role === 'caretaker' && (
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Create New Announcement</h2>
            <button
              onClick={() => setShowForm(false)}
              className="p-1 hover:bg-muted rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label className="text-sm font-medium mb-2 block">Announcement Title</label>
              <Input
                type="text"
                placeholder="e.g., WiFi Maintenance Schedule"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="bg-muted border-border"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option>General</option>
                <option>Maintenance</option>
                <option>Policy</option>
                <option>Services</option>
                <option>Events</option>
              </select>
            </div>

            {/* Content */}
            <div>
              <label className="text-sm font-medium mb-2 block">Content</label>
              <textarea
                placeholder="Write your announcement here..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                rows={5}
                required
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                Post Announcement
              </Button>
              <Button
                type="button"
                onClick={() => setShowForm(false)}
                variant="outline"
                className="border-border"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Pinned Announcements */}
      {pinnedAnnouncements.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Pin className="w-5 h-5 text-accent" />
            Pinned Announcements
          </h2>
          <div className="space-y-4">
            {pinnedAnnouncements.map((announcement) => (
              <div
                key={announcement.id}
                className="bg-card border-2 border-accent/30 rounded-lg p-6 hover:border-accent/50 transition-colors bg-gradient-to-r from-accent/5 to-transparent"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Megaphone className="w-5 h-5 text-accent" />
                      <h3 className="text-lg font-semibold">{announcement.title}</h3>
                    </div>
                    <p className="text-muted-foreground">{announcement.content}</p>
                  </div>
                </div>

                {/* Metadata */}
                <div className="flex flex-wrap gap-3 text-sm">
                  <span className={`px-3 py-1 rounded-full font-medium ${getCategoryColor(announcement.category)}`}>
                    {announcement.category}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-muted/50 text-muted-foreground">
                    {announcement.author}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-muted/50 text-muted-foreground">
                    {announcement.createdAt}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Regular Announcements */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Recent Announcements</h2>
        <div className="space-y-4">
          {regularAnnouncements.length === 0 ? (
            <div className="bg-card border border-border rounded-lg p-8 text-center">
              <Megaphone className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No announcements yet</p>
            </div>
          ) : (
            regularAnnouncements.map((announcement) => (
              <div
                key={announcement.id}
                className="bg-card border border-border rounded-lg p-6 hover:border-accent/30 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">{announcement.title}</h3>
                    <p className="text-muted-foreground">{announcement.content}</p>
                  </div>
                </div>

                {/* Metadata */}
                <div className="flex flex-wrap gap-3 text-sm">
                  <span className={`px-3 py-1 rounded-full font-medium ${getCategoryColor(announcement.category)}`}>
                    {announcement.category}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-muted/50 text-muted-foreground">
                    {announcement.author}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-muted/50 text-muted-foreground">
                    {announcement.createdAt}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
