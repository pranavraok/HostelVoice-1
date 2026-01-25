'use client'

import React from "react"

import { useAuth } from '@/lib/auth-context'
import { TrendingUp, TrendingDown, Users, AlertCircle, CheckCircle, Clock } from 'lucide-react'

interface Metric {
  label: string
  value: string | number
  change: number
  trend: 'up' | 'down'
  icon: React.ComponentType<{ className: string; style?: React.CSSProperties }>
}

export default function AnalyticsPage() {
  const { user } = useAuth()

  const metrics: Metric[] = [
    {
      label: 'Total Issues',
      value: '127',
      change: 12,
      trend: 'up',
      icon: AlertCircle
    },
    {
      label: 'Resolved Issues',
      value: '94',
      change: 8,
      trend: 'up',
      icon: CheckCircle
    },
    {
      label: 'Avg Resolution Time',
      value: '4.2h',
      change: -15,
      trend: 'down',
      icon: Clock
    },
    {
      label: 'Active Residents',
      value: '1,840',
      change: 23,
      trend: 'up',
      icon: Users
    }
  ]

  const issuesByCategory = [
    { category: 'Maintenance', count: 42, percentage: 33, color: '#f26918' },
    { category: 'Electrical', count: 28, percentage: 22, color: '#014b89' },
    { category: 'Plumbing', count: 25, percentage: 20, color: '#a855f7' },
    { category: 'Cleanliness', count: 20, percentage: 16, color: '#06b6d4' },
    { category: 'Other', count: 12, percentage: 9, color: '#6b7280' }
  ]

  const issuesByStatus = [
    { status: 'Resolved', count: 94, color: { bg: 'rgba(16, 185, 129, 0.1)', text: '#10b981', border: 'rgba(16, 185, 129, 0.3)' } },
    { status: 'In Progress', count: 24, color: { bg: 'rgba(242, 105, 24, 0.1)', text: '#f26918', border: 'rgba(242, 105, 24, 0.3)' } },
    { status: 'Open', count: 9, color: { bg: 'rgba(1, 75, 137, 0.1)', text: '#014b89', border: 'rgba(1, 75, 137, 0.3)' } }
  ]

  const hostels = [
    { name: 'North Wing', residents: 180, issues: 15, resolved: 93 },
    { name: 'South Wing', residents: 165, issues: 12, resolved: 89 },
    { name: 'East Wing', residents: 190, issues: 18, resolved: 91 },
    { name: 'West Wing', residents: 175, issues: 14, resolved: 88 },
    { name: 'Central Block', residents: 200, issues: 20, resolved: 95 },
    { name: 'New Hostel', residents: 130, issues: 8, resolved: 87 }
  ]

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

      <div className="max-w-7xl mx-auto px-4 pt-6 pb-24 md:px-8 md:pt-12 md:pb-12 relative z-10">
        {/* Header */}
        <div className="mb-8 md:mb-12 animate-fade-in">
          <h1 className="text-3xl md:text-5xl font-bold mb-2" style={{ color: '#014b89' }}>
            Analytics & Reports
          </h1>
          <p className="text-base md:text-lg text-gray-600">System-wide analytics and performance metrics</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12">
          {metrics.map((metric, i) => {
            const Icon = metric.icon
            const TrendIcon = metric.trend === 'up' ? TrendingUp : TrendingDown
            const isPositive = (metric.trend === 'up' && metric.change > 0) || (metric.trend === 'down' && metric.change < 0)

            return (
              <div 
                key={metric.label} 
                className="bg-white border-2 border-gray-100 rounded-2xl p-6 hover:shadow-xl transition-all animate-fade-in"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(1, 75, 137, 0.1)' }}>
                    <Icon className="w-6 h-6" style={{ color: '#014b89' }} />
                  </div>
                  <div 
                    className="flex items-center gap-1 text-sm font-bold px-3 py-1.5 rounded-xl"
                    style={{ 
                      background: isPositive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      color: isPositive ? '#10b981' : '#ef4444'
                    }}
                  >
                    <TrendIcon className="w-4 h-4" />
                    {Math.abs(metric.change)}%
                  </div>
                </div>
                <p className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">{metric.label}</p>
                <p className="text-4xl font-bold" style={{ color: '#014b89' }}>{metric.value}</p>
              </div>
            )
          })}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-8 md:mb-12">
          {/* Issues by Category */}
          <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 md:p-8 shadow-lg">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8" style={{ color: '#014b89' }}>
              Issues by Category
            </h2>
            <div className="space-y-6">
              {issuesByCategory.map((item) => (
                <div key={item.category}>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-base font-bold text-gray-900">{item.category}</p>
                    <span className="text-sm font-bold px-3 py-1 rounded-lg" style={{ background: `${item.color}15`, color: item.color }}>
                      {item.count}
                    </span>
                  </div>
                  <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ 
                        width: `${item.percentage}%`,
                        background: item.color
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Issues by Status */}
          <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 md:p-8 shadow-lg">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8" style={{ color: '#014b89' }}>
              Issues by Status
            </h2>
            <div className="space-y-4">
              {issuesByStatus.map((item) => (
                <div
                  key={item.status}
                  className="flex items-center justify-between p-5 rounded-xl border-2 transition-all hover:shadow-md"
                  style={{ 
                    background: item.color.bg,
                    borderColor: item.color.border
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ background: item.color.text }}
                    />
                    <span className="font-bold text-gray-900">{item.status}</span>
                  </div>
                  <span 
                    className="px-4 py-2 rounded-xl text-base font-bold"
                    style={{ color: item.color.text }}
                  >
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Hostel Performance */}
        <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 md:p-8 shadow-lg mb-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8" style={{ color: '#014b89' }}>
            Hostel Performance
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="px-4 py-4 text-left font-bold text-gray-600 uppercase tracking-wide text-sm">Hostel</th>
                  <th className="px-4 py-4 text-left font-bold text-gray-600 uppercase tracking-wide text-sm">Residents</th>
                  <th className="px-4 py-4 text-left font-bold text-gray-600 uppercase tracking-wide text-sm">Issues</th>
                  <th className="px-4 py-4 text-left font-bold text-gray-600 uppercase tracking-wide text-sm">Resolved</th>
                  <th className="px-4 py-4 text-left font-bold text-gray-600 uppercase tracking-wide text-sm">Resolution %</th>
                </tr>
              </thead>
              <tbody>
                {hostels.map((hostel, i) => {
                  const resolutionRate = Math.round((hostel.resolved / (hostel.resolved + hostel.issues)) * 100)
                  return (
                    <tr 
                      key={hostel.name} 
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      style={{ animationDelay: `${i * 0.05}s` }}
                    >
                      <td className="px-4 py-4 font-bold text-gray-900">{hostel.name}</td>
                      <td className="px-4 py-4 font-semibold text-gray-700">{hostel.residents}</td>
                      <td className="px-4 py-4">
                        <span className="px-3 py-1.5 rounded-lg text-sm font-bold border-2" style={{ background: 'rgba(1, 75, 137, 0.1)', color: '#014b89', borderColor: 'rgba(1, 75, 137, 0.3)' }}>
                          {hostel.issues}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="px-3 py-1.5 rounded-lg text-sm font-bold border-2" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
                          {hostel.resolved}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-32 h-3 rounded-full bg-gray-100 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{ 
                                width: `${resolutionRate}%`,
                                background: 'linear-gradient(to right, #10b981, #059669)'
                              }}
                            />
                          </div>
                          <span className="font-bold text-base" style={{ color: '#10b981' }}>{resolutionRate}%</span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <div className="bg-white border-2 border-gray-100 rounded-2xl p-5 md:p-6 hover:shadow-xl transition-all">
            <p className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">Avg Response Time</p>
            <p className="text-3xl md:text-4xl font-bold mb-2" style={{ color: '#014b89' }}>4.2h</p>
            <p className="text-xs font-bold" style={{ color: '#10b981' }}>↓ 15% vs last month</p>
          </div>
          <div className="bg-white border-2 border-gray-100 rounded-2xl p-5 md:p-6 hover:shadow-xl transition-all">
            <p className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">System Uptime</p>
            <p className="text-3xl md:text-4xl font-bold mb-2" style={{ color: '#014b89' }}>99.9%</p>
            <p className="text-xs font-bold" style={{ color: '#10b981' }}>Excellent</p>
          </div>
          <div className="bg-white border-2 border-gray-100 rounded-2xl p-5 md:p-6 hover:shadow-xl transition-all">
            <p className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">Total Hostels</p>
            <p className="text-3xl md:text-4xl font-bold mb-2" style={{ color: '#014b89' }}>12</p>
            <p className="text-xs font-bold" style={{ color: '#f26918' }}>Active</p>
          </div>
          <div className="bg-white border-2 border-gray-100 rounded-2xl p-5 md:p-6 hover:shadow-xl transition-all">
            <p className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">Caretakers</p>
            <p className="text-3xl md:text-4xl font-bold mb-2" style={{ color: '#014b89' }}>24</p>
            <p className="text-xs font-bold" style={{ color: '#f26918' }}>On staff</p>
          </div>
        </div>
      </div>
    </div>
  )
}
