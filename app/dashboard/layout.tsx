'use client'

import React from "react"

import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { LogOut, Menu, X, LayoutDashboard, AlertCircle, Bell, Search, Users, BarChart3, Settings, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  const { user, isLoading, logout } = useAuth()
  const router = useRouter()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full border-4 border-gray-200 mx-auto mb-4 relative">
            <div className="absolute inset-0 rounded-full border-4 border-t-transparent animate-spin" style={{ borderTopColor: '#014b89' }}></div>
          </div>
          <p className="text-gray-600 font-semibold">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const getRoleMenuItems = () => {
    const baseItems = [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, color: '#014b89' }
    ]

    switch (user.role) {
      case 'student':
        return [
          ...baseItems,
          { href: '/dashboard/issues', label: 'Report Issue', icon: AlertCircle, color: '#014b89' },
          { href: '/dashboard/announcements', label: 'Announcements', icon: Bell, color: '#f26918' },
          { href: '/dashboard/lost-found', label: 'Lost & Found', icon: Search, color: '#014b89' }
        ]
      case 'caretaker':
        return [
          ...baseItems,
          { href: '/dashboard/issues', label: 'Manage Issues', icon: AlertCircle, color: '#f26918' },
          { href: '/dashboard/announcements', label: 'Announcements', icon: Bell, color: '#014b89' },
          { href: '/dashboard/residents', label: 'Residents', icon: Users, color: '#f26918' }
        ]
      case 'admin':
        return [
          ...baseItems,
          { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3, color: '#014b89' },
          { href: '/dashboard/announcements-manage', label: 'Announcements', icon: Bell, color: '#f26918' },
          { href: '/dashboard/management', label: 'Management', icon: Settings, color: '#014b89' },
          { href: '/dashboard/users', label: 'Users', icon: Users, color: '#f26918' }
        ]
      default:
        return baseItems
    }
  }

  const menuItems = getRoleMenuItems()

  const getRoleColor = () => {
    switch (user.role) {
      case 'student':
        return '#014b89'
      case 'caretaker':
        return '#f26918'
      case 'admin':
        return '#014b89'
      default:
        return '#014b89'
    }
  }

  const roleColor = getRoleColor()

  return (
    <div className="bg-white min-h-screen">
      {/* Mobile Header */}
      <header className="md:hidden border-b border-gray-200 bg-white/95 backdrop-blur-xl px-4 py-4 flex items-center justify-between shadow-sm fixed top-0 inset-x-0 z-50">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: roleColor }}>
            <span className="text-white font-bold text-sm">HV</span>
          </div>
          <span className="font-bold text-gray-900 text-lg">HostelVoice</span>
        </Link>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          {isSidebarOpen ? <X className="w-6 h-6 text-gray-700" /> : <Menu className="w-6 h-6 text-gray-700" />}
        </button>
      </header>

      <div className="flex pt-16 md:pt-0">
        {/* Sidebar */}
        <aside
          className={`${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } md:translate-x-0 transition-transform duration-300 ease-in-out w-80 border-r-2 border-gray-200 bg-white fixed md:relative h-screen z-40 overflow-y-auto`}
        >
          <div className="p-6 space-y-6 h-full flex flex-col">
            {/* Logo */}
            <Link href="/dashboard" className="hidden md:flex items-center gap-3 hover:opacity-80 transition-opacity mb-2">
              <Image 
                src="/logo/logo.png" 
                alt="HostelVoice Logo" 
                width={2000} 
                height={70} 
                className="h-12 w-auto"
                priority
              />
            </Link>

            {/* User Info Card */}
            <div className="rounded-2xl p-5 border-2 shadow-lg" style={{ borderColor: `${roleColor}20`, background: `${roleColor}05` }}>
              <div className="mb-3">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Your Account</p>
                <p className="font-bold text-lg text-gray-900">{user.name}</p>
                <p className="text-sm text-gray-600 mt-1">{user.email || 'user@hostelvoice.com'}</p>
              </div>
              <div className="flex items-center gap-2 pt-3 border-t border-gray-200">
                <div className="w-2 h-2 rounded-full" style={{ background: '#10b981' }}></div>
                <span className="text-xs text-gray-600 font-medium">{user.hostelName}</span>
              </div>
              {user.roomNumber && (
                <div className="flex items-center gap-2 mt-2">
                  <Home className="w-3 h-3 text-gray-500" />
                  <span className="text-xs text-gray-600 font-medium">Room {user.roomNumber}</span>
                </div>
              )}
              <div className="mt-3">
                <div className="inline-flex text-xs font-bold px-3 py-1.5 rounded-full text-white" style={{ background: roleColor }}>
                  {user.role.toUpperCase()}
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="space-y-2 flex-1">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-2">Navigation</p>
              {menuItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl hover:shadow-md transition-all duration-200 group text-gray-700 hover:text-gray-900 font-semibold text-sm border-2 border-transparent"
                    onClick={() => setIsSidebarOpen(false)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = item.color
                      e.currentTarget.style.background = `${item.color}08`
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'transparent'
                      e.currentTarget.style.background = 'transparent'
                    }}
                  >
                    <div 
                      className="w-9 h-9 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform"
                      style={{ background: `${item.color}15` }}
                    >
                      <Icon className="w-5 h-5" style={{ color: item.color }} />
                    </div>
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </nav>

            {/* Logout */}
            <div className="pt-4 border-t-2 border-gray-200">
              <Button
                onClick={() => {
                  logout()
                  router.push('/')
                }}
                className="w-full justify-center gap-2 bg-gray-100 text-gray-700 hover:bg-gray-200 border-0 font-semibold transition-all duration-200 h-12 rounded-xl"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </Button>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {isSidebarOpen && (
          <div 
            className="md:hidden fixed inset-0 bg-black/50 z-30"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 w-full min-h-screen">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur-xl border-t-2 border-gray-200 shadow-2xl">
        <div className="grid grid-cols-4 gap-1 px-2 py-3">
          {menuItems.slice(0, 4).map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center text-xs font-semibold text-gray-600 hover:text-gray-900 gap-1.5 py-2 rounded-xl transition-all"
                onClick={() => setIsSidebarOpen(false)}
              >
                <div 
                  className="w-11 h-11 rounded-xl flex items-center justify-center shadow-sm"
                  style={{ background: `${item.color}15` }}
                >
                  <Icon className="w-5 h-5" style={{ color: item.color }} />
                </div>
                <span className="truncate max-w-full text-center leading-tight">{item.label.split(' ')[0]}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
