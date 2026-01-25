'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { ArrowRight, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function LandingPage() {
  const [scrollY, setScrollY] = useState(0)
  const [isInView, setIsInView] = useState(false)
  const featuresRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsInView(entry.isIntersecting)
    }, { threshold: 0.1 })
    if (featuresRef.current) {
      observer.observe(featuresRef.current)
    }
    return () => observer.disconnect()
  }, [])

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      <style jsx>{`
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes pulse-ring {
          0% { box-shadow: 0 0 0 0 rgba(0, 217, 255, 0.7); }
          70% { box-shadow: 0 0 0 30px rgba(0, 217, 255, 0); }
          100% { box-shadow: 0 0 0 0 rgba(0, 217, 255, 0); }
        }
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
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-pulse-ring { animation: pulse-ring 2s infinite; }
        .animate-slide-up { animation: slide-up 0.6s ease-out forwards; }
        .gradient-text { background: linear-gradient(135deg, #00d9ff 0%, #667eea 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
      `}</style>

      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md border-b border-gray-100 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-sm">HV</span>
            </div>
            <span className="font-bold text-gray-900 text-lg">HostelVoice</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/login" className="text-gray-600 hover:text-gray-900 transition-colors font-medium text-sm">
              Sign In
            </Link>
            <Link href="/register">
              <Button className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white border-0 shadow-lg hover:shadow-xl transition-all">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-32 px-6 relative">
        {/* Background Decorations */}
        <div className="absolute top-40 right-10 w-96 h-96 rounded-full bg-cyan-100 opacity-20 blur-3xl -z-10"></div>
        <div className="absolute bottom-0 left-20 w-72 h-72 rounded-full bg-purple-100 opacity-20 blur-3xl -z-10"></div>

        <div className="max-w-5xl mx-auto text-center space-y-8">
          <div 
            className="animate-slide-up"
            style={{ animationDelay: '0.1s' }}
          >
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-cyan-50 border border-cyan-200 rounded-full">
              <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse-ring"></div>
              <span className="text-sm font-semibold gradient-text">Modern Hostel Management</span>
            </div>
          </div>
          
          <h1 
            className="text-6xl md:text-7xl lg:text-8xl font-bold text-gray-900 leading-tight tracking-tight animate-slide-up"
            style={{ animationDelay: '0.2s' }}
          >
            Manage your hostel <span className="gradient-text">intelligently</span>
          </h1>
          
          <p 
            className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto animate-slide-up"
            style={{ animationDelay: '0.3s' }}
          >
            Empower students, streamline caretaker workflows, and give admins complete control with a unified platform designed for modern hostel communities.
          </p>

          <div 
            className="flex flex-col sm:flex-row gap-4 justify-center pt-4 animate-slide-up"
            style={{ animationDelay: '0.4s' }}
          >
            <Link href="/login">
              <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white border-0 px-8 group shadow-xl hover:shadow-2xl transition-all">
                Start Free Trial
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-gray-300 text-gray-900 hover:bg-gray-50 bg-white"
            >
              View Features
              <ChevronDown className="ml-2 w-5 h-5" />
            </Button>
          </div>

          {/* Stats Section */}
          <div 
            className="grid grid-cols-3 gap-6 pt-16 border-t border-gray-200 animate-slide-up"
            style={{ animationDelay: '0.5s' }}
          >
            <div className="space-y-2 hover:scale-105 transition-transform duration-300">
              <div className="text-4xl font-bold gradient-text">500+</div>
              <p className="text-gray-600 text-sm font-medium">Hostels Active</p>
            </div>
            <div className="space-y-2 hover:scale-105 transition-transform duration-300">
              <div className="text-4xl font-bold gradient-text">50K+</div>
              <p className="text-gray-600 text-sm font-medium">Users Worldwide</p>
            </div>
            <div className="space-y-2 hover:scale-105 transition-transform duration-300">
              <div className="text-4xl font-bold gradient-text">99.9%</div>
              <p className="text-gray-600 text-sm font-medium">Platform Uptime</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-32 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Powerful features for every role
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Whether you're a student, caretaker, or administrator, HostelVoice provides tailored tools to meet your needs.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Student Portal',
                description: 'Report issues, browse announcements, and connect with the community',
                items: ['Report Issues', 'View Announcements', 'Lost & Found', 'Community Chat'],
                gradient: 'from-cyan-500 to-cyan-600'
              },
              {
                title: 'Caretaker Dashboard',
                description: 'Manage issues efficiently and keep residents informed',
                items: ['Track Issues', 'Send Updates', 'Resident Directory', 'Response Analytics'],
                gradient: 'from-blue-500 to-blue-600'
              },
              {
                title: 'Admin Control',
                description: 'Monitor entire hostel operations with comprehensive analytics',
                items: ['System Analytics', 'User Management', 'Performance Reports', 'Settings'],
                gradient: 'from-purple-500 to-purple-600'
              }
            ].map((feature, idx) => (
              <div 
                key={idx}
                className={`bg-white rounded-2xl p-8 border border-gray-200 hover:border-gray-300 transition-all duration-300 hover:shadow-xl hover:-translate-y-2 animate-slide-up`}
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.gradient} mb-6`}></div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 mb-6">{feature.description}</p>
                <ul className="space-y-3">
                  {feature.items.map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-gray-700">
                      <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
                      <span className="text-sm font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-32 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Simple and intuitive workflow
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Register', desc: 'Create your account in seconds' },
              { step: '02', title: 'Choose Role', desc: 'Select your role in the hostel' },
              { step: '03', title: 'Explore', desc: 'Access role-specific features' },
              { step: '04', title: 'Collaborate', desc: 'Start managing your hostel' }
            ].map((item, idx) => (
              <div 
                key={idx}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-100 to-purple-100 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center h-full hover:border-gray-300 transition-all duration-300">
                  <div className="text-4xl font-bold gradient-text mb-4">{item.step}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-8">
            Ready to transform your hostel?
          </h2>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Join hundreds of hostels already using HostelVoice to streamline operations and build stronger communities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 text-white border-0 px-10 shadow-xl hover:shadow-2xl transition-all">
                Get Started Today
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600"></div>
              <span className="font-bold text-white">HostelVoice</span>
            </div>
            <p className="text-sm">© 2024 HostelVoice. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
