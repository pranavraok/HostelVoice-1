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
    const colors: Record<string, { bg: string, text: string, border: string }> = {
      low: { bg: 'rgba(1, 75, 137, 0.1)', text: '#014b89', border: 'rgba(1, 75, 137, 0.3)' },
      medium: { bg: 'rgba(242, 105, 24, 0.1)', text: '#f26918', border: 'rgba(242, 105, 24, 0.3)' },
      high: { bg: 'rgba(239, 68, 68, 0.1)', text: '#ef4444', border: 'rgba(239, 68, 68, 0.3)' }
    }
    return colors[priority]
  }

  const getStatusIcon = (status: IssueDetail['status']) => {
    switch (status) {
      case 'resolved':
        return <CheckCircle className="w-5 h-5" style={{ color: '#10b981' }} />
      case 'in-progress':
        return <Clock className="w-5 h-5" style={{ color: '#f26918' }} />
      default:
        return <AlertCircle className="w-5 h-5" style={{ color: '#014b89' }} />
    }
  }

  const getStatusColor = (status: IssueDetail['status']) => {
    switch (status) {
      case 'resolved':
        return { bg: 'rgba(16, 185, 129, 0.1)', text: '#10b981', border: 'rgba(16, 185, 129, 0.3)' }
      case 'in-progress':
        return { bg: 'rgba(242, 105, 24, 0.1)', text: '#f26918', border: 'rgba(242, 105, 24, 0.3)' }
      default:
        return { bg: 'rgba(1, 75, 137, 0.1)', text: '#014b89', border: 'rgba(1, 75, 137, 0.3)' }
    }
  }

  const stats = [
    { label: 'Total Issues', value: issues.length, color: '#6b7280', bgColor: 'rgba(107, 114, 128, 0.1)' },
    { label: 'Open', value: issues.filter(i => i.status === 'open').length, color: '#014b89', bgColor: 'rgba(1, 75, 137, 0.1)' },
    { label: 'In Progress', value: issues.filter(i => i.status === 'in-progress').length, color: '#f26918', bgColor: 'rgba(242, 105, 24, 0.1)' },
    { label: 'Resolved', value: issues.filter(i => i.status === 'resolved').length, color: '#10b981', bgColor: 'rgba(16, 185, 129, 0.1)' }
  ]

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
            linear-gradient(to right, rgba(242, 105, 24, 0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(242, 105, 24, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
        }}
      />

      <div className="p-4 md:p-8 lg:p-12 relative z-10">
        {/* Header */}
        <div className="mb-8 md:mb-12 animate-fade-in">
          <h1 className="text-3xl md:text-5xl font-bold mb-2" style={{ color: '#014b89' }}>Issue Management</h1>
          <p className="text-base md:text-lg text-gray-600">Manage and track all reported hostel issues</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12">
          {stats.map((stat, i) => (
            <div 
              key={stat.label} 
              className="bg-white border-2 border-gray-100 rounded-2xl p-6 hover:shadow-xl transition-all animate-fade-in"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <p className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">{stat.label}</p>
              <p className="text-4xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Issues List */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl md:text-3xl font-bold mb-6" style={{ color: '#014b89' }}>Active Issues</h2>
            <div className="space-y-4">
              {issues.map((issue, i) => {
                const priorityColor = getPriorityColor(issue.priority)
                const statusColor = getStatusColor(issue.status)
                return (
                  <div
                    key={issue.id}
                    className={`bg-white border-2 rounded-2xl p-6 cursor-pointer transition-all hover:shadow-xl animate-fade-in ${
                      selectedIssue?.id === issue.id ? 'ring-4' : ''
                    }`}
                    style={{ 
                      borderColor: selectedIssue?.id === issue.id ? '#f26918' : '#f3f4f6',
                      outlineColor: selectedIssue?.id === issue.id ? 'rgba(242, 105, 24, 0.2)' : undefined,
                      animationDelay: `${i * 0.1}s`
                    }}
                    onClick={() => setSelectedIssue(issue)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3 flex-1">
                        <div 
                          className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{ background: statusColor.bg }}
                        >
                          {getStatusIcon(issue.status)}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-gray-900">{issue.title}</h3>
                          <p className="text-xs text-gray-500 font-medium mt-1">Issue ID: #{issue.id}</p>
                        </div>
                      </div>
                      <span 
                        className="px-3 py-1.5 rounded-xl text-xs font-bold border-2"
                        style={{ 
                          background: priorityColor.bg, 
                          color: priorityColor.text,
                          borderColor: priorityColor.border
                        }}
                      >
                        {issue.priority.toUpperCase()}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1.5 rounded-xl bg-gray-100 text-gray-700 text-xs font-semibold border-2 border-gray-200">
                        Room {issue.roomNumber}
                      </span>
                      <span className="px-3 py-1.5 rounded-xl bg-gray-100 text-gray-700 text-xs font-semibold border-2 border-gray-200">
                        {issue.category}
                      </span>
                      <span className="px-3 py-1.5 rounded-xl bg-gray-100 text-gray-700 text-xs font-semibold border-2 border-gray-200">
                        {new Date(issue.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Issue Details Panel */}
          <div className="lg:col-span-1">
            {selectedIssue ? (
              <div className="bg-white border-2 border-gray-200 rounded-3xl p-6 md:p-8 sticky top-4 shadow-xl">
                <h3 className="text-2xl font-bold mb-6" style={{ color: '#014b89' }}>Issue Details</h3>

                <div className="space-y-6">
                  {/* Title */}
                  <div>
                    <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Title</p>
                    <p className="font-bold text-gray-900">{selectedIssue.title}</p>
                  </div>

                  {/* Description */}
                  <div>
                    <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Description</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{selectedIssue.description}</p>
                  </div>

                  {/* Status */}
                  <div>
                    <p className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">Status</p>
                    <div className="flex gap-2 flex-wrap">
                      {(['open', 'in-progress', 'resolved'] as const).map((status) => {
                        const statusColor = getStatusColor(status)
                        return (
                          <button
                            key={status}
                            onClick={() => handleStatusChange(selectedIssue.id, status)}
                            className="px-4 py-2 rounded-xl text-xs font-bold transition-all border-2"
                            style={{
                              background: selectedIssue.status === status ? statusColor.bg : '#f3f4f6',
                              color: selectedIssue.status === status ? statusColor.text : '#6b7280',
                              borderColor: selectedIssue.status === status ? statusColor.border : '#e5e7eb'
                            }}
                          >
                            {status.replace('-', ' ').toUpperCase()}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Reporter */}
                  <div>
                    <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Reported By</p>
                    <p className="text-sm font-semibold text-gray-900">{selectedIssue.reportedBy}</p>
                  </div>

                  {/* Resolution */}
                  {selectedIssue.resolution && (
                    <div className="rounded-2xl p-4 border-2" style={{ background: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
                      <p className="text-xs font-bold mb-2 uppercase tracking-wider" style={{ color: '#10b981' }}>Resolution</p>
                      <p className="text-sm" style={{ color: '#059669' }}>{selectedIssue.resolution}</p>
                    </div>
                  )}

                  {/* Add Resolution */}
                  {selectedIssue.status !== 'resolved' && (
                    <div>
                      <p className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">Add Resolution</p>
                      <textarea
                        value={resolution}
                        onChange={(e) => setResolution(e.target.value)}
                        placeholder="Describe how this issue was resolved..."
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#f26918] focus:ring-[#f26918] resize-none font-medium"
                        rows={4}
                      />
                      <Button
                        onClick={() => handleResolve(selectedIssue.id)}
                        disabled={!resolution.trim()}
                        className="w-full mt-3 text-white font-bold h-12 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                        style={{ background: '#10b981' }}
                        onMouseEnter={(e) => !resolution.trim() ? null : e.currentTarget.style.background = '#059669'}
                        onMouseLeave={(e) => e.currentTarget.style.background = '#10b981'}
                      >
                        Mark as Resolved
                      </Button>
                    </div>
                  )}

                  {/* Dates */}
                  <div className="border-t-2 border-gray-200 pt-4 space-y-2">
                    <p className="text-xs text-gray-600">
                      <span className="font-bold">Created:</span> {new Date(selectedIssue.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                    <p className="text-xs text-gray-600">
                      <span className="font-bold">Updated:</span> {new Date(selectedIssue.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white border-2 border-gray-200 rounded-3xl p-12 text-center shadow-lg">
                <div 
                  className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
                  style={{ background: 'rgba(242, 105, 24, 0.1)' }}
                >
                  <MessageSquare className="w-10 h-10" style={{ color: '#f26918' }} />
                </div>
                <p className="text-gray-600 font-semibold">Select an issue to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
