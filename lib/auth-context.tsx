'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

export type UserRole = 'student' | 'caretaker' | 'admin'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  hostelName: string
  roomNumber?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string, role: UserRole) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Initialize auth from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('hostelvoice-user')
    if (stored) {
      try {
        setUser(JSON.parse(stored))
      } catch {
        localStorage.removeItem('hostelvoice-user')
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string, role: UserRole) => {
    // Simulate API call with demo users
    const demoUsers: Record<string, { password: string; user: Omit<User, 'id'> }> = {
      'student@hostelvoice.com': {
        password: 'password123',
        user: {
          email: 'student@hostelvoice.com',
          name: 'Arjun Singh',
          role: 'student',
          hostelName: 'North Wing Hostel',
          roomNumber: 'A-203'
        }
      },
      'caretaker@hostelvoice.com': {
        password: 'password123',
        user: {
          email: 'caretaker@hostelvoice.com',
          name: 'Rajesh Kumar',
          role: 'caretaker',
          hostelName: 'North Wing Hostel'
        }
      },
      'admin@hostelvoice.com': {
        password: 'password123',
        user: {
          email: 'admin@hostelvoice.com',
          name: 'Admin User',
          role: 'admin',
          hostelName: 'Central Administration'
        }
      }
    }

    const credentials = demoUsers[email]
    if (!credentials || credentials.password !== password) {
      throw new Error('Invalid email or password')
    }

    const newUser: User = {
      id: Math.random().toString(36).slice(2),
      ...credentials.user
    }

    setUser(newUser)
    localStorage.setItem('hostelvoice-user', JSON.stringify(newUser))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('hostelvoice-user')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
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
