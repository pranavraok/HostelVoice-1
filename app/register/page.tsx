'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
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
        .animate-slide-up { animation: slide-up 0.6s ease-out forwards; }
      `}</style>

      {/* Background Decorations */}
      <div className="absolute top-40 right-10 w-96 h-96 rounded-full bg-cyan-100 opacity-20 blur-3xl -z-10"></div>
      <div className="absolute bottom-0 left-20 w-72 h-72 rounded-full bg-purple-100 opacity-20 blur-3xl -z-10"></div>

      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-16 animate-slide-up">
          <Link href="/" className="inline-flex items-center gap-3 mb-8 hover:opacity-80 transition-opacity">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-sm">HV</span>
            </div>
            <span className="font-bold text-gray-900 text-lg">HostelVoice</span>
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Create Your Account</h1>
          <p className="text-lg text-gray-600">Choose your role to get started</p>
        </div>

        {/* Role Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {/* Student */}
          <Link href="/register/student" className="group">
            <div className="bg-white border-2 border-gray-200 hover:border-cyan-500 rounded-2xl p-8 transition-all duration-300 hover:shadow-xl h-full flex flex-col justify-between animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <div>
                <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center mb-4 text-white">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C6.5 6.253 2 10.998 2 17s4.5 10.747 10 10.747c5.5 0 10-4.998 10-10.747 0-6.002-4.5-10.747-10-10.747z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Student</h3>
                <p className="text-gray-600 mb-6">Report issues, view announcements, and manage your hostel experience</p>
              </div>
              <button className="flex items-center gap-2 text-cyan-600 hover:text-cyan-700 font-semibold group-hover:gap-3 transition-all">
                Get Started <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </Link>

          {/* Caretaker */}
          <Link href="/register/caretaker" className="group">
            <div className="bg-white border-2 border-gray-200 hover:border-purple-500 rounded-2xl p-8 transition-all duration-300 hover:shadow-xl h-full flex flex-col justify-between animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div>
                <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center mb-4 text-white">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Caretaker</h3>
                <p className="text-gray-600 mb-6">Manage resident issues, track operations, and ensure hostel maintenance</p>
              </div>
              <button className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-semibold group-hover:gap-3 transition-all">
                Get Started <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </Link>

          {/* Admin */}
          <Link href="/register/admin" className="group">
            <div className="bg-white border-2 border-gray-200 hover:border-indigo-500 rounded-2xl p-8 transition-all duration-300 hover:shadow-xl h-full flex flex-col justify-between animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <div>
                <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center mb-4 text-white">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Administrator</h3>
                <p className="text-gray-600 mb-6">Full analytics, user management, and complete hostel system control</p>
              </div>
              <button className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-semibold group-hover:gap-3 transition-all">
                Get Started <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </Link>
        </div>

        {/* Footer */}
        <div className="text-center animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <p className="text-gray-600">Already have an account? <Link href="/login" className="text-cyan-600 hover:text-cyan-700 font-semibold">Sign In</Link></p>
        </div>
      </div>
    </div>
  )
}
