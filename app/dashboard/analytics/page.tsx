'use client'

import React from "react"

import { useAuth } from '@/lib/auth-context'
import { TrendingUp, TrendingDown, Users, AlertCircle, CheckCircle, Clock } from 'lucide-react'

interface Metric {
  label: string
  value: string | number
  change: number
  trend: 'up' | 'down'
  icon: React.ComponentType<{ className: string }>
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
    { category: 'Maintenance', count: 42, percentage: 33 },
    { category: 'Electrical', count: 28, percentage: 22 },
    { category: 'Plumbing', count: 25, percentage: 20 },
    { category: 'Cleanliness', count: 20, percentage: 16 },
    { category: 'Other', count: 12, percentage: 9 }
  ]

  const issuesByStatus = [
    { status: 'Resolved', count: 94, color: 'bg-green-500/20 text-green-400' },
    { status: 'In Progress', count: 24, color: 'bg-accent/20 text-accent' },
    { status: 'Open', count: 9, color: 'bg-orange-500/20 text-orange-400' }
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
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Analytics & Reports</h1>
        <p className="text-muted-foreground">System-wide analytics and performance metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.map((metric) => {
          const Icon = metric.icon
          const TrendIcon = metric.trend === 'up' ? TrendingUp : TrendingDown
          const isPositive = (metric.trend === 'up' && metric.change > 0) || (metric.trend === 'down' && metric.change < 0)

          return (
            <div key={metric.label} className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-lg bg-accent/10">
                  <Icon className="w-6 h-6 text-accent" />
                </div>
                <div className={`flex items-center gap-1 text-sm font-semibold ${
                  isPositive ? 'text-green-400' : 'text-orange-400'
                }`}>
                  <TrendIcon className="w-4 h-4" />
                  {Math.abs(metric.change)}%
                </div>
              </div>
              <p className="text-muted-foreground text-sm mb-1">{metric.label}</p>
              <p className="text-3xl font-bold">{metric.value}</p>
            </div>
          )
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Issues by Category */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-6">Issues by Category</h2>
          <div className="space-y-4">
            {issuesByCategory.map((item) => (
              <div key={item.category}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium">{item.category}</p>
                  <span className="text-sm text-muted-foreground">{item.count}</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-accent to-secondary"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Issues by Status */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-6">Issues by Status</h2>
          <div className="space-y-4">
            {issuesByStatus.map((item) => (
              <div
                key={item.status}
                className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    item.status === 'Resolved' ? 'bg-green-400' :
                    item.status === 'In Progress' ? 'bg-accent' :
                    'bg-orange-400'
                  }`} />
                  <span className="font-medium">{item.status}</span>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${item.color}`}>
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hostel Performance */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-6">Hostel Performance</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Hostel</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Residents</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Issues</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Resolved</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Resolution %</th>
              </tr>
            </thead>
            <tbody>
              {hostels.map((hostel) => {
                const resolutionRate = Math.round((hostel.resolved / (hostel.resolved + hostel.issues)) * 100)
                return (
                  <tr key={hostel.name} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3 font-medium">{hostel.name}</td>
                    <td className="px-4 py-3">{hostel.residents}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded bg-orange-500/10 text-orange-400 text-xs">
                        {hostel.issues}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded bg-green-500/10 text-green-400 text-xs">
                        {hostel.resolved}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-green-500 to-green-400"
                            style={{ width: `${resolutionRate}%` }}
                          />
                        </div>
                        <span className="font-semibold text-accent">{resolutionRate}%</span>
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
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-muted-foreground text-sm mb-2">Avg Response Time</p>
          <p className="text-2xl font-bold">4.2h</p>
          <p className="text-xs text-green-400 mt-1">↓ 15% vs last month</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-muted-foreground text-sm mb-2">System Uptime</p>
          <p className="text-2xl font-bold">99.9%</p>
          <p className="text-xs text-green-400 mt-1">Excellent</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-muted-foreground text-sm mb-2">Total Hostels</p>
          <p className="text-2xl font-bold">12</p>
          <p className="text-xs text-accent mt-1">Active</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-muted-foreground text-sm mb-2">Caretakers</p>
          <p className="text-2xl font-bold">24</p>
          <p className="text-xs text-accent mt-1">On staff</p>
        </div>
      </div>
    </div>
  )
}
