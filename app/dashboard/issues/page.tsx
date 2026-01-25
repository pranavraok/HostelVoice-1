'use client'

import React from "react"

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AlertCircle, X, Plus, CheckCircle, Clock } from 'lucide-react'

interface Issue {
  id: string
  title: string
  description: string
  category: string
  status: 'open' | 'in-progress' | 'resolved'
  createdAt: string
  updatedAt: string
}

export default function IssuesPage() {
  const { user } = useAuth()
  const [showForm, setShowForm] = useState(false)
  const [issues, setIssues] = useState<Issue[]>([
    {
      id: '1',
      title: 'Water leakage in bathroom',
      description: 'There is a continuous leak from the ceiling',
      category: 'Maintenance',
      status: 'in-progress',
      createdAt: '2026-01-20',
      updatedAt: '2026-01-22'
    },
    {
      id: '2',
      title: 'AC not working properly',
      description: 'AC is making unusual noise and not cooling',
      category: 'Electrical',
      status: 'open',
      createdAt: '2026-01-23',
      updatedAt: '2026-01-23'
    }
  ])

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Maintenance'
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newIssue: Issue = {
      id: String(issues.length + 1),
      title: formData.title,
      description: formData.description,
      category: formData.category,
      status: 'open',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    }
    setIssues([newIssue, ...issues])
    setFormData({ title: '', description: '', category: 'Maintenance' })
    setShowForm(false)
  }

  const getStatusIcon = (status: Issue['status']) => {
    switch (status) {
      case 'resolved':
        return <CheckCircle className="w-5 h-5 text-green-400" />
      case 'in-progress':
        return <Clock className="w-5 h-5 text-accent" />
      default:
        return <AlertCircle className="w-5 h-5 text-orange-400" />
    }
  }

  const getStatusColor = (status: Issue['status']) => {
    switch (status) {
      case 'resolved':
        return 'bg-green-500/10 text-green-400'
      case 'in-progress':
        return 'bg-accent/10 text-accent'
      default:
        return 'bg-orange-500/10 text-orange-400'
    }
  }

  if (!user) return null

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Report & Track Issues</h1>
          <p className="text-muted-foreground">
            {user.role === 'student' 
              ? 'Report maintenance issues and track their status'
              : 'Manage and track all reported issues'}
          </p>
        </div>
        {user.role === 'student' && (
          <Button
            onClick={() => setShowForm(!showForm)}
            className="mt-4 md:mt-0 bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
          >
            <Plus className="w-4 h-4" />
            Report New Issue
          </Button>
        )}
      </div>

      {/* Report Form */}
      {showForm && user.role === 'student' && (
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Report a New Issue</h2>
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
              <label className="text-sm font-medium mb-2 block">Issue Title</label>
              <Input
                type="text"
                placeholder="e.g., Water leakage in bathroom"
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
                <option>Maintenance</option>
                <option>Electrical</option>
                <option>Plumbing</option>
                <option>Cleanliness</option>
                <option>Safety</option>
                <option>Other</option>
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="text-sm font-medium mb-2 block">Description</label>
              <textarea
                placeholder="Provide details about the issue..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                rows={4}
                required
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                Submit Issue
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

      {/* Issues List */}
      <div className="space-y-4">
        {issues.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-8 text-center">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              {user.role === 'student' ? 'No issues reported yet' : 'No issues to manage'}
            </p>
            {user.role === 'student' && (
              <Button
                onClick={() => setShowForm(true)}
                className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
              >
                <Plus className="w-4 h-4" />
                Report Your First Issue
              </Button>
            )}
          </div>
        ) : (
          issues.map((issue) => (
            <div
              key={issue.id}
              className="bg-card border border-border rounded-lg p-6 hover:border-accent/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {getStatusIcon(issue.status)}
                    <h3 className="text-lg font-semibold">{issue.title}</h3>
                  </div>
                  <p className="text-muted-foreground mb-3">{issue.description}</p>

                  {/* Metadata */}
                  <div className="flex flex-wrap gap-3 text-sm">
                    <span className="px-3 py-1 rounded-full bg-muted/50 text-muted-foreground">
                      {issue.category}
                    </span>
                    <span className={`px-3 py-1 rounded-full font-medium ${getStatusColor(issue.status)}`}>
                      {issue.status.charAt(0).toUpperCase() + issue.status.slice(1).replace('-', ' ')}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-muted/50 text-muted-foreground">
                      ID: #{issue.id}
                    </span>
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="text-xs text-muted-foreground border-t border-border pt-3">
                <div>Reported: {issue.createdAt}</div>
                <div>Last Updated: {issue.updatedAt}</div>
              </div>

              {/* Action Buttons */}
              {user.role === 'student' && (
                <div className="mt-4 flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 border-border hover:bg-muted/50 bg-transparent"
                    disabled={issue.status === 'resolved'}
                  >
                    View Details
                  </Button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
