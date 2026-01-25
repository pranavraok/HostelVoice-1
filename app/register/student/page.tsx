'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AlertCircle, Check, Eye, EyeOff } from 'lucide-react'

const DEMO_DATA = {
  fullName: 'John Doe',
  email: 'john@college.edu',
  studentId: 'STU2025001',
  phoneNumber: '+91 9876543210',
  hostel: 'Block A',
  roomNumber: '101',
  password: 'password123',
  confirmPassword: 'password123'
}

export default function StudentRegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    studentId: '',
    phoneNumber: '',
    hostel: 'Block A',
    roomNumber: '',
    password: '',
    confirmPassword: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      setError('Full name is required')
      return false
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('Valid email is required')
      return false
    }
    if (!formData.studentId.trim()) {
      setError('Student ID is required')
      return false
    }
    if (!formData.phoneNumber.trim()) {
      setError('Phone number is required')
      return false
    }
    if (!formData.roomNumber.trim()) {
      setError('Room number is required')
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

  const fillDemoData = () => {
    setFormData(DEMO_DATA)
    setAgreeTerms(true)
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      // Simulate registration
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSuccess(true)
      
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch (err) {
      setError('Registration failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto">
            <Check className="w-6 h-6 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Account Created!</h2>
          <p className="text-gray-600">Your student account has been successfully created. Redirecting to login...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4 py-12">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Registration</h1>
          <p className="text-gray-600">Join HostelVoice and start reporting issues</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Full Name</label>
              <Input
                type="text"
                name="fullName"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full border-gray-300 focus:border-cyan-500 focus:ring-cyan-500"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Email</label>
              <Input
                type="email"
                name="email"
                placeholder="john@college.edu"
                value={formData.email}
                onChange={handleChange}
                className="w-full border-gray-300 focus:border-cyan-500 focus:ring-cyan-500"
              />
            </div>

            {/* Student ID */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Student ID</label>
              <Input
                type="text"
                name="studentId"
                placeholder="STU2025001"
                value={formData.studentId}
                onChange={handleChange}
                className="w-full border-gray-300 focus:border-cyan-500 focus:ring-cyan-500"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Phone Number</label>
              <Input
                type="tel"
                name="phoneNumber"
                placeholder="+91 9876543210"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="w-full border-gray-300 focus:border-cyan-500 focus:ring-cyan-500"
              />
            </div>

            {/* Hostel */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Hostel</label>
              <select
                name="hostel"
                value={formData.hostel}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-cyan-500 focus:ring-cyan-500 bg-white text-gray-900"
              >
                <option value="Block A">Block A</option>
                <option value="Block B">Block B</option>
                <option value="Block C">Block C</option>
                <option value="Block D">Block D</option>
              </select>
            </div>

            {/* Room Number */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Room Number</label>
              <Input
                type="text"
                name="roomNumber"
                placeholder="101"
                value={formData.roomNumber}
                onChange={handleChange}
                className="w-full border-gray-300 focus:border-cyan-500 focus:ring-cyan-500"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-900 mb-2">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full border-gray-300 focus:border-cyan-500 focus:ring-cyan-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-900 mb-2">Confirm Password</label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full border-gray-300 focus:border-cyan-500 focus:ring-cyan-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Terms Agreement */}
          <div className="flex items-start gap-3 pt-4">
            <input
              type="checkbox"
              id="terms"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500 cursor-pointer mt-0.5"
            />
            <label htmlFor="terms" className="text-sm text-gray-700">
              I agree to the <a href="#" className="text-cyan-600 hover:text-cyan-700 font-medium">Terms of Service</a> and <a href="#" className="text-cyan-600 hover:text-cyan-700 font-medium">Privacy Policy</a>
            </label>
          </div>

          {/* Demo Data Button */}
          <button
            type="button"
            onClick={fillDemoData}
            className="w-full px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Fill Demo Data
          </button>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 disabled:opacity-50"
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </Button>

          {/* Login Link */}
          <p className="text-center text-gray-600">
            Already have an account? <Link href="/login" className="text-cyan-600 hover:text-cyan-700 font-semibold">Sign In</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
