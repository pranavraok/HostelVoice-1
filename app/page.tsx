'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  ArrowRight, 
  Sparkles, 
  Users,  
  Shield, 
  Zap, 
  MessageSquare, 
  Bell, 
  ClipboardList, 
  UserCheck, 
  BarChart3, 
  Settings, 
  Home, 
  CheckCircle2, 
  TrendingUp,
  Clock,
  Lock,
  Calendar,
  Search,
  Star,
  GraduationCap,
  UserCog,
  FileText,
  ShoppingBag,
  CreditCard,
  School,
  ShieldCheck,
  UsersRound,
  Bed,
  Twitter,
  Linkedin,
  Facebook,
  Instagram,
  Youtube,
  MapPin,
  Menu,
  X,
  UtensilsCrossed
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function LandingPage() {
  const [scrollY, setScrollY] = useState(0)
  const [isInView, setIsInView] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const featuresRef = useRef<HTMLElement>(null)

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
    <div className="min-h-screen w-full bg-white relative overflow-hidden">
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(1, 75, 137, 0.5); }
          50% { box-shadow: 0 0 40px rgba(1, 75, 137, 0.8); }
        }
        @keyframes slide-in-left {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slide-in-right {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes rotate-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes scale-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes draw-circle {
          from { stroke-dashoffset: 2000; }
          to { stroke-dashoffset: 0; }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
        .animate-slide-in-left { animation: slide-in-left 0.8s ease-out forwards; }
        .animate-slide-in-right { animation: slide-in-right 0.8s ease-out forwards; }
        .animate-slide-up { animation: slide-up 0.6s ease-out forwards; }
        .animate-bounce-subtle { animation: bounce-subtle 2s ease-in-out infinite; }
        .animate-rotate-slow { animation: rotate-slow 20s linear infinite; }
        .animate-scale-pulse { animation: scale-pulse 3s ease-in-out infinite; }
        .animate-fade-in { animation: fade-in 1s ease-out forwards; }
        .hover-lift {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .hover-lift:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(1, 75, 137, 0.2);
        }
        .ecosystem-circle {
          stroke-dasharray: 2000;
          animation: draw-circle 2s ease-out forwards;
        }
      `}</style>

      {/* Blue Gradient Grid Background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(1, 75, 137, 0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(1, 75, 137, 0.08) 1px, transparent 1px),
            radial-gradient(circle 1000px at 0% 100px, rgba(1, 75, 137, 0.05), transparent)
          `,
          backgroundSize: "80px 80px, 80px 80px, 100% 100%",
        }}
      />

      {/* Animated Floating Orbs */}
      <div className="absolute top-20 right-10 w-72 h-72 rounded-full opacity-10 blur-3xl animate-float" style={{ background: '#014b89', animationDelay: '0s' }}></div>
      <div className="absolute bottom-40 left-10 w-96 h-96 rounded-full opacity-10 blur-3xl animate-float" style={{ background: '#f26918', animationDelay: '2s' }}></div>
      <div className="absolute top-1/2 right-1/4 w-64 h-64 rounded-full opacity-8 blur-3xl animate-float" style={{ background: '#014b89', animationDelay: '4s' }}></div>

      {/* Navigation - Mobile Optimized */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-xl border-b border-gray-200 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3 animate-slide-in-left">
              <Image 
                src="/logo/logo.png" 
                alt="HostelVoice Logo" 
                width={2000} 
                height={70} 
                className="h-12 sm:h-14 md:h-16 w-auto"
                priority
              />
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6 animate-slide-in-right">
              <Link href="/login" className="text-gray-700 hover:text-[#014b89] transition-colors font-semibold text-sm">
                Sign In
              </Link>
              <Link href="/register">
                <Button className="text-white border-0 shadow-lg hover:shadow-xl transition-all hover:scale-105 font-semibold" style={{ background: '#014b89' }}>
                  Register
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-700" />
              ) : (
                <Menu className="w-6 h-6 text-gray-700" />
              )}
            </button>
          </div>

          {/* Mobile Menu Dropdown */}
          {mobileMenuOpen && (
            <div className="md:hidden pt-4 pb-3 space-y-3 animate-slide-up border-t border-gray-100 mt-3">
              <Link 
                href="/login" 
                className="block text-center py-2 text-gray-700 hover:text-[#014b89] transition-colors font-semibold text-sm"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign In
              </Link>
              <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full text-white border-0 shadow-lg font-semibold" style={{ background: '#014b89' }}>
                  Register
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section - Mobile Optimized */}
      <section className="pt-24 sm:pt-28 md:pt-32 pb-12 sm:pb-16 md:pb-24 px-4 sm:px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <div className="space-y-6 sm:space-y-8 text-center lg:text-left">
              <h1 
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight animate-slide-up"
                style={{ animationDelay: '0.2s', color: '#014b89' }}
              >
                Manage Your Hostel{' '}
                <span style={{ color: '#f26918' }}>INTELLIGENTLY</span>
              </h1>

              <p 
                className="text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed animate-slide-up max-w-2xl mx-auto lg:mx-0"
                style={{ animationDelay: '0.3s' }}
              >
                Empower students, streamline caretaker workflows, and give admins complete control with a unified platform designed for modern hostel communities.
              </p>

              <div 
                className="flex flex-col sm:flex-row gap-3 sm:gap-4 animate-slide-up justify-center lg:justify-start"
                style={{ animationDelay: '0.4s' }}
              >
                <Link href="/register" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto text-white border-0 px-6 sm:px-8 shadow-xl hover:shadow-2xl transition-all group text-sm sm:text-base font-semibold" style={{ background: '#014b89' }}>
                    Get Started
                    <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="w-full sm:w-auto border-2 hover:text-white font-semibold text-sm sm:text-base transition-all" 
                  style={{ borderColor: '#f26918', color: '#f26918' }} 
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f26918'} 
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  onClick={() => {
                    featuresRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }}
                >
                  Explore Features
                  <Sparkles className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 sm:gap-8 pt-4 animate-slide-up" style={{ animationDelay: '0.5s' }}>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" style={{ color: '#f26918' }} />
                  <span className="text-sm text-gray-700 font-medium whitespace-nowrap">60% Time Saved</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" style={{ color: '#f26918' }} />
                  <span className="text-sm text-gray-700 font-medium whitespace-nowrap">50% Faster Resolution</span>
                </div>
              </div>
            </div>

            {/* Right - Ecosystem Circular Diagram - Hidden on Mobile, Visible on Large Screens */}
            <div className="relative h-[400px] sm:h-[500px] lg:h-[600px] hidden lg:block">
              {/* Container to prevent overflow */}
              <div className="absolute inset-0 flex items-center justify-center">
                {/* SVG Connecting Circles */}
                <svg className="absolute w-[580px] h-[580px]" viewBox="0 0 580 580" style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}>
                  {/* Outer Circle */}
                  <circle 
                    cx="290" 
                    cy="290" 
                    r="230" 
                    fill="none" 
                    stroke="rgba(1, 75, 137, 0.3)" 
                    strokeWidth="2" 
                    strokeDasharray="10,10"
                    className="ecosystem-circle"
                    style={{ animationDelay: '0.5s' }}
                  />
                  {/* Inner Circle */}
                  <circle 
                    cx="290" 
                    cy="290" 
                    r="160" 
                    fill="none" 
                    stroke="rgba(242, 105, 24, 0.3)" 
                    strokeWidth="2" 
                    strokeDasharray="5,5"
                    className="ecosystem-circle"
                    style={{ animationDelay: '0.7s' }}
                  />
                  
                  {/* Connecting Lines */}
                  <line x1="290" y1="290" x2="290" y2="60" stroke="rgba(1, 75, 137, 0.2)" strokeWidth="2" className="animate-fade-in" style={{ animationDelay: '1s' }} />
                  <line x1="290" y1="290" x2="127" y2="127" stroke="rgba(1, 75, 137, 0.2)" strokeWidth="2" className="animate-fade-in" style={{ animationDelay: '1.2s' }} />
                  <line x1="290" y1="290" x2="453" y2="127" stroke="rgba(1, 75, 137, 0.2)" strokeWidth="2" className="animate-fade-in" style={{ animationDelay: '1.4s' }} />
                  <line x1="290" y1="290" x2="520" y2="290" stroke="rgba(1, 75, 137, 0.2)" strokeWidth="2" className="animate-fade-in" style={{ animationDelay: '1.6s' }} />
                  <line x1="290" y1="290" x2="453" y2="453" stroke="rgba(1, 75, 137, 0.2)" strokeWidth="2" className="animate-fade-in" style={{ animationDelay: '1.8s' }} />
                  <line x1="290" y1="290" x2="290" y2="520" stroke="rgba(1, 75, 137, 0.2)" strokeWidth="2" className="animate-fade-in" style={{ animationDelay: '2s' }} />
                  <line x1="290" y1="290" x2="127" y2="453" stroke="rgba(1, 75, 137, 0.2)" strokeWidth="2" className="animate-fade-in" style={{ animationDelay: '2.2s' }} />
                  <line x1="290" y1="290" x2="60" y2="290" stroke="rgba(1, 75, 137, 0.2)" strokeWidth="2" className="animate-fade-in" style={{ animationDelay: '2.4s' }} />
                </svg>

                {/* Center - Student Accommodation */}
                <div className="absolute w-36 h-36 rounded-full bg-white shadow-2xl flex flex-col items-center justify-center border-4 z-20 animate-scale-pulse" style={{ left: '38.5%', top: '38.5%', transform: 'translate(-50%, -50%)', borderColor: 'rgba(1, 75, 137, 0.2)' }}>
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-2" style={{ background: '#014b89' }}>
                    <Bed className="w-7 h-7 text-white" />
                  </div>
                  <p className="text-xs font-bold text-gray-900 text-center leading-tight px-2">Student<br/>Accommodation</p>
                </div>

                {/* Stakeholder Nodes */}
                {/* 1. Students - Top */}
                <div 
                  className="absolute w-28 h-28 rounded-full bg-white shadow-xl flex flex-col items-center justify-center border-2 animate-fade-in"
                  style={{ left: '50%', top: '0', transform: 'translateX(-50%)', animationDelay: '1s', borderColor: 'rgba(242, 105, 24, 0.2)' }}
                >
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mb-1" style={{ background: 'rgba(242, 105, 24, 0.1)' }}>
                    <Users className="w-6 h-6" style={{ color: '#f26918' }} />
                  </div>
                  <p className="text-xs font-bold text-gray-900">Students</p>
                </div>

                {/* 2. Caretakers - Top Left */}
                <div 
                  className="absolute w-28 h-28 rounded-full bg-white shadow-xl flex flex-col items-center justify-center border-2 animate-fade-in"
                  style={{ left: '5%', top: '12%', animationDelay: '1.2s', borderColor: 'rgba(1, 75, 137, 0.2)' }}
                >
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mb-1" style={{ background: 'rgba(1, 75, 137, 0.1)' }}>
                    <UserCheck className="w-6 h-6" style={{ color: '#014b89' }} />
                  </div>
                  <p className="text-xs font-bold text-gray-900 text-center leading-tight">Caretakers</p>
                </div>

                {/* 3. Admin - Top Right */}
                <div 
                  className="absolute w-28 h-28 rounded-full bg-white shadow-xl flex flex-col items-center justify-center border-2 animate-fade-in"
                  style={{ right: '5%', top: '12%', animationDelay: '1.4s', borderColor: 'rgba(1, 75, 137, 0.2)' }}
                >
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mb-1" style={{ background: 'rgba(1, 75, 137, 0.1)' }}>
                    <Settings className="w-6 h-6" style={{ color: '#014b89' }} />
                  </div>
                  <p className="text-xs font-bold text-gray-900 text-center leading-tight">Admin</p>
                </div>

                {/* 4. Community - Right */}
                <div 
                  className="absolute w-28 h-28 rounded-full bg-white shadow-xl flex flex-col items-center justify-center border-2 animate-fade-in"
                  style={{ right: '0', top: '50%', transform: 'translateY(-50%)', animationDelay: '1.6s', borderColor: 'rgba(242, 105, 24, 0.2)' }}
                >
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mb-1" style={{ background: 'rgba(242, 105, 24, 0.1)' }}>
                    <MessageSquare className="w-6 h-6" style={{ color: '#f26918' }} />
                  </div>
                  <p className="text-xs font-bold text-gray-900">Community</p>
                </div>

                {/* 5. Mess - Bottom Right */}
                <div 
                  className="absolute w-28 h-28 rounded-full bg-white shadow-xl flex flex-col items-center justify-center border-2 animate-fade-in"
                  style={{ right: '5%', bottom: '12%', animationDelay: '1.8s', borderColor: 'rgba(1, 75, 137, 0.2)' }}
                >
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mb-1" style={{ background: 'rgba(1, 75, 137, 0.1)' }}>
                    <UtensilsCrossed className="w-6 h-6" style={{ color: '#014b89' }} />
                  </div>
                  <p className="text-xs font-bold text-gray-900">Mess</p>
                </div>

                {/* 6. Operations - Bottom Center */}
                <div 
                  className="absolute w-28 h-28 rounded-full bg-white shadow-xl flex flex-col items-center justify-center border-2 animate-fade-in"
                  style={{ left: '50%', bottom: '0', transform: 'translateX(-50%)', animationDelay: '2s', borderColor: 'rgba(242, 105, 24, 0.2)' }}
                >
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mb-1" style={{ background: 'rgba(242, 105, 24, 0.1)' }}>
                    <BarChart3 className="w-6 h-6" style={{ color: '#f26918' }} />
                  </div>
                  <p className="text-xs font-bold text-gray-900">Operations</p>
                </div>

                {/* 7. Security - Bottom Left */}
                <div 
                  className="absolute w-28 h-28 rounded-full bg-white shadow-xl flex flex-col items-center justify-center border-2 animate-fade-in"
                  style={{ left: '5%', bottom: '12%', animationDelay: '2.2s', borderColor: 'rgba(1, 75, 137, 0.2)' }}
                >
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mb-1" style={{ background: 'rgba(1, 75, 137, 0.1)' }}>
                    <Shield className="w-6 h-6" style={{ color: '#014b89' }} />
                  </div>
                  <p className="text-xs font-bold text-gray-900">Security</p>
                </div>

                {/* 8. Compliance - Left */}
                <div 
                  className="absolute w-28 h-28 rounded-full bg-white shadow-xl flex flex-col items-center justify-center border-2 animate-fade-in"
                  style={{ left: '0', top: '50%', transform: 'translateY(-50%)', animationDelay: '2.4s', borderColor: 'rgba(242, 105, 24, 0.2)' }}
                >
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mb-1" style={{ background: 'rgba(242, 105, 24, 0.1)' }}>
                    <ClipboardList className="w-6 h-6" style={{ color: '#f26918' }} />
                  </div>
                  <p className="text-xs font-bold text-gray-900">Compliance</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Rest of your sections remain unchanged... */}
      {/* Features Section */}
      <section ref={featuresRef} className="py-24 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#014b89' }}>
              Everything You Need in{' '}
              <span style={{ color: '#f26918' }}>One Platform</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Streamline operations, enhance communication, and deliver exceptional student experiences with our all-in-one solution.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: UserCheck,
                title: 'User Approval System',
                description: 'Admin-controlled registration with approval workflow for students and caretakers',
                color: '#014b89',
                features: ['Pending requests', 'Approve/Reject', 'Role management']
              },
              {
                icon: Users,
                title: 'Resident Directory',
                description: 'Comprehensive student database with hostel details, room info, and approval status',
                color: '#f26918',
                features: ['Student profiles', 'Hostel info', 'Contact details']
              },
              {
                icon: ClipboardList,
                title: 'Issue Tracking',
                description: 'Complete complaint management system with categories, priorities, and assignment tracking',
                color: '#014b89',
                features: ['Report issues', 'Assign staff', 'Status updates']
              },
              {
                icon: Bell,
                title: 'Announcements',
                description: 'Broadcast important updates and notices to students with pin and target audience features',
                color: '#f26918',
                features: ['Post updates', 'Pin important', 'Target groups']
              },
              {
                icon: Calendar,
                title: 'Leave Management',
                description: 'Streamlined leave application system for students with instant approvals and tracking',
                color: '#014b89',
                features: ['Digital requests', 'Quick approvals', 'Status tracking']
              },
              {
                icon: UtensilsCrossed,
                title: 'Mess Management',
                description: 'Complete mess operations with weekly menus, student feedback, and menu downloads',
                color: '#f26918',
                features: ['Weekly menu', 'Feedback system', 'PDF downloads']
              },
              {
                icon: Search,
                title: 'Lost & Found',
                description: 'Digital system to report lost items, register found items, and match them automatically',
                color: '#014b89',
                features: ['Report items', 'Search database', 'Auto-matching']
              },
              {
                icon: BarChart3,
                title: 'Real-Time Analytics',
                description: 'Visual dashboard with charts showing issue trends, user statistics, and resolution rates',
                color: '#f26918',
                features: ['Live metrics', 'Trend charts', 'Performance data']
              },
              {
                icon: Settings,
                title: 'Admin Control Panel',
                description: 'Complete system management with user roles, permissions, and hostel configuration',
                color: '#014b89',
                features: ['User roles', 'Permissions', 'System config']
              }
            ].map((feature, idx) => (
              <div 
                key={idx}
                className={`bg-white rounded-2xl p-7 border-2 border-gray-100 hover:border-[#014b89] transition-all duration-300 hover-lift group ${isInView ? 'animate-slide-up' : 'opacity-0'}`}
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div 
                    className="w-14 h-14 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"
                    style={{ background: feature.color }}
                  >
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                  </div>
                </div>
                <p className="text-gray-600 mb-4 text-sm leading-relaxed">{feature.description}</p>
                <div className="flex flex-wrap gap-2">
                  {feature.features.map((item, i) => (
                    <span key={i} className="text-xs font-medium px-3 py-1 rounded-full border" style={{ background: `${feature.color}10`, color: feature.color, borderColor: `${feature.color}30` }}>
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Role-Based Section */}
      <section className="py-24 px-6 relative z-10" style={{ background: 'rgba(1, 75, 137, 0.03)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#014b89' }}>
              Designed for{' '}
              <span style={{ color: '#f26918' }}>Every Role</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Tailored experiences for students, caretakers, and administrators
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {[
              {
                role: 'Students',
                icon: GraduationCap,
                color: '#014b89',
                gradient: 'from-[#014b89] to-[#0369a1]',
                description: 'Complete hostel living experience with all essential services at your fingertips',
                features: [
                  { icon: ClipboardList, text: 'Report issues & track status' },
                  { icon: Bell, text: 'Stay updated with announcements' },
                  { icon: Calendar, text: 'Apply & manage leave requests' },
                  { icon: UtensilsCrossed, text: 'View mess menu & give feedback' },
                  { icon: Search, text: 'Lost & found services' },
                  { icon: Home, text: 'View hostel & room details' }
                ]
              },
              {
                role: 'Caretakers',
                icon: UserCog,
                color: '#014b89',
                gradient: 'from-[#014b89] to-[#0369a1]',
                description: 'Powerful management tools to oversee residents and maintain hostel operations efficiently',
                features: [
                  { icon: CheckCircle2, text: 'Review & resolve student issues' },
                  { icon: Users, text: 'Assign tasks to staff members' },
                  { icon: Bell, text: 'Post announcements & updates' },
                  { icon: Users, text: 'Access resident directory' },
                  { icon: Calendar, text: 'Review student leave requests' },
                  { icon: UtensilsCrossed, text: 'Manage mess menu & feedback' }
                ]
              },
              {
                role: 'Administrators',
                icon: ShieldCheck,
                color: '#014b89',
                gradient: 'from-[#014b89] to-[#0369a1]',
                description: 'Full system control with comprehensive analytics, user management, and oversight capabilities',
                features: [
                  { icon: UserCheck, text: 'Approve/reject user registrations' },
                  { icon: BarChart3, text: 'Real-time analytics & insights' },
                  { icon: Settings, text: 'Manage roles & permissions' },
                  { icon: Clock, text: 'Review caretaker leave requests' },
                  { icon: TrendingUp, text: 'Monitor system performance' },
                  { icon: Lock, text: 'Security & audit logs' }
                ]
              }
            ].map((role, idx) => (
              <div 
                key={idx}
                className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-200 hover:shadow-3xl transition-all duration-300 hover:-translate-y-2 group relative overflow-hidden"
              >
                {/* Gradient overlay on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${role.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-3xl`}></div>
                
                <div className="relative z-10">
                  <div 
                    className={`w-20 h-20 rounded-2xl flex items-center justify-center shadow-xl mb-6 bg-gradient-to-br ${role.gradient} group-hover:scale-110 transition-transform duration-300`}
                  >
                    <role.icon className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-3 group-hover:text-[#014b89] transition-colors">{role.role}</h3>
                  <p className="text-gray-600 mb-8 leading-relaxed text-base">{role.description}</p>
                  <div className="space-y-4">
                    {role.features.map((feature, i) => (
                      <div key={i} className="flex items-start gap-3 group/item">
                        <div 
                          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover/item:scale-110" 
                          style={{ background: `${role.color}15` }}
                        >
                          <feature.icon className="w-5 h-5" style={{ color: role.color }} />
                        </div>
                        <span className="text-sm font-medium text-gray-700 pt-2 group-hover/item:text-gray-900 transition-colors">{feature.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#014b89' }}>
              How to{' '}
              <span style={{ color: '#f26918' }}>Get Started</span>
            </h2>
            <p className="text-lg text-gray-600">Join your college hostel management system in 4 easy steps</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: '1', icon: UserCheck, title: 'Sign Up', desc: 'Register with your college email', color: '#014b89' },
              { step: '2', icon: Clock, title: 'Get Approved', desc: 'Wait for admin approval', color: '#f26918' },
              { step: '3', icon: Home, title: 'Access Dashboard', desc: 'Login to your personalized dashboard', color: '#014b89' },
              { step: '4', icon: Zap, title: 'Start Using', desc: 'Report issues, apply leave & more', color: '#f26918' }
            ].map((item, idx) => (
              <div key={idx} className="relative group">
                {/* Connecting Line */}
                {idx < 3 && (
                  <div className="hidden lg:block absolute top-12 left-1/2 w-full h-0.5 z-0" style={{ background: 'rgba(1, 75, 137, 0.2)' }}></div>
                )}
                
                <div className="relative bg-white border-2 border-gray-100 rounded-2xl p-6 text-center hover:border-[#014b89] transition-all hover-lift z-10">
                  <div 
                    className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"
                    style={{ background: item.color }}
                  >
                    <item.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white border-2 flex items-center justify-center" style={{ borderColor: item.color }}>
                    <span className="text-sm font-bold" style={{ color: item.color }}>{item.step}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="rounded-3xl p-12 md:p-16 text-center shadow-2xl relative overflow-hidden" style={{ background: '#014b89' }}>
            {/* Background Pattern */}
            <div 
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `
                  linear-gradient(to right, white 1px, transparent 1px),
                  linear-gradient(to bottom, white 1px, transparent 1px)
                `,
                backgroundSize: "40px 40px",
              }}
            />
            
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Join Your College Hostel Community
              </h2>
              <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
                Connect with your hostel community, manage your stay efficiently, and access all services from a single platform. Sign up today and get started!
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register">
                  <Button size="lg" className="bg-white hover:bg-gray-50 border-0 px-10 shadow-xl font-bold text-base" style={{ color: '#014b89' }}>
                    Register Now
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" className="border-2 text-white hover:bg-white/10 font-semibold text-base" style={{ borderColor: 'white', color: 'white', background: 'transparent' }}>
                    Already a Member? Sign In
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 mt-10 pt-8 border-t border-white/20">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                  <span className="text-sm text-white font-medium">Quick registration</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                  <span className="text-sm text-white font-medium">Instant access</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                  <span className="text-sm text-white font-medium">24/7 support</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white relative pt-20 pb-8 px-6 z-10 overflow-hidden border-t border-gray-200">
        {/* Decorative Tree - Right Side */}
        <div className="absolute bottom-0 right-8 w-32 h-40 hidden lg:block z-0">
          <div className="absolute bottom-0 right-12 w-4 h-20 rounded-t-lg" style={{ background: '#8B4513' }}></div>
          <div className="absolute bottom-16 right-6 w-20 h-20 rounded-full opacity-90" style={{ background: '#4CAF50' }}></div>
          <div className="absolute bottom-20 right-10 w-12 h-12 rounded-full opacity-80" style={{ background: '#66BB6A' }}></div>
          <div className="absolute bottom-14 right-14 w-16 h-16 rounded-full opacity-85" style={{ background: '#4CAF50' }}></div>
        </div>

        {/* Decorative Tree - Far Right Side */}
        <div className="absolute bottom-0 right-48 w-48 h-64 hidden lg:block z-0">
          <div className="absolute bottom-0 right-20 w-6 h-32 rounded-t-lg" style={{ background: '#8B4513' }}></div>
          <div className="absolute bottom-24 right-8 w-32 h-32 rounded-full opacity-90" style={{ background: '#4CAF50' }}></div>
          <div className="absolute bottom-32 right-16 w-20 h-20 rounded-full opacity-80" style={{ background: '#66BB6A' }}></div>
          <div className="absolute bottom-20 right-20 w-24 h-24 rounded-full opacity-85" style={{ background: '#4CAF50' }}></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Company Info */}
            <div className="md:col-span-1">
              <div className="mb-6">
                <Image 
                  src="/logo/logo.png" 
                  alt="HostelVoice Logo" 
                  width={300} 
                  height={60} 
                  className="h-16 w-auto"
                />
              </div>
              
              <div className="space-y-2 text-sm text-gray-600 mb-6">
                <p className="font-semibold text-gray-900 mb-2">Address:</p>
                <p>R V College Of Engineering, Bengaluru</p>
                <p>M S Ramaiah, Bengaluru</p>
                <p>Karnataka, India 560073</p>
              </div>

              <Link href="/contact">
                <Button variant="outline" className="border-2 hover:text-white font-semibold transition-all" style={{ borderColor: '#014b89', color: '#014b89' }} onMouseEnter={(e) => e.currentTarget.style.background = '#014b89'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  Register Now
                </Button>
              </Link>
            </div>

            {/* Products */}
            <div>
              <h4 className="font-bold text-gray-900 mb-4 text-base">Products</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="/hostel-management" className="text-gray-600 hover:text-[#014b89] transition-colors">Hostel Management</Link></li>
                <li><Link href="/mess-management" className="text-gray-600 hover:text-[#014b89] transition-colors">Mess Management</Link></li>
                <li><Link href="/campus-management" className="text-gray-600 hover:text-[#014b89] transition-colors">Campus Management</Link></li>
                <li><Link href="/smart-ids" className="text-gray-600 hover:text-[#014b89] transition-colors">Smart IDs</Link></li>
                <li><Link href="/fee-management" className="text-gray-600 hover:text-[#014b89] transition-colors">Fee Management</Link></li>
              </ul>
            </div>

            {/* Company & Resources */}
            <div>
              <h4 className="font-bold text-gray-900 mb-4 text-base">Company</h4>
              <ul className="space-y-3 text-sm mb-6">
                <li><Link href="/about" className="text-gray-600 hover:text-[#014b89] transition-colors">About Us</Link></li>
                <li><Link href="/contact" className="text-gray-600 hover:text-[#014b89] transition-colors">Contact Us</Link></li>
                <li><Link href="/news" className="text-gray-600 hover:text-[#014b89] transition-colors">News</Link></li>
                <li><Link href="/careers" className="text-gray-600 hover:text-[#014b89] transition-colors">Careers</Link></li>
              </ul>

              <h4 className="font-bold text-gray-900 mb-4 text-base mt-6">Resources</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="/blog" className="text-gray-600 hover:text-[#014b89] transition-colors">Blog</Link></li>
                <li><Link href="/tutorials" className="text-gray-600 hover:text-[#014b89] transition-colors">Tutorials</Link></li>
                <li><Link href="/reports" className="text-gray-600 hover:text-[#014b89] transition-colors">2024 Report</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-bold text-gray-900 mb-4 text-base">Legal</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="/terms" className="text-gray-600 hover:text-[#014b89] transition-colors">Terms & Conditions</Link></li>
                <li><Link href="/privacy" className="text-gray-600 hover:text-[#014b89] transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8">
            <div className="max-w-md mx-auto border-t border-gray-200 pt-6"></div>
            <div className="flex flex-col items-center justify-center gap-6">
              {/* Social Links */}
              <div className="flex items-center gap-4">
                <Link href="https://twitter.com" target="_blank" className="text-gray-400 hover:text-[#014b89] transition-colors">
                  <Twitter className="w-5 h-5" />
                </Link>
                <Link href="https://linkedin.com" target="_blank" className="text-gray-400 hover:text-[#014b89] transition-colors">
                  <Linkedin className="w-5 h-5" />
                </Link>
                <Link href="https://facebook.com" target="_blank" className="text-gray-400 hover:text-[#014b89] transition-colors">
                  <Facebook className="w-5 h-5" />
                </Link>
                <Link href="https://instagram.com" target="_blank" className="text-gray-400 hover:text-[#f26918] transition-colors">
                  <Instagram className="w-5 h-5" />
                </Link>
                <Link href="https://youtube.com" target="_blank" className="text-gray-400 hover:text-[#f26918] transition-colors">
                  <Youtube className="w-5 h-5" />
                </Link>
              </div>

              {/* Copyright */}
              <p className="text-sm text-gray-600">© 2025 HostelVoice. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
