'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AlertCircle, Check, Eye, EyeOff, ArrowLeft, Shield, Sparkles } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'
import { useToast } from '@/hooks/use-toast'

export default function AdminRegisterPage() {
  const router = useRouter()
  const { register } = useAuth()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    adminId: '',
    phoneNumber: '',
    position: 'Hostel Administrator',
    department: 'Administration',
    password: '',
    confirmPassword: '',
    secretCode: ''
  })
  

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const validateForm = () => {
    if (!formData.secretCode.trim()) {
      setError('Admin registration code is required')
      return false
    }
    if (formData.secretCode !== process.env.NEXT_PUBLIC_ADMIN_SECRET_CODE) {
      setError('Invalid admin registration code. Please contact the administrator.')
      return false
    }
    if (!formData.fullName.trim()) {
      setError('Full name is required')
      return false
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('Valid email is required')
      return false
    }
    if (!formData.adminId.trim()) {
      setError('Admin ID is required')
      return false
    }
    if (!formData.phoneNumber.trim()) {
      setError('Phone number is required')
      return false
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return false
    }
    if (!agreeTerms) {
      setError('You must agree to the Terms of Service and Privacy Policy')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: error || "Please check all required fields.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    toast({
      title: "Creating Account...",
      description: "Please wait while we process your registration.",
    })

    try {
      await register({
        email: formData.email,
        password: formData.password,
        fullName: formData.fullName,
        role: 'admin',
        phoneNumber: formData.phoneNumber,
        adminId: formData.adminId,
        position: formData.position,
        department: formData.department,
      })
      
      toast({
        title: "Admin Account Created! 🎉",
        description: "Your admin account is ready. Redirecting to login...",
      })
      
      setSuccess(true)
      
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed. Please try again.'
      setError(errorMessage)
      toast({
        title: "Registration Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4 relative overflow-hidden">
        <style jsx>{`
          @keyframes scale-in {
            from {
              opacity: 0;
              transform: scale(0.9);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
          .animate-scale-in { animation: scale-in 0.5s ease-out forwards; }
        `}</style>

        {/* Background */}
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(1, 75, 137, 0.05) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(1, 75, 137, 0.05) 1px, transparent 1px)
            `,
            backgroundSize: "80px 80px",
          }}
        />

        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 md:p-12 max-w-md w-full text-center space-y-4 sm:space-y-6 relative z-10 border-2 animate-scale-in" style={{ borderColor: 'rgba(1, 75, 137, 0.1)' }}>
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto" style={{ background: 'rgba(1, 75, 137, 0.1)' }}>
            <Check className="w-8 h-8 sm:w-10 sm:h-10" style={{ color: '#014b89' }} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold" style={{ color: '#014b89' }}>Account Created!</h2>
          <p className="text-gray-600 text-base sm:text-lg leading-relaxed">Your admin account has been successfully created. Redirecting to login...</p>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#014b89' }}></div>
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#014b89', animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#014b89', animationDelay: '0.4s' }}></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      <style jsx>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        .animate-slide-up { animation: slide-up 0.6s ease-out forwards; }
        .animate-float { animation: float 4s ease-in-out infinite; }
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
      <div className="absolute bottom-20 left-10 w-80 h-80 rounded-full opacity-10 blur-3xl animate-float" style={{ background: '#014b89', animationDelay: '2s' }}></div>

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
          <Link href="/login">
            <Button variant="outline" className="border-2 hover:text-white font-semibold transition-all text-sm sm:text-base px-3 sm:px-4" style={{ borderColor: '#014b89', color: '#014b89' }} onMouseEnter={(e) => e.currentTarget.style.background = '#014b89'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
              Sign In
            </Button>
          </Link>
        </div>
      </nav>

      {/* Main Content - Mobile Optimized */}
      <div className="relative z-10 flex items-center justify-center px-4 sm:px-6 py-6 sm:py-8 md:py-12">
        <div className="w-full max-w-3xl">
          {/* Back Button - Mobile Optimized */}
          <Link href="/register" className="inline-flex items-center gap-2 mb-4 sm:mb-6 text-gray-600 hover:text-gray-900 transition-colors animate-slide-up text-sm sm:text-base">
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="font-medium">Back to role selection</span>
          </Link>

          {/* Form Container - Mobile Optimized */}
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-8 md:p-12 border-2 animate-slide-up" style={{ borderColor: 'rgba(1, 75, 137, 0.1)', animationDelay: '0.1s' }}>
            {/* Header - Mobile Optimized */}
            <div className="mb-6 sm:mb-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0" style={{ background: '#014b89' }}>
                  <Shield className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold" style={{ color: '#014b89' }}>Administrator Registration</h1>
                  <p className="text-sm sm:text-base text-gray-600 mt-1">Register as an administrator to manage the entire hostel system</p>
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-xl border-2 flex items-start gap-2 sm:gap-3 animate-slide-up" style={{ background: 'rgba(239, 68, 68, 0.05)', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm text-red-700 font-medium">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {/* Admin Secret Code - Mobile Optimized */}
              <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 mb-4 sm:mb-6" style={{ borderColor: '#014b89', background: 'rgba(1, 75, 137, 0.03)' }}>
                <div className="flex items-start gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <Shield className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: '#014b89' }} />
                  <div className="flex-1 min-w-0">
                    <label className="block text-sm font-bold text-gray-900 mb-1">Admin Registration Code *</label>
                    <p className="text-xs text-gray-600 mb-3">Enter the secret code provided by the administrator</p>
                  </div>
                </div>
                <Input
                  type="password"
                  name="secretCode"
                  placeholder="Enter admin secret code"
                  value={formData.secretCode}
                  onChange={handleChange}
                  className="w-full border-2 border-gray-200 focus:border-[#014b89] focus:ring-[#014b89] rounded-xl h-11 sm:h-12 transition-all text-sm sm:text-base"
                  autoComplete="off"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Full Name *</label>
                  <Input
                    type="text"
                    name="fullName"
                    placeholder="Dr. Priya Singh"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full border-2 border-gray-200 focus:border-[#014b89] focus:ring-[#014b89] rounded-xl h-11 sm:h-12 transition-all text-sm sm:text-base"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Email *</label>
                  <Input
                    type="email"
                    name="email"
                    placeholder="admin@university.edu"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full border-2 border-gray-200 focus:border-[#014b89] focus:ring-[#014b89] rounded-xl h-11 sm:h-12 transition-all text-sm sm:text-base"
                  />
                </div>

                {/* Admin ID */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Admin ID *</label>
                  <Input
                    type="text"
                    name="adminId"
                    placeholder="ADM2025001"
                    value={formData.adminId}
                    onChange={handleChange}
                    className="w-full border-2 border-gray-200 focus:border-[#014b89] focus:ring-[#014b89] rounded-xl h-11 sm:h-12 transition-all text-sm sm:text-base"
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Phone Number *</label>
                  <Input
                    type="tel"
                    name="phoneNumber"
                    placeholder="+91 9876543210"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className="w-full border-2 border-gray-200 focus:border-[#014b89] focus:ring-[#014b89] rounded-xl h-11 sm:h-12 transition-all text-sm sm:text-base"
                  />
                </div>

                {/* Position */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Position *</label>
                  <select
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                    className="w-full h-11 sm:h-12 px-3 sm:px-4 border-2 border-gray-200 rounded-xl focus:border-[#014b89] focus:ring-[#014b89] bg-white text-gray-900 font-medium transition-all text-sm sm:text-base"
                  >
                    <option value="Hostel Administrator">Hostel Administrator</option>
                    <option value="Hostel Director">Hostel Director</option>
                    <option value="Dean of Hostel">Dean of Hostel</option>
                    <option value="System Administrator">System Administrator</option>
                  </select>
                </div>

                {/* Department */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Department *</label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="w-full h-11 sm:h-12 px-3 sm:px-4 border-2 border-gray-200 rounded-xl focus:border-[#014b89] focus:ring-[#014b89] bg-white text-gray-900 font-medium transition-all text-sm sm:text-base"
                  >
                    <option value="Administration">Administration</option>
                    <option value="Student Affairs">Student Affairs</option>
                    <option value="Operations">Operations</option>
                    <option value="Finance">Finance</option>
                  </select>
                </div>

                {/* Password */}
                <div className="relative">
                  <label className="block text-sm font-bold text-gray-900 mb-2">Password *</label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      placeholder="- - - - - - - - "
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full border-2 border-gray-200 focus:border-[#014b89] focus:ring-[#014b89] rounded-xl h-11 sm:h-12 pr-12 transition-all text-sm sm:text-base"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="relative">
                  <label className="block text-sm font-bold text-gray-900 mb-2">Confirm Password *</label>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      placeholder="- - - - - - - - "
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full border-2 border-gray-200 focus:border-[#014b89] focus:ring-[#014b89] rounded-xl h-11 sm:h-12 pr-12 transition-all text-sm sm:text-base"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Terms Agreement - Mobile Optimized */}
              <div className="flex items-start gap-2 sm:gap-3 pt-2 sm:pt-4 p-3 sm:p-4 rounded-xl" style={{ background: 'rgba(1, 75, 137, 0.03)' }}>
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-4 h-4 sm:w-5 sm:h-5 rounded border-gray-300 cursor-pointer mt-0.5 flex-shrink-0"
                  style={{ accentColor: '#014b89' }}
                />
                <label htmlFor="terms" className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                  I agree to the <a href="#" className="font-semibold hover:underline" style={{ color: '#014b89' }}>Terms of Service</a> and <a href="#" className="font-semibold hover:underline" style={{ color: '#014b89' }}>Privacy Policy</a>
                </label>
              </div>

              {/* Submit Button - Mobile Optimized */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full text-white font-bold py-3 sm:py-4 rounded-xl transition-all duration-200 disabled:opacity-50 text-sm sm:text-base shadow-lg hover:shadow-xl"
                style={{ background: '#014b89' }}
                onMouseEnter={(e) => !isLoading && (e.currentTarget.style.background = '#012d52')}
                onMouseLeave={(e) => !isLoading && (e.currentTarget.style.background = '#014b89')}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating Account...
                  </span>
                ) : (
                  'Create Administrator Account'
                )}
              </Button>

              {/* Login Link - Mobile Optimized */}
              <p className="text-center text-gray-600 pt-2 text-sm sm:text-base">
                Already have an account? <Link href="/login" className="font-semibold hover:underline" style={{ color: '#014b89' }}>Sign In</Link>
              </p>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0 h-2 z-0" style={{ background: '#014b89' }}></div>
    </div>
  )
}
