'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { CheckCircle, Clock, AlertCircle, MessageSquare } from 'lucide-react'

interface IssueDetail {
  id: string
  title: string
  description: string
  category: string
  status: 'open' | 'in-progress' | 'resolved'
  reportedBy: string
  roomNumber: string
  priority: 'low' | 'medium' | 'high'
  createdAt: string
  updatedAt: string
  resolution?: string
}

export function CaretakerIssueManager() {
  const [issues, setIssues] = useState<IssueDetail[]>([
    {
      id: '1',
      title: 'Water leakage in bathroom',
      description: 'There is a continuous leak from the ceiling',
      category: 'Maintenance',
      status: 'in-progress',
      reportedBy: 'Arjun Singh',
      roomNumber: 'A-203',
      priority: 'high',
      createdAt: '2026-01-20',
      updatedAt: '2026-01-22',
      resolution: 'Plumber assigned, fixing the ceiling leak'
    },
    {
      id: '2',
      title: 'AC not working properly',
      description: 'AC is making unusual noise and not cooling',
      category: 'Electrical',
      status: 'open',
      reportedBy: 'John Doe',
      roomNumber: 'B-105',
      priority: 'high',
      createdAt: '2026-01-23',
      updatedAt: '2026-01-23'
    },
    {
      id: '3',
      title: 'Light bulb replacement needed',
      description: 'Corridor light is not working',
      category: 'Maintenance',
      status: 'open',
      reportedBy: 'Staff',
      roomNumber: 'Corridor-2',
      priority: 'low',
      createdAt: '2026-01-23',
      updatedAt: '2026-01-23'
    }
  ])

  const [selectedIssue, setSelectedIssue] = useState<IssueDetail | null>(null)
  const [resolution, setResolution] = useState('')

  const handleStatusChange = (issueId: string, newStatus: IssueDetail['status']) => {
    setIssues(issues.map(issue =>
      issue.id === issueId ? { ...issue, status: newStatus, updatedAt: new Date().toISOString().split('T')[0] } : issue
    ))
  }

  const handleResolve = (issueId: string) => {
    if (!resolution.trim()) return

    setIssues(issues.map(issue =>
      issue.id === issueId
        ? {
          ...issue,
          status: 'resolved',
          resolution: resolution,
          updatedAt: new Date().toISOString().split('T')[0]
        }
        : issue
    ))
    setResolution('')
    setSelectedIssue(null)
  }

  const getPriorityColor = (priority: IssueDetail['priority']) => {
    const colors: Record<string, string> = {
      low: 'bg-blue-500/10 text-blue-400',
      medium: 'bg-yellow-500/10 text-yellow-400',
      high: 'bg-red-500/10 text-red-400'
    }
    return colors[priority]
  }

  const getStatusIcon = (status: IssueDetail['status']) => {
    switch (status) {
      case 'resolved':
        return <CheckCircle className="w-5 h-5 text-green-400" />
      case 'in-progress':
        return <Clock className="w-5 h-5 text-accent" />
      default:
        return <AlertCircle className="w-5 h-5 text-orange-400" />
    }
  }

  const stats = [
    { label: 'Total Issues', value: issues.length, color: 'text-muted-foreground' },
    { label: 'Open', value: issues.filter(i => i.status === 'open').length, color: 'text-orange-400' },
    { label: 'In Progress', value: issues.filter(i => i.status === 'in-progress').length, color: 'text-accent' },
    { label: 'Resolved', value: issues.filter(i => i.status === 'resolved').length, color: 'text-green-400' }
  ]

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Issue Management</h1>
        <p className="text-muted-foreground">Manage and track all reported hostel issues</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-card border border-border rounded-lg p-4">
            <p className="text-muted-foreground text-sm mb-1">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Issues List */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Active Issues</h2>
          <div className="space-y-4">
            {issues.map((issue) => (
              <div
                key={issue.id}
                className={`bg-card border rounded-lg p-4 cursor-pointer transition-all hover:border-accent/50 ${
                  selectedIssue?.id === issue.id ? 'border-accent ring-2 ring-accent/30' : 'border-border'
                }`}
                onClick={() => setSelectedIssue(issue)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 flex-1">
                    {getStatusIcon(issue.status)}
                    <div>
                      <h3 className="font-semibold">{issue.title}</h3>
                      <p className="text-xs text-muted-foreground">ID: #{issue.id}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(issue.priority)}`}>
                    {issue.priority.toUpperCase()}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="px-2 py-1 rounded bg-muted/50 text-muted-foreground">
                    Room {issue.roomNumber}
                  </span>
                  <span className="px-2 py-1 rounded bg-muted/50 text-muted-foreground">
                    {issue.category}
                  </span>
                  <span className="px-2 py-1 rounded bg-muted/50 text-muted-foreground">
                    {issue.createdAt}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Issue Details Panel */}
        <div className="lg:col-span-1">
          {selectedIssue ? (
            <div className="bg-card border border-border rounded-lg p-6 sticky top-4">
              <h3 className="text-lg font-semibold mb-4">Issue Details</h3>

              <div className="space-y-4">
                {/* Title */}
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Title</p>
                  <p className="font-semibold">{selectedIssue.title}</p>
                </div>

                {/* Description */}
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Description</p>
                  <p className="text-sm">{selectedIssue.description}</p>
                </div>

                {/* Status */}
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Status</p>
                  <div className="flex gap-2">
                    {(['open', 'in-progress', 'resolved'] as const).map((status) => (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(selectedIssue.id, status)}
                        className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                          selectedIssue.status === status
                            ? 'bg-accent text-accent-foreground'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                        }`}
                      >
                        {status.replace('-', ' ')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reporter */}
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Reported by</p>
                  <p className="text-sm">{selectedIssue.reportedBy}</p>
                </div>

                {/* Resolution */}
                {selectedIssue.resolution && (
                  <div className="bg-green-500/10 border border-green-500/20 rounded p-3">
                    <p className="text-xs text-green-400 font-semibold mb-1">Resolution</p>
                    <p className="text-sm text-green-400/80">{selectedIssue.resolution}</p>
                  </div>
                )}

                {/* Add Resolution */}
                {selectedIssue.status !== 'resolved' && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Add Resolution</p>
                    <textarea
                      value={resolution}
                      onChange={(e) => setResolution(e.target.value)}
                      placeholder="Describe how this issue was resolved..."
                      className="w-full px-3 py-2 rounded-lg bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                      rows={3}
                    />
                    <Button
                      onClick={() => handleResolve(selectedIssue.id)}
                      disabled={!resolution.trim() || selectedIssue.status === 'resolved'}
                      className="w-full mt-2 bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
                    >
                      Mark as Resolved
                    </Button>
                  </div>
                )}

                {/* Dates */}
                <div className="border-t border-border pt-4">
                  <p className="text-xs text-muted-foreground">Created: {selectedIssue.createdAt}</p>
                  <p className="text-xs text-muted-foreground">Updated: {selectedIssue.updatedAt}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-lg p-6 text-center">
              <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Select an issue to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
