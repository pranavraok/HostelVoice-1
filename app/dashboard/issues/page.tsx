'use client'

import React from "react"

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AlertCircle, X, Plus, CheckCircle, Clock, ArrowRight } from 'lucide-react'

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
        return <CheckCircle className="w-5 h-5" style={{ color: '#10b981' }} />
      case 'in-progress':
        return <Clock className="w-5 h-5" style={{ color: '#f26918' }} />
      default:
        return <AlertCircle className="w-5 h-5" style={{ color: '#014b89' }} />
    }
  }

  const getStatusColor = (status: Issue['status']) => {
    switch (status) {
      case 'resolved':
        return { bg: 'rgba(16, 185, 129, 0.1)', text: '#10b981', border: 'rgba(16, 185, 129, 0.3)' }
      case 'in-progress':
        return { bg: 'rgba(242, 105, 24, 0.1)', text: '#f26918', border: 'rgba(242, 105, 24, 0.3)' }
      default:
        return { bg: 'rgba(1, 75, 137, 0.1)', text: '#014b89', border: 'rgba(1, 75, 137, 0.3)' }
    }
  }

  if (!user) return null

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
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 md:mb-12 animate-fade-in">
          <div>
            <h1 className="text-3xl md:text-5xl font-bold mb-2" style={{ color: '#014b89' }}>
              {user.role === 'student' ? 'Report & Track Issues' : 'Manage Issues'}
            </h1>
            <p className="text-base md:text-lg text-gray-600">
              {user.role === 'student' 
                ? 'Report maintenance issues and track their status'
                : 'Manage and track all reported issues'}
            </p>
          </div>
          {user.role === 'student' && (
            <Button
              onClick={() => setShowForm(!showForm)}
              className="text-white font-bold gap-2 w-full md:w-auto h-12 md:h-14 rounded-xl shadow-lg hover:shadow-xl transition-all text-base"
              style={{ background: '#014b89' }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#012d52'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#014b89'}
            >
              <Plus className="w-5 h-5" />
              Report New Issue
            </Button>
          )}
        </div>

        {/* Report Form */}
        {showForm && user.role === 'student' && (
          <div className="bg-white border-2 rounded-3xl p-6 md:p-8 mb-8 shadow-xl animate-fade-in" style={{ borderColor: 'rgba(1, 75, 137, 0.2)' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl md:text-3xl font-bold" style={{ color: '#014b89' }}>Report a New Issue</h2>
              <button
                onClick={() => setShowForm(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label className="text-sm font-bold text-gray-900 mb-2 block">Issue Title *</label>
                <Input
                  type="text"
                  placeholder="e.g., Water leakage in bathroom"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="border-2 border-gray-200 focus:border-[#014b89] focus:ring-[#014b89] rounded-xl h-12"
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label className="text-sm font-bold text-gray-900 mb-2 block">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full h-12 px-4 border-2 border-gray-200 rounded-xl focus:border-[#014b89] focus:ring-[#014b89] bg-white text-gray-900 font-medium transition-all"
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
                <label className="text-sm font-bold text-gray-900 mb-2 block">Description *</label>
                <textarea
                  placeholder="Provide details about the issue..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#014b89] focus:ring-[#014b89] resize-none font-medium"
                  rows={4}
                  required
                />
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button 
                  type="submit" 
                  className="text-white font-bold w-full sm:flex-1 h-12 rounded-xl shadow-lg hover:shadow-xl transition-all"
                  style={{ background: '#014b89' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#012d52'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#014b89'}
                >
                  Submit Issue
                </Button>
                <Button
                  type="button"
                  onClick={() => setShowForm(false)}
                  variant="outline"
                  className="border-2 w-full sm:w-auto h-12 rounded-xl font-semibold"
                  style={{ borderColor: '#014b89', color: '#014b89' }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Issues List */}
        <div className="space-y-4 md:space-y-6">
          {issues.length === 0 ? (
            <div className="bg-white border-2 border-gray-200 rounded-3xl p-12 md:p-16 text-center shadow-lg animate-fade-in">
              <div 
                className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
                style={{ background: 'rgba(1, 75, 137, 0.1)' }}
              >
                <AlertCircle className="w-10 h-10" style={{ color: '#014b89' }} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {user.role === 'student' ? 'No issues reported yet' : 'No issues to manage'}
              </h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {user.role === 'student' 
                  ? 'When you report an issue, it will appear here and you can track its progress'
                  : 'All reported issues will appear here for management'}
              </p>
              {user.role === 'student' && (
                <Button
                  onClick={() => setShowForm(true)}
                  className="text-white font-bold gap-2 h-12 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all"
                  style={{ background: '#014b89' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#012d52'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#014b89'}
                >
                  <Plus className="w-5 h-5" />
                  Report Your First Issue
                </Button>
              )}
            </div>
          ) : (
            issues.map((issue, index) => {
              const statusColor = getStatusColor(issue.status)
              return (
                <div
                  key={issue.id}
                  className="bg-white border-2 border-gray-200 rounded-2xl p-6 md:p-8 hover:border-gray-300 hover:shadow-xl transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div 
                          className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{ background: statusColor.bg }}
                        >
                          {getStatusIcon(issue.status)}
                        </div>
                        <h3 className="text-lg md:text-xl font-bold text-gray-900 flex-1">{issue.title}</h3>
                      </div>
                      <p className="text-gray-600 mb-4 leading-relaxed">{issue.description}</p>

                      {/* Metadata */}
                      <div className="flex flex-wrap gap-2">
                        <span className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 text-sm font-semibold border-2 border-gray-200">
                          {issue.category}
                        </span>
                        <span 
                          className="px-4 py-2 rounded-xl text-sm font-bold border-2"
                          style={{ 
                            background: statusColor.bg, 
                            color: statusColor.text,
                            borderColor: statusColor.border
                          }}
                        >
                          {issue.status.charAt(0).toUpperCase() + issue.status.slice(1).replace('-', ' ')}
                        </span>
                        <span className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 text-sm font-semibold border-2 border-gray-200">
                          ID: #{issue.id}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="text-sm text-gray-600 border-t-2 border-gray-100 pt-4 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">Reported:</span>
                      <span>{new Date(issue.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">Last Updated:</span>
                      <span>{new Date(issue.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {user.role === 'student' && (
                    <div className="mt-6 flex flex-col sm:flex-row gap-3">
                      <Button
                        variant="outline"
                        className="flex-1 sm:flex-none border-2 font-semibold h-11 rounded-xl gap-2 group transition-all"
                        style={{ borderColor: issue.status === 'resolved' ? '#e5e7eb' : '#014b89', color: issue.status === 'resolved' ? '#9ca3af' : '#014b89' }}
                        disabled={issue.status === 'resolved'}
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
      </div>
    </div>
  )
}
