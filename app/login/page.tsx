'use client'

import React from "react"
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth, type UserRole } from '@/lib/auth-context'
import { Lock, Mail, Home, Loader2, AlertCircle, Check } from 'lucide-react'

const DEMO_CREDENTIALS = [
  {
    role: 'student' as UserRole,
    email: 'student@hostelvoice.com',
    password: 'password123',
    title: 'Student',
    description: 'View dashboard & report issues'
  },
  {
    role: 'caretaker' as UserRole,
    email: 'caretaker@hostelvoice.com',
    password: 'password123',
    title: 'Caretaker',
    description: 'Manage operations'
  },
  {
    role: 'admin' as UserRole,
    email: 'admin@hostelvoice.com',
    password: 'password123',
    title: 'Administrator',
    description: 'Full analytics'
  }
]

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState<UserRole>('student')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await login(email, password, selectedRole)
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }



  return (
    <main className="min-h-screen bg-gray-50 md:bg-gradient-to-br md:from-white md:via-blue-50/30 md:to-white md:flex md:items-center md:justify-center px-0 md:px-4 py-0 md:py-8">
      {/* Animated background elements */}
      <div className="hidden md:block absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-cyan-400/10 to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-purple-400/10 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="w-full max-w-md relative z-10 md:pb-0">
        {/* Mobile Hero */}
        <div className="md:hidden bg-gradient-to-r from-cyan-500 to-purple-600 text-white px-6 pt-10 pb-16 rounded-b-3xl shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 bg-white/15 rounded-xl flex items-center justify-center shadow-inner">
              <span className="text-white font-bold text-lg">HV</span>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/80 font-semibold">HostelVoice</p>
              <p className="text-lg font-semibold leading-tight">Manage hostel life on the go</p>
            </div>
          </div>
          <p className="text-sm text-white/80 max-w-xs">Login quickly using the demo profiles to explore student, caretaker, or admin flows.</p>
        </div>

        {/* Logo & Header */}
        <div className="hidden md:block text-center mb-8 animate-fade-in">
          <Link href="/" className="inline-flex items-center gap-3 mb-6 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-white font-bold">HV</span>
            </div>
            <span className="font-bold text-gray-900 text-xl">HostelVoice</span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to your hostel account</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-t-3xl md:rounded-2xl border border-gray-100 md:border-gray-200/50 shadow-lg md:shadow-xl shadow-gray-200/40 md:shadow-gray-200/20 px-6 py-7 md:p-8 mb-0 md:mb-6 animate-scale-in -mt-8 md:mt-0">
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200/50 rounded-lg flex items-start gap-3 animate-shake">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 border-gray-200/50 focus:border-cyan-500 focus:ring-cyan-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 border-gray-200/50 focus:border-cyan-500 focus:ring-cyan-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">Select Your Role</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {DEMO_CREDENTIALS.map((cred) => (
                  <button
                    key={cred.role}
                    type="button"
                    onClick={() => setSelectedRole(cred.role)}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                      selectedRole === cred.role
                        ? 'border-cyan-500 bg-cyan-50'
                        : 'border-gray-200/50 bg-gray-50 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-sm font-semibold text-gray-900">{cred.title}</div>
                    <div className="text-xs text-gray-600 mt-1">{cred.role === 'student' ? 'Student' : cred.role === 'caretaker' ? 'Caretaker' : 'Admin'}</div>
                  </button>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full mt-6 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white border-0 font-semibold py-2 h-auto transition-all duration-200"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          {/* Demo Data Buttons */}
          <div className="mt-6 space-y-2">
            <p className="text-sm font-semibold text-gray-900">Quick demo logins</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {DEMO_CREDENTIALS.map((cred) => (
                <button
                  key={cred.role}
                  type="button"
                  onClick={() => {
                    setEmail(cred.email)
                    setPassword(cred.password)
                    setSelectedRole(cred.role)
                  }}
                  className="w-full px-4 py-3 text-left rounded-lg border border-gray-200/70 bg-gray-50 hover:border-cyan-300 hover:bg-white transition-all duration-200"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{cred.title}</div>
                      <div className="text-xs text-gray-600 mt-1 leading-relaxed">{cred.email}</div>
                    </div>
                    <Check className={`w-4 h-4 ${selectedRole === cred.role ? 'text-cyan-600 opacity-100' : 'text-gray-300 opacity-50'}`} />
                  </div>
                  <div className="text-[11px] text-gray-500 mt-2">{cred.description}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-600">
          <p>
            Back to <Link href="/" className="text-cyan-600 hover:text-cyan-700 font-semibold transition-colors">home</Link>
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }

        .animate-fade-in {
          animation: fadeIn 0.6s ease-out;
        }

        .animate-scale-in {
          animation: scaleIn 0.4s ease-out;
        }

        .animate-shake {
          animation: shake 0.4s ease-out;
        }
      `}</style>
    </main>
  )
}
