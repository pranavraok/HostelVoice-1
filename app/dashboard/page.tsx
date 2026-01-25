'use client'

import { useAuth } from '@/lib/auth-context'
import { AlertCircle, TrendingUp, Users, MessageSquare, Zap, BarChart3, ClipboardList, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const { user } = useAuth()

  if (!user) return null

  const getDashboardContent = () => {
    switch (user.role) {
      case 'student':
        return <StudentDashboard user={user} />
      case 'caretaker':
        return <CaretakerDashboard user={user} />
      case 'admin':
        return <AdminDashboard user={user} />
      default:
        return <div>Unknown role</div>
    }
  }

  return getDashboardContent()
}

function StudentDashboard({ user }: { user: any }) {
  const stats = [
    { label: 'Open Issues', value: '2', icon: AlertCircle, color: 'from-cyan-500/20 to-cyan-400/10', accent: 'text-cyan-600' },
    { label: 'Announcements', value: '12', icon: MessageSquare, color: 'from-purple-500/20 to-purple-400/10', accent: 'text-purple-600' },
    { label: 'Hostel Items', value: '5', icon: Users, color: 'from-blue-500/20 to-blue-400/10', accent: 'text-blue-600' }
  ]

  const quickActions = [
    { title: 'Report Issue', description: 'Tell us about any problems', icon: AlertCircle, href: '/dashboard/issues' },
    { title: 'View Announcements', description: 'Check latest hostel updates', icon: MessageSquare, href: '/dashboard/announcements' },
    { title: 'Lost & Found', description: 'Browse lost items', icon: Zap, href: '/dashboard/lost-found' }
  ]

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome, {user.name}</h1>
        <p className="text-gray-600">Room {user.roomNumber} • {user.hostelName}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, i) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className="bg-gradient-to-br from-white to-gray-50 border border-gray-200/50 rounded-2xl p-6 hover:border-gray-300 hover:shadow-lg transition-all duration-300 group"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.color}`}>
                  <Icon className={`w-6 h-6 ${stat.accent}`} />
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-2">{stat.label}</p>
              <p className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">{stat.value}</p>
            </div>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-200/50 rounded-2xl p-6 md:p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action, i) => {
            const Icon = action.icon
            return (
              <Link key={action.href} href={action.href}>
                <div className="p-6 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100/50 border border-gray-200/50 hover:border-cyan-300 hover:shadow-lg transition-all duration-300 group cursor-pointer h-full"
                  style={{ animationDelay: `${i * 0.1}s` }}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-lg flex items-center justify-center group-hover:shadow-lg group-hover:shadow-cyan-500/30 transition-all duration-300">
                      <Icon className="w-5 h-5 text-cyan-600" />
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-cyan-500 transition-colors" />
                  </div>
                  <p className="font-semibold text-gray-900 group-hover:text-cyan-600 transition-colors">{action.title}</p>
                  <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
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
    </div>
  )
}

function CaretakerDashboard({ user }: { user: any }) {
  const stats = [
    { label: 'Active Issues', value: '8', icon: AlertCircle, color: 'from-cyan-500/20 to-cyan-400/10', accent: 'text-cyan-600' },
    { label: 'Residents', value: '45', icon: Users, color: 'from-purple-500/20 to-purple-400/10', accent: 'text-purple-600' },
    { label: 'Resolved Today', value: '3', icon: TrendingUp, color: 'from-green-500/20 to-green-400/10', accent: 'text-green-600' }
  ]

  const managementLinks = [
    { title: 'Manage Issues', description: 'View and resolve issues', icon: ClipboardList, href: '/dashboard/issues/caretaker', delay: 0 },
    { title: 'Residents', description: 'Manage resident information', icon: Users, href: '/dashboard/residents', delay: 0.1 },
    { title: 'Announcements', description: 'Post hostel updates', icon: MessageSquare, href: '/dashboard/announcements', delay: 0.2 }
  ]

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Hostel Management</h1>
        <p className="text-gray-600">{user.hostelName} • Caretaker Dashboard</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, i) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className="bg-gradient-to-br from-white to-gray-50 border border-gray-200/50 rounded-2xl p-6 hover:border-gray-300 hover:shadow-lg transition-all duration-300"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.color}`}>
                  <Icon className={`w-6 h-6 ${stat.accent}`} />
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-2">{stat.label}</p>
              <p className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">{stat.value}</p>
            </div>
          )
        })}
      </div>

      {/* Management Tools */}
      <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-200/50 rounded-2xl p-6 md:p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Management Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {managementLinks.map((link) => {
            const Icon = link.icon
            return (
              <Link key={link.href} href={link.href}>
                <div className="p-6 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100/50 border border-gray-200/50 hover:border-cyan-300 hover:shadow-lg transition-all duration-300 group cursor-pointer h-full"
                  style={{ animationDelay: `${link.delay}s` }}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-lg flex items-center justify-center group-hover:shadow-lg group-hover:shadow-cyan-500/30 transition-all duration-300">
                      <Icon className="w-5 h-5 text-cyan-600" />
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-cyan-500 transition-colors" />
                  </div>
                  <p className="font-semibold text-gray-900 group-hover:text-cyan-600 transition-colors">{link.title}</p>
                  <p className="text-sm text-gray-600 mt-1">{link.description}</p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
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
    </div>
  )
}

function AdminDashboard({ user }: { user: any }) {
  const stats = [
    { label: 'Total Issues', value: '124', icon: AlertCircle, color: 'from-cyan-500/20 to-cyan-400/10', accent: 'text-cyan-600' },
    { label: 'Total Users', value: '2,450', icon: Users, color: 'from-purple-500/20 to-purple-400/10', accent: 'text-purple-600' },
    { label: 'Resolution Rate', value: '94%', icon: TrendingUp, color: 'from-green-500/20 to-green-400/10', accent: 'text-green-600' }
  ]

  const adminTools = [
    { title: 'Analytics', description: 'System-wide metrics', icon: BarChart3, href: '/dashboard/analytics', delay: 0 },
    { title: 'Management', description: 'User & system control', icon: ClipboardList, href: '/dashboard/management', delay: 0.1 },
    { title: 'Announcements', description: 'Broadcast messages', icon: MessageSquare, href: '/dashboard/announcements', delay: 0.2 }
  ]

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">System Administration</h1>
        <p className="text-gray-600">Administrator Dashboard • Full System Access</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, i) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className="bg-gradient-to-br from-white to-gray-50 border border-gray-200/50 rounded-2xl p-6 hover:border-gray-300 hover:shadow-lg transition-all duration-300"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.color}`}>
                  <Icon className={`w-6 h-6 ${stat.accent}`} />
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-2">{stat.label}</p>
              <p className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">{stat.value}</p>
            </div>
          )
        })}
      </div>

      {/* Admin Controls */}
      <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-200/50 rounded-2xl p-6 md:p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Admin Controls</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {adminTools.map((tool) => {
            const Icon = tool.icon
            return (
              <Link key={tool.href} href={tool.href}>
                <div className="p-6 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100/50 border border-gray-200/50 hover:border-cyan-300 hover:shadow-lg transition-all duration-300 group cursor-pointer h-full"
                  style={{ animationDelay: `${tool.delay}s` }}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-lg flex items-center justify-center group-hover:shadow-lg group-hover:shadow-cyan-500/30 transition-all duration-300">
                      <Icon className="w-5 h-5 text-cyan-600" />
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-cyan-500 transition-colors" />
                  </div>
                  <p className="font-semibold text-gray-900 group-hover:text-cyan-600 transition-colors">{tool.title}</p>
                  <p className="text-sm text-gray-600 mt-1">{tool.description}</p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
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
    </div>
  )
}
