'use client'

import React from "react"
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth, type UserRole } from '@/lib/auth-context'
import { Lock, Mail, Loader2, AlertCircle, Check, Users, UserCheck, Shield, ArrowRight } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

const DEMO_CREDENTIALS = [
  {
    role: 'student' as UserRole,
    email: 'student@hostelvoice.com',
    password: 'password123',
    title: 'Student',
    description: 'View dashboard & report issues',
    icon: Users,
    color: '#014b89'
  },
  {
    role: 'caretaker' as UserRole,
    email: 'caretaker@hostelvoice.com',
    password: 'password123',
    title: 'Caretaker',
    description: 'Manage operations',
    icon: UserCheck,
    color: '#014b89'
  },
  {
    role: 'admin' as UserRole,
    email: 'admin@hostelvoice.com',
    password: 'password123',
    title: 'Administrator',
    description: 'Full analytics',
    icon: Shield,
    color: '#014b89'
  }
]

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState<UserRole>('student')

  // ARCHITECTURAL PRINCIPLE: 
  // Login page ALWAYS shows the login form and requires explicit role selection.
  // We do NOT auto-redirect based on session existence because:
  // 1. Session existence ≠ completed login flow
  // 2. Role selection is MANDATORY for every login
  // 3. User must explicitly confirm credentials + role match
  // The dashboard guard handles unauthorized access prevention.

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    toast({
      title: "Signing in...",
      description: "Please wait while we verify your credentials.",
    })

    try {
      await login(email, password, selectedRole)
      
      toast({
        title: "Login Successful! 🎉",
        description: "Redirecting to your dashboard...",
      })
      
      router.push('/dashboard')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed'
      setError(errorMessage)
      
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-white relative overflow-hidden">
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

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
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

        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
      `}</style>

      {/* Background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(1, 75, 137, 0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(1, 75, 137, 0.08) 1px, transparent 1px),
            radial-gradient(circle 800px at 50% 0%, rgba(1, 75, 137, 0.05), transparent)
          `,
          backgroundSize: "80px 80px, 80px 80px, 100% 100%",
        }}
      />

      {/* Floating Orbs */}
      <div className="absolute top-20 right-10 w-64 h-64 rounded-full opacity-10 blur-3xl animate-float" style={{ background: '#014b89' }}></div>
      <div className="absolute bottom-20 left-10 w-80 h-80 rounded-full opacity-10 blur-3xl animate-float" style={{ background: '#f26918', animationDelay: '2s' }}></div>

      {/* Navigation - Mobile Optimized */}
      <nav className="relative z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <Image 
              src="/logo/logo.png" 
              alt="HostelVoice Logo" 
              width={2000} 
              height={70} 
              className="h-12 sm:h-14 w-auto"
              priority
            />
          </Link>
          <Link href="/register">
            <Button variant="outline" className="border-2 hover:text-white font-semibold transition-all text-sm sm:text-base px-3 sm:px-4" style={{ borderColor: '#014b89', color: '#014b89' }} onMouseEnter={(e) => e.currentTarget.style.background = '#014b89'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
              Register
            </Button>
          </Link>
        </div>
      </nav>

      {/* Main Content - Mobile Optimized */}
      <div className="relative z-10 flex items-center justify-center px-4 py-8 sm:py-12 md:py-16">
        <div className="w-full max-w-md">
          {/* Header - Mobile Optimized */}
          <div className="text-center mb-6 sm:mb-8 animate-fade-in">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 sm:mb-3" style={{ color: '#014b89' }}>
              Welcome Back
            </h1>
            <p className="text-base sm:text-lg text-gray-600">Sign in to your hostel account</p>
          </div>

          {/* Main Card - Mobile Optimized */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border-2 shadow-2xl px-5 py-6 sm:px-6 sm:py-8 md:p-10 mb-4 sm:mb-6 animate-scale-in" style={{ borderColor: 'rgba(1, 75, 137, 0.1)' }}>
            {/* Error Message - Mobile Optimized */}
            {error && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-xl border-2 flex items-start gap-2 sm:gap-3 animate-shake" style={{ background: 'rgba(239, 68, 68, 0.05)', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-700 text-xs sm:text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Login Form - Mobile Optimized */}
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 mb-6 sm:mb-8">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Email Address *</label>
                <div className="relative">
                  <Mail className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 sm:pl-12 border-2 border-gray-200 focus:border-[#014b89] focus:ring-[#014b89] rounded-xl h-11 sm:h-12 transition-all text-sm sm:text-base"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Password *</label>
                <div className="relative">
                  <Lock className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 sm:pl-12 border-2 border-gray-200 focus:border-[#014b89] focus:ring-[#014b89] rounded-xl h-11 sm:h-12 transition-all text-sm sm:text-base"
                    required
                  />
                </div>
              </div>

              {/* Role Selection - Mobile Optimized */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2 sm:mb-3">Select Your Role *</label>
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {DEMO_CREDENTIALS.map((cred) => {
                    const Icon = cred.icon
                    return (
                      <button
                        key={cred.role}
                        type="button"
                        onClick={() => setSelectedRole(cred.role)}
                        className={`p-2 sm:p-3 rounded-lg sm:rounded-xl border-2 transition-all duration-200 ${
                          selectedRole === cred.role
                            ? 'shadow-lg'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        style={{
                          borderColor: selectedRole === cred.role ? cred.color : undefined,
                          background: selectedRole === cred.role ? `${cred.color}08` : undefined
                        }}
                      >
                        <div className="flex flex-col items-center gap-1.5 sm:gap-2">
                          <div 
                            className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center"
                            style={{ background: selectedRole === cred.role ? cred.color : 'rgba(0,0,0,0.05)' }}
                          >
                            <Icon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: selectedRole === cred.role ? 'white' : '#666' }} />
                          </div>
                          <div className="text-[10px] sm:text-xs font-bold text-gray-900 text-center leading-tight">{cred.title}</div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Submit Button - Mobile Optimized */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full mt-4 sm:mt-6 text-white font-bold py-3 sm:py-4 rounded-xl transition-all duration-200 disabled:opacity-50 text-sm sm:text-base shadow-lg hover:shadow-xl"
                style={{ background: '#014b89' }}
                onMouseEnter={(e) => !isLoading && (e.currentTarget.style.background = '#012d52')}
                onMouseLeave={(e) => !isLoading && (e.currentTarget.style.background = '#014b89')}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Sign In
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                  </span>
                )}
              </Button>
            </form>
          </div>

          {/* Footer - Mobile Optimized */}
          <div className="text-center space-y-2 sm:space-y-3">
            <p className="text-xs sm:text-sm text-gray-600">
              Don't have an account?{' '}
              <Link href="/register" className="font-semibold hover:underline transition-colors" style={{ color: '#014b89' }}>
                Register Now
              </Link>
            </p>
            <p className="text-xs sm:text-sm text-gray-600">
              <Link href="/" className="font-semibold hover:underline transition-colors" style={{ color: '#f26918' }}>
                ← Back to Home
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0 h-2 z-0" style={{ background: 'linear-gradient(to right, #014b89, #f26918)' }}></div>
    </main>
  )
}
