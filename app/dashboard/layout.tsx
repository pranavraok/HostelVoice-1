'use client'

import React from "react"

import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { LogOut, Menu, X } from 'lucide-react'
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
      <div className="dark bg-background text-foreground min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-border border-t-accent animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const getRoleMenuItems = () => {
    const baseItems = [
      { href: '/dashboard', label: 'Dashboard', icon: 'grid' }
    ]

    switch (user.role) {
      case 'student':
        return [
          ...baseItems,
          { href: '/dashboard/issues', label: 'Report Issue', icon: 'alert' },
          { href: '/dashboard/announcements', label: 'Announcements', icon: 'bell' },
          { href: '/dashboard/lost-found', label: 'Lost & Found', icon: 'search' }
        ]
      case 'caretaker':
        return [
          ...baseItems,
          { href: '/dashboard/issues', label: 'Manage Issues', icon: 'alert' },
          { href: '/dashboard/announcements', label: 'Announcements', icon: 'bell' },
          { href: '/dashboard/residents', label: 'Residents', icon: 'users' }
        ]
      case 'admin':
        return [
          ...baseItems,
          { href: '/dashboard/analytics', label: 'Analytics', icon: 'chart' },
          { href: '/dashboard/announcements-manage', label: 'Announcements', icon: 'bell' },
          { href: '/dashboard/management', label: 'Management', icon: 'settings' },
          { href: '/dashboard/users', label: 'Users', icon: 'users' }
        ]
      default:
        return baseItems
    }
  }

  const getIconComponent = (iconName: string) => {
    const icons: { [key: string]: React.ReactNode } = {
      grid: <div className="w-5 h-5 rounded-sm bg-gradient-to-br from-cyan-400 to-cyan-600" />,
      alert: <div className="w-5 h-5 rounded-sm bg-gradient-to-br from-orange-400 to-orange-600" />,
      bell: <div className="w-5 h-5 rounded-sm bg-gradient-to-br from-blue-400 to-blue-600" />,
      search: <div className="w-5 h-5 rounded-sm bg-gradient-to-br from-purple-400 to-purple-600" />,
      users: <div className="w-5 h-5 rounded-sm bg-gradient-to-br from-green-400 to-green-600" />,
      chart: <div className="w-5 h-5 rounded-sm bg-gradient-to-br from-pink-400 to-pink-600" />,
      settings: <div className="w-5 h-5 rounded-sm bg-gradient-to-br from-indigo-400 to-indigo-600" />
    }
    return icons[iconName] || icons.grid
  }

  const menuItems = getRoleMenuItems()

  return (
    <div className="dark bg-background text-foreground min-h-screen">
      {/* Mobile Header */}
      <header className="md:hidden border-b border-border px-4 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="text-xl font-bold">
          HostelVoice
        </Link>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 hover:bg-muted rounded-lg"
        >
          {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`${
            isSidebarOpen ? 'block' : 'hidden'
          } md:block w-full md:w-72 border-r border-gray-200 bg-white fixed md:relative h-screen md:h-auto z-40 overflow-y-auto shadow-sm`}
        >
          <div className="p-6 space-y-8 h-full flex flex-col">
            {/* Logo */}
            <Link href="/dashboard" className="hidden md:flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">HV</span>
              </div>
              <span className="font-bold text-gray-900 text-lg">HostelVoice</span>
            </Link>

            {/* User Info Card */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-4 space-y-3">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Your Account</p>
                <p className="font-semibold text-gray-900">{user.name}</p>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-xs text-gray-600">{user.hostelName}</span>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <div className="text-xs font-semibold px-3 py-1 rounded-full bg-cyan-100 text-cyan-700">
                  {user.role.toUpperCase()}
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="space-y-1 flex-1">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors duration-200 group text-gray-700 hover:text-gray-900 font-medium text-sm"
                  onClick={() => setIsSidebarOpen(false)}
                >
                  {getIconComponent(item.icon)}
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>

            {/* Logout */}
            <div className="pt-6 border-t border-gray-200">
              <Button
                onClick={() => {
                  logout()
                  router.push('/')
                }}
                className="w-full justify-center gap-2 bg-gray-100 text-gray-700 hover:bg-gray-200 border-0 font-medium transition-colors duration-200"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 md:ml-0 w-full">
          {children}
        </main>
      </div>
    </div>
  )
}
