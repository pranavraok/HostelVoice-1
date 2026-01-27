'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { notificationsApi, Notification, ApiError } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'

interface UseNotificationsOptions {
  autoRefresh?: boolean
  refreshInterval?: number // in milliseconds
}

interface UseNotificationsReturn {
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
  markAsRead: (ids: string[]) => Promise<void>
  markAllAsRead: () => Promise<void>
}

export function useNotifications(options: UseNotificationsOptions = {}): UseNotificationsReturn {
  const { autoRefresh = true, refreshInterval = 30000 } = options // Default: 30 seconds
  const { user, isAuthenticated } = useAuth()
  
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setNotifications([])
      setUnreadCount(0)
      setIsLoading(false)
      return
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()

    try {
      setError(null)
      
      // Fetch notifications and count in parallel
      const [notificationsRes, countRes] = await Promise.all([
        notificationsApi.getAll(1, 50),
        notificationsApi.getUnreadCount(),
      ])

      if (notificationsRes.data) {
        setNotifications(notificationsRes.data)
      }
      
      if (countRes.data) {
        setUnreadCount(countRes.data.count)
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return // Request was cancelled, ignore
      }
      
      const message = err instanceof ApiError ? err.message : 'Failed to fetch notifications'
      setError(message)
      console.error('Notifications fetch error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated, user])

  const refresh = useCallback(async () => {
    setIsLoading(true)
    await fetchNotifications()
  }, [fetchNotifications])

  const markAsRead = useCallback(async (ids: string[]) => {
    if (ids.length === 0) return

    try {
      await notificationsApi.markAsRead(ids)
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => 
          ids.includes(n.id) ? { ...n, is_read: true, read_at: new Date().toISOString() } : n
        )
      )
      setUnreadCount(prev => Math.max(0, prev - ids.length))
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to mark notifications as read'
      setError(message)
      console.error('Mark as read error:', err)
    }
  }, [])

  const markAllAsRead = useCallback(async () => {
    try {
      await notificationsApi.markAllAsRead()
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
      )
      setUnreadCount(0)
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to mark all as read'
      setError(message)
      console.error('Mark all as read error:', err)
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  // Auto-refresh
  useEffect(() => {
    if (autoRefresh && isAuthenticated) {
      intervalRef.current = setInterval(fetchNotifications, refreshInterval)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [autoRefresh, isAuthenticated, refreshInterval, fetchNotifications])

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    refresh,
    markAsRead,
    markAllAsRead,
  }
}

export default useNotifications
