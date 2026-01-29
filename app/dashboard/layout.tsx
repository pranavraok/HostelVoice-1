'use client'

import React from "react"

import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { LogOut, Menu, X, LayoutDashboard, AlertCircle, Bell, Search, Users, BarChart3, Settings, Home, UtensilsCrossed, Calendar, ClipboardCheck, PlusCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  const { user, isLoading, logout } = useAuth()
  const router = useRouter()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // ARCHITECTURAL PRINCIPLE: Dashboard requires THREE conditions:
  // 1. Auth loading complete (!isLoading)
  // 2. Supabase session exists (checked in auth context)
  // 3. User profile loaded with role (user !== null AND user.role exists)
  //
  // Session existence alone is NOT sufficient - user must have completed
  // the full login flow including role selection and profile creation.

  // SAFETY NET: Prevent infinite loading with timeout
  // If auth is still loading after 10 seconds, something is wrong - redirect to login
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        console.error('[DashboardLayout] Auth loading timeout - redirecting to login')
        router.push('/login')
      }
    }, 10000) // 10 second safety timeout

    return () => clearTimeout(timeoutId)
  }, [isLoading, router])

  // GUARD: Redirect to login if user is not fully initialized
  // This enforces that credentials + role selection flow was completed
  useEffect(() => {
    if (!isLoading && !user) {
      console.log('[DashboardLayout] No user found after loading - redirecting to login')
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
          { href: '/dashboard/announcements', label: 'Announcements', icon: Bell, color: '#014b89' },
          { href: '/dashboard/lost-found', label: 'Lost & Found', icon: Search, color: '#014b89' },
          { href: '/dashboard/mess', label: 'Mess', icon: UtensilsCrossed, color: '#014b89' },
          { href: '/dashboard/student-leave', label: 'Leave', icon: Calendar, color: '#014b89' }
        ]
      case 'caretaker':
        return [
          ...baseItems,
          { href: '/dashboard/issues', label: 'Manage Issues', icon: AlertCircle, color: '#014b89' },
          { href: '/dashboard/announcements', label: 'Announcements', icon: Bell, color: '#014b89' },
          { href: '/dashboard/residents', label: 'Residents', icon: Users, color: '#014b89' },
          { href: '/dashboard/mess-management', label: 'Mess Management', icon: UtensilsCrossed, color: '#014b89' },
          { href: '/dashboard/caretaker-leave', label: 'Leave', icon: Calendar, color: '#014b89' }
        ]
      case 'admin':
        return [
          ...baseItems,
          { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3, color: '#014b89' },
          { href: '/dashboard/announcements-manage', label: 'Announcements', icon: Bell, color: '#014b89' },
          { href: '/dashboard/management', label: 'Management', icon: Settings, color: '#014b89' },
          { href: '/dashboard/user-approvals', label: 'User Approvals', icon: Users, color: '#014b89' },
          { href: '/dashboard/mess-management', label: 'Mess Management', icon: UtensilsCrossed, color: '#014b89' },
          { href: '/dashboard/admin-leave-management', label: 'Leave Management', icon: Calendar, color: '#014b89' }
        ]
      default:
        return baseItems
    }
  }

  const menuItems = getRoleMenuItems()

  const roleColor = '#014b89'

  return (
    <div className="bg-white h-screen overflow-hidden flex flex-col">
      {/* Mobile Header */}
      <header className="md:hidden border-b border-gray-200 bg-white/95 backdrop-blur-xl px-4 py-3 flex items-center justify-between shadow-sm flex-shrink-0 z-50">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Image 
            src="/logo/logo.png" 
            alt="HostelVoice Logo" 
            width={2000} 
            height={70} 
            className="h-14 w-auto"
            priority
          />
        </Link>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          {isSidebarOpen ? <X className="w-6 h-6 text-gray-700" /> : <Menu className="w-6 h-6 text-gray-700" />}
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } md:translate-x-0 transition-transform duration-300 ease-in-out w-72 sm:w-80 border-r-2 border-gray-200 bg-white fixed md:static h-[calc(100vh-64px)] md:h-full top-[64px] md:top-0 z-40 overflow-hidden flex-shrink-0`}
        >
          <div className="h-full flex flex-col">
            {/* TOP SECTION - Fixed: Logo and User Profile */}
            <div className="flex-shrink-0 p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Logo */}
              <Link href="/dashboard" className="hidden md:flex items-center gap-3 hover:opacity-80 transition-opacity mb-2">
                <Image 
                  src="/logo/logo.png" 
                  alt="HostelVoice Logo" 
                  width={2000} 
                  height={70} 
                  className="h-20 sm:h-12 w-auto"
                  priority
                />
              </Link>

              {/* User Info Card */}
              <div className="rounded-xl sm:rounded-2xl p-4 sm:p-5 border-2 shadow-lg" style={{ borderColor: `${roleColor}20`, background: `${roleColor}05` }}>
                <div className="mb-2 sm:mb-3">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Your Account</p>
                  <p className="font-bold text-base sm:text-lg text-gray-900 truncate">{user.name}</p>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1 truncate">{user.email || 'user@hostelvoice.com'}</p>
                </div>
                <div className="flex items-center gap-2 pt-2 sm:pt-3 border-t border-gray-200">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#10b981' }}></div>
                  <span className="text-xs text-gray-600 font-medium truncate">{user.hostelName}</span>
                </div>
                {user.roomNumber && (
                  <div className="flex items-center gap-2 mt-2">
                    <Home className="w-3 h-3 text-gray-500 flex-shrink-0" />
                    <span className="text-xs text-gray-600 font-medium">Room {user.roomNumber}</span>
                  </div>
                )}
                <div className="mt-2 sm:mt-3">
                  <div className="inline-flex text-xs font-bold px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-white" style={{ background: roleColor }}>
                    {user.role.toUpperCase()}
                  </div>
                </div>
              </div>
            </div>

            {/* MIDDLE SECTION - Scrollable: Navigation */}
            <nav className="flex-1 overflow-y-auto px-4 sm:px-6 space-y-2 scrollbar-thin">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-2">Navigation</p>
              {menuItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl hover:shadow-md transition-all duration-200 group text-gray-700 hover:text-gray-900 font-semibold text-sm border-2 border-transparent"
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
                      className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0"
                      style={{ background: `${item.color}15` }}
                    >
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: item.color }} />
                    </div>
                    <span className="truncate">{item.label}</span>
                  </Link>
                )
              })}
            </nav>

            {/* BOTTOM SECTION - Fixed: Logout */}
            <div className="flex-shrink-0 px-4 sm:px-6 py-3 border-t-2 border-gray-200">
              <Button
                onClick={() => {
                  logout()
                  router.push('/')
                }}
                className="w-full justify-center gap-2 bg-gray-100 text-gray-700 hover:bg-gray-200 border-0 font-semibold transition-all duration-200 h-9 rounded-lg text-sm"
              >
                <LogOut className="w-4 h-4" />
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
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  )
}
