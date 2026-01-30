'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { adminApi } from '@/lib/api'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, X, Clock, User, Mail, Phone, Building, Loader2, AlertCircle, CheckCircle, UserCheck, Shield } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Textarea } from "@/components/ui/textarea"

interface PendingUser {
  id: string
  email: string
  full_name: string
  role: 'student' | 'caretaker'
  student_id?: string
  caretaker_id?: string
  hostel_name?: string
  room_number?: string
  phone_number?: string
  department?: string
  created_at: string
}

export default function UserApprovalsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [selectedUser, setSelectedUser] = useState<PendingUser | null>(null)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/dashboard')
    }
  }, [user, router])

  // Fetch pending users
  const fetchPendingUsers = async () => {
    setIsLoading(true)
    try {
      const response = await adminApi.getPendingUsers()
      setPendingUsers((response.data as PendingUser[]) || [])
    } catch (error) {
      console.error('Error fetching pending users:', error)
      toast({
        title: "Error",
        description: "Failed to load pending registrations.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchPendingUsers()
    }
  }, [user])

  const handleApprove = async (userId: string, userName: string) => {
    setActionLoading(userId)
    
    toast({
      title: "Processing...",
      description: "Approving user account...",
    })

    try {
      await adminApi.approveUser(userId)

      toast({
        title: "User Approved! ✅",
        description: `${userName} can now log in and access the system.`,
      })

      await fetchPendingUsers()
    } catch (error) {
      console.error('Error approving user:', error)
      toast({
        title: "Approval Failed",
        description: "Failed to approve user. Please try again.",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleRejectClick = (user: PendingUser) => {
    setSelectedUser(user)
    setShowRejectDialog(true)
    setRejectionReason('')
  }

  const handleRejectConfirm = async () => {
    if (!selectedUser) return
    
    setActionLoading(selectedUser.id)
    
    toast({
      title: "Processing...",
      description: "Rejecting user registration...",
    })

    try {
      await adminApi.rejectUser(selectedUser.id, rejectionReason || 'Registration declined by administrator')

      toast({
        title: "Registration Rejected",
        description: `${selectedUser.full_name}'s registration has been declined.`,
      })

      await fetchPendingUsers()
      setShowRejectDialog(false)
      setSelectedUser(null)
    } catch (error) {
      console.error('Error rejecting user:', error)
      toast({
        title: "Rejection Failed",
        description: "Failed to reject user. Please try again.",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50 flex items-center justify-center p-4 sm:p-8">
        <div className="text-center max-w-md bg-white/80 backdrop-blur-xl rounded-3xl p-8 border-2 border-gray-100 shadow-2xl">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
            <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10" style={{ color: '#ef4444' }} />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold mb-2" style={{ color: '#014b89' }}>Access Denied</h2>
          <p className="text-sm sm:text-base text-gray-600">Only administrators can access this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .animate-fade-in { animation: fadeIn 0.6s ease-out; }
        .animate-slide-in { animation: slideIn 0.6s ease-out; }
        .animate-pulse-slow { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
      `}</style>

      {/* Background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(1, 75, 137, 0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(1, 75, 137, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-4 sm:pt-6 md:pt-12 pb-12 sm:pb-16 md:pb-24 relative z-10">
        {/* Header */}
        <div className="mb-6 sm:mb-8 md:mb-12 animate-fade-in">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #014b89 0%, #0369a1 100%)' }}>
              <UserCheck className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold" style={{ color: '#014b89' }}>
                User Approvals
              </h1>
            </div>
          </div>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 ml-0 sm:ml-[68px]">
            Review and approve pending registrations
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 md:gap-6 mb-6 sm:mb-8 md:mb-10">
          {[
            { 
              label: 'Pending Approvals', 
              value: pendingUsers.length, 
              icon: Clock, 
              color: '#eab308', 
              bgColor: 'rgba(234, 179, 8, 0.1)',
              trend: 'Waiting'
            },
            { 
              label: 'Students', 
              value: pendingUsers.filter(u => u.role === 'student').length, 
              icon: User, 
              color: '#10b981', 
              bgColor: 'rgba(16, 185, 129, 0.1)',
              trend: 'Student'
            },
            { 
              label: 'Caretakers', 
              value: pendingUsers.filter(u => u.role === 'caretaker').length, 
              icon: Shield, 
              color: '#f26918', 
              bgColor: 'rgba(242, 105, 24, 0.1)',
              trend: 'Staff'
            }
          ].map((stat, i) => {
            const Icon = stat.icon
            return (
              <div
                key={stat.label}
                className="bg-white border-2 border-gray-100 rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-7 hover:border-gray-200 hover:shadow-xl transition-all duration-300 animate-slide-in"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div 
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shadow-lg"
                    style={{ background: stat.bgColor }}
                  >
                    <Icon className="w-7 h-7 sm:w-8 sm:h-8" style={{ color: stat.color }} />
                  </div>
                  <div className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: stat.bgColor, color: stat.color }}>
                    {stat.trend}
                  </div>
                </div>
                <p className="text-xs sm:text-sm font-bold text-gray-500 mb-2 uppercase tracking-wider">{stat.label}</p>
                <p className="text-4xl sm:text-5xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
              </div>
            )
          })}
        </div>

        {/* Pending Users List */}
        {isLoading ? (
          <div className="bg-white border-2 border-gray-100 rounded-2xl sm:rounded-3xl p-8 sm:p-12 shadow-lg">
            <div className="flex flex-col items-center justify-center">
              <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 animate-spin mb-4" style={{ color: '#014b89' }} />
              <span className="text-sm sm:text-base text-gray-600">Loading pending registrations...</span>
            </div>
          </div>
        ) : pendingUsers.length === 0 ? (
          <div className="bg-white border-2 border-gray-100 rounded-2xl sm:rounded-3xl p-8 sm:p-12 shadow-lg animate-fade-in">
            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
                <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10" style={{ color: '#10b981' }} />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-2" style={{ color: '#014b89' }}>All Caught Up!</h3>
              <p className="text-sm sm:text-base text-gray-600">No pending registrations at the moment.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-5">
            {pendingUsers.map((pendingUser, index) => (
              <div
                key={pendingUser.id}
                className="bg-white border-2 border-gray-100 rounded-2xl sm:rounded-3xl overflow-hidden hover:shadow-xl transition-all duration-300 animate-slide-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="p-5 sm:p-6 md:p-7 border-b-2 border-gray-100">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                        <h3 className="text-lg sm:text-xl font-bold break-words" style={{ color: '#014b89' }}>
                          {pendingUser.full_name}
                        </h3>
                        <Badge 
                          className="text-xs font-bold px-3 py-1 border-2 whitespace-nowrap"
                          style={{
                            background: pendingUser.role === 'student' 
                              ? 'rgba(16, 185, 129, 0.1)' 
                              : 'rgba(242, 105, 24, 0.1)',
                            color: pendingUser.role === 'student' ? '#10b981' : '#f26918',
                            borderColor: pendingUser.role === 'student' 
                              ? 'rgba(16, 185, 129, 0.3)' 
                              : 'rgba(242, 105, 24, 0.3)'
                          }}
                        >
                          {pendingUser.role === 'student' ? '🎓 Student' : '🛡️ Caretaker'}
                        </Badge>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 flex items-center gap-2">
                        <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                        Registered {new Date(pendingUser.created_at).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })} at{' '}
                        {new Date(pendingUser.created_at).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div className="flex gap-2 sm:gap-3">
                      <Button
                        onClick={() => handleApprove(pendingUser.id, pendingUser.full_name)}
                        disabled={actionLoading === pendingUser.id}
                        className="flex-1 sm:flex-none font-bold h-10 sm:h-11 text-xs sm:text-sm rounded-xl text-white px-4 sm:px-6"
                        style={{ background: '#10b981' }}
                      >
                        {actionLoading === pendingUser.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Check className="w-4 h-4 mr-2" />
                            <span className="hidden sm:inline">Approve</span>
                            <span className="sm:hidden">✓</span>
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => handleRejectClick(pendingUser)}
                        disabled={actionLoading === pendingUser.id}
                        className="flex-1 sm:flex-none font-bold h-10 sm:h-11 text-xs sm:text-sm rounded-xl text-white px-4 sm:px-6"
                        style={{ background: '#ef4444' }}
                      >
                        <X className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">Reject</span>
                        <span className="sm:hidden">✗</span>
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="p-5 sm:p-6 md:p-7">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(1, 75, 137, 0.1)' }}>
                        <Mail className="w-4 h-4" style={{ color: '#014b89' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-500 mb-1">Email</p>
                        <p className="text-sm text-gray-900 break-all">{pendingUser.email}</p>
                      </div>
                    </div>

                    {pendingUser.phone_number && (
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
                          <Phone className="w-4 h-4" style={{ color: '#10b981' }} />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-bold text-gray-500 mb-1">Phone</p>
                          <p className="text-sm text-gray-900">{pendingUser.phone_number}</p>
                        </div>
                      </div>
                    )}

                    {pendingUser.hostel_name && (
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(242, 105, 24, 0.1)' }}>
                          <Building className="w-4 h-4" style={{ color: '#f26918' }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-gray-500 mb-1">Hostel</p>
                          <p className="text-sm text-gray-900 break-words">
                            {pendingUser.hostel_name}
                            {pendingUser.room_number && ` - Room ${pendingUser.room_number}`}
                          </p>
                        </div>
                      </div>
                    )}

                    {pendingUser.student_id && (
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
                          <User className="w-4 h-4" style={{ color: '#10b981' }} />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-bold text-gray-500 mb-1">Student ID</p>
                          <p className="text-sm text-gray-900">{pendingUser.student_id}</p>
                        </div>
                      </div>
                    )}

                    {pendingUser.caretaker_id && (
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(242, 105, 24, 0.1)' }}>
                          <Shield className="w-4 h-4" style={{ color: '#f26918' }} />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-bold text-gray-500 mb-1">Caretaker ID</p>
                          <p className="text-sm text-gray-900">{pendingUser.caretaker_id}</p>
                        </div>
                      </div>
                    )}

                    {pendingUser.department && (
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(1, 75, 137, 0.1)' }}>
                          <Building className="w-4 h-4" style={{ color: '#014b89' }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-gray-500 mb-1">Department</p>
                          <p className="text-sm text-gray-900 break-words">{pendingUser.department}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rejection Dialog */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent className="w-[calc(100%-2rem)] max-w-lg mx-auto max-h-[90vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg sm:text-xl font-bold" style={{ color: '#014b89' }}>
              Reject Registration
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm sm:text-base text-gray-600">
              Are you sure you want to reject <strong>{selectedUser?.full_name}'s</strong> registration?
              <br />
              Please provide a reason (optional):
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            placeholder="Enter rejection reason (e.g., Invalid credentials, Duplicate registration, etc.)..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            className="my-4 text-sm sm:text-base border-2 rounded-xl resize-none"
            rows={4}
          />
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel 
              onClick={() => setSelectedUser(null)}
              className="w-full sm:w-auto border-2 h-10 sm:h-11 text-sm sm:text-base rounded-xl"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRejectConfirm}
              className="w-full sm:w-auto font-bold h-10 sm:h-11 text-sm sm:text-base rounded-xl text-white"
              style={{ background: '#ef4444' }}
            >
              Reject Registration
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
