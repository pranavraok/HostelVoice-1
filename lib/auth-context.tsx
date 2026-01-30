'use client'

import React, { createContext, useContext, useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User as SupabaseUser } from '@supabase/supabase-js'

export type UserRole = 'student' | 'caretaker' | 'admin'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  hostelName: string
  roomNumber?: string
  studentId?: string
  caretakerId?: string
  adminId?: string
  phoneNumber?: string
  department?: string
  position?: string
  approvalStatus?: 'pending' | 'approved' | 'rejected'
  rejectionReason?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string, role: UserRole) => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  logout: () => Promise<void>
  isAuthenticated: boolean
}

export interface RegisterData {
  email: string
  password: string
  fullName: string
  role: UserRole
  phoneNumber: string
  hostel?: string
  roomNumber?: string
  studentId?: string
  caretakerId?: string
  adminId?: string
  department?: string
  university?: string
  position?: string
  experience?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Helper to build User object from profile data
function buildUserFromProfile(profile: any): User {
  return {
    id: profile.id,
    email: profile.email,
    name: profile.full_name || 'User',
    role: profile.role,
    hostelName: profile.hostel_name || 'N/A',
    roomNumber: profile.room_number,
    studentId: profile.student_id,
    caretakerId: profile.caretaker_id,
    adminId: profile.admin_id,
    phoneNumber: profile.phone_number,
    department: profile.department,
    position: profile.position,
    approvalStatus: profile.approval_status,
    rejectionReason: profile.rejection_reason,
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  
  // WHY THIS REF EXISTS:
  // Supabase fires SIGNED_IN on page reload (echoing the restored session).
  // Without this flag, onAuthStateChange would race with initAuth(), causing:
  // - Duplicate profile loads
  // - Non-deterministic timing
  // - isLoading stuck true (the Heisenbug)
  //
  // This ref tells onAuthStateChange: "ignore events until init is done"
  // It does NOT gate or skip initialization - it gates the event listener.
  const initCompleteRef = useRef(false)

  useEffect(() => {
    let mounted = true

    // ═══════════════════════════════════════════════════════════════════
    // SINGLE DETERMINISTIC AUTH FLOW
    // ═══════════════════════════════════════════════════════════════════
    // This is the ONLY path that runs on mount/reload.
    // It handles everything inline - no external functions that could race.
    // The finally block ALWAYS runs, guaranteeing isLoading resolves.
    // ═══════════════════════════════════════════════════════════════════
    const initAuth = async () => {
      console.log('[AuthProvider] Initializing auth...')
      
      try {
        // Step 1: Get current session (may exist from reload)
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('[AuthProvider] Session error:', sessionError.message)
          // Continue to finally - will clear loading with no user
          return
        }
        
        if (!session?.user) {
          console.log('[AuthProvider] No session found')
          // Continue to finally - will clear loading with no user
          return
        }
        
        // Step 2: Session exists - load profile from database
        console.log('[AuthProvider] Session found, loading profile for:', session.user.id)
        
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()
        
        if (profileError || !profile) {
          console.error('[AuthProvider] Profile load failed:', profileError?.message || 'No profile')
          // Session exists but profile doesn't - sign out for clean state
          await supabase.auth.signOut()
          // Continue to finally - will clear loading with no user
          return
        }
        
        // Step 3: Profile loaded - set user state
        if (mounted) {
          console.log('[AuthProvider] Profile loaded successfully')
          setUser(buildUserFromProfile(profile))
        }
        
      } catch (error) {
        console.error('[AuthProvider] Unexpected error during init:', error)
        // Continue to finally - will clear loading
      } finally {
        // ═══════════════════════════════════════════════════════════════
        // CRITICAL: This block ALWAYS executes, no matter what.
        // This is the ONLY place isLoading becomes false during init.
        // No early returns, no guards, no races can prevent this.
        // ═══════════════════════════════════════════════════════════════
        if (mounted) {
          console.log('[AuthProvider] Auth initialization complete')
          initCompleteRef.current = true
          setIsLoading(false)
        }
      }
    }

    // Start initialization
    initAuth()

    // ═══════════════════════════════════════════════════════════════════
    // EVENT LISTENER - Post-initialization only
    // ═══════════════════════════════════════════════════════════════════
    // This listener handles REAL auth events (new login, logout).
    // It does NOT participate in initialization.
    // Events during init are ignored (they're just echoes of restored session).
    // ═══════════════════════════════════════════════════════════════════
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[AuthProvider] Auth event:', event, '| Init complete:', initCompleteRef.current)
      
      // CRITICAL: Ignore ALL events until initialization is complete.
      // On reload, Supabase fires SIGNED_IN as an echo of the restored session.
      // If we process it, we race with initAuth() and cause the Heisenbug.
      if (!initCompleteRef.current) {
        console.log('[AuthProvider] Ignoring event during initialization')
        return
      }
      
      // Handle real post-init events
      if (event === 'SIGNED_IN' && session?.user) {
        // This is a NEW login (user just signed in via login page)
        console.log('[AuthProvider] New sign-in detected')
        
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single()
        
        if (profile && mounted) {
          setUser(buildUserFromProfile(profile))
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('[AuthProvider] User signed out')
        if (mounted) {
          setUser(null)
        }
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const login = async (email: string, password: string, role: UserRole) => {
    try {
      console.log('[AuthContext] Login attempt:', { email, role })
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error
      
      console.log('[AuthContext] Credentials valid, user ID:', data.user.id)

      // Verify role and approval status
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('role, approval_status, rejection_reason')
        .eq('id', data.user.id)
        .single()

      console.log('[AuthContext] Profile validation:', { profile, profileError })

      if (profileError) {
        console.error('[AuthContext] Profile load failed:', profileError)
        await supabase.auth.signOut()
        throw new Error('Unable to load user profile. Please ensure the database tables are set up correctly.')
      }

      if (!profile) {
        await supabase.auth.signOut()
        throw new Error('User profile not found. Please contact support.')
      }

      console.log('[AuthContext] Profile loaded, validating role match')

      if (profile.role !== role) {
        await supabase.auth.signOut()
        throw new Error(`This account is not registered as a ${role}. Please select the correct role.`)
      }

      // Check approval status (admins are auto-approved)
      if (profile.role !== 'admin' && profile.approval_status === 'pending') {
        await supabase.auth.signOut()
        throw new Error('Your account is pending admin approval. Please wait for approval before logging in.')
      }

      if (profile.approval_status === 'rejected') {
        await supabase.auth.signOut()
        const reason = profile.rejection_reason ? `\n\nReason: ${profile.rejection_reason}` : ''
        throw new Error(`Your account registration was declined.${reason}\n\nPlease contact administration for more details.`)
      }

      // Fetch full profile and set user state
      const { data: fullProfile } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single()

      if (fullProfile) {
        setUser(buildUserFromProfile(fullProfile))
      }

      console.log('[AuthContext] Login complete, user state set')
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const register = async (userData: RegisterData) => {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
      })

      if (authError) throw authError
      if (!authData.user) throw new Error('Registration failed')

      // Create user profile with approval status
      // Admins are auto-approved, students and caretakers need approval
      const approvalStatus = userData.role === 'admin' ? 'approved' : 'pending'
      
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: userData.email,
          full_name: userData.fullName,
          role: userData.role,
          phone_number: userData.phoneNumber,
          hostel_name: userData.hostel,
          room_number: userData.roomNumber,
          student_id: userData.studentId,
          caretaker_id: userData.caretakerId,
          admin_id: userData.adminId,
          department: userData.department,
          university: userData.university,
          position: userData.position,
          experience: userData.experience,
          approval_status: approvalStatus,
        })

      if (profileError) {
        console.error('Profile insert error details:', {
          error: profileError,
          message: profileError.message,
          code: profileError.code,
          details: profileError.details,
          hint: profileError.hint
        })
        // Clean up auth user if profile creation fails
        await supabase.auth.signOut()
        throw new Error(`Failed to create user profile: ${profileError.message || 'Unknown error'}`)
      }

      // Only load profile for admins (auto-approved)
      // Students and caretakers will be in pending state
      if (userData.role === 'admin') {
        // Small delay to ensure database trigger has executed
        await new Promise(resolve => setTimeout(resolve, 500))
        
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', authData.user.id)
          .single()
        
        if (profile) {
          setUser(buildUserFromProfile(profile))
        }
      } else {
        // Sign out - students/caretakers need admin approval first
        await supabase.auth.signOut()
      }
    } catch (error) {
      console.error('Registration error:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      setUser(null)
    } catch (error) {
      console.error('Error logging out:', error)
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
