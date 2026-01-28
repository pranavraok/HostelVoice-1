'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/auth-context'
import { residentsApi, ApiError } from '@/lib/api'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Users, Phone, Mail, MapPin, Loader2, RefreshCw, User } from 'lucide-react'
import { toast } from 'sonner'

// Interface for user data from backend
interface UserData {
  id: string
  full_name: string
  email: string
  phone_number: string
  hostel_name: string
  room_number: string
  student_id?: string
  approval_status: string
  created_at: string
}

export default function ResidentsPage() {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all')
  const [residents, setResidents] = useState<UserData[]>([])
  const [myProfile, setMyProfile] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchResidents = useCallback(async () => {
    if (!user) return
    setIsLoading(true)
    setError(null)

    try {
      const response = await residentsApi.getAll(1, 1000)
      
      if (user.role === 'student') {
        if (response.data && response.data.length > 0) {
          setMyProfile(response.data[0] as unknown as UserData)
        }
      } else {
        if (response.data) {
          setResidents(response.data as unknown as UserData[])
        }
      }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to load data'
      setError(message)
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchResidents()
  }, [fetchResidents])

  const filteredResidents = residents.filter((resident) => {
    const matchesSearch = searchQuery === '' ||
      resident.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resident.room_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resident.email?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && resident.approval_status === 'approved') ||
      (filterStatus === 'inactive' && resident.approval_status === 'pending')

    return matchesSearch && matchesStatus
  })

  const stats = [
    { label: 'Total Residents', value: residents.length, color: '#014b89' },
    { label: 'Approved', value: residents.filter(r => r.approval_status === 'approved').length, color: '#10b981' },
    { label: 'Pending', value: residents.filter(r => r.approval_status === 'pending').length, color: '#f26918' },
    { label: 'Hostels', value: new Set(residents.map(r => r.hostel_name).filter(Boolean)).size, color: '#6b7280' }
  ]

  if (!user) return null

  // Student view - show only their profile (Mobile Optimized)
  if (user.role === 'student') {
    return (
      <div className="min-h-screen bg-white relative overflow-hidden">
        <style jsx>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in { animation: fadeIn 0.6s ease-out; }
        `}</style>

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

        <div className="max-w-3xl mx-auto px-4 sm:px-6 md:px-8 pt-4 sm:pt-6 md:pt-12 pb-12 sm:pb-16 md:pb-24 relative z-10">
          <div className="flex items-center justify-between gap-3 mb-6 sm:mb-8">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-1 sm:mb-2 break-words" style={{ color: '#014b89' }}>
                My Profile
              </h1>
              <p className="text-sm sm:text-base md:text-lg text-gray-600">Your hostel registration details</p>
            </div>
            <Button
              onClick={fetchResidents}
              variant="outline"
              className="gap-2 h-10 sm:h-12 rounded-xl font-semibold border-2 px-3 sm:px-4 flex-shrink-0"
              style={{ borderColor: '#014b89', color: '#014b89' }}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>

          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12 sm:py-16 md:py-20">
              <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 animate-spin mb-4" style={{ color: '#014b89' }} />
              <p className="text-sm sm:text-base text-gray-600 font-medium">Loading profile...</p>
            </div>
          )}

          {error && !isLoading && (
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 sm:p-8 text-center">
              <User className="w-10 h-10 sm:w-12 sm:h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg sm:text-xl font-bold text-red-700 mb-2">Failed to Load Profile</h3>
              <p className="text-sm sm:text-base text-red-600 mb-4 break-words">{error}</p>
              <Button onClick={fetchResidents} className="bg-red-600 hover:bg-red-700 text-white h-10 sm:h-11 text-sm sm:text-base">
                Try Again
              </Button>
            </div>
          )}

          {!isLoading && !error && myProfile && (
            <div className="bg-white border-2 border-gray-200 rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 shadow-lg animate-fade-in">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 mb-6 sm:mb-8">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-2xl sm:text-3xl font-bold text-white flex-shrink-0" style={{ background: '#014b89' }}>
                  {myProfile.full_name?.charAt(0) || 'U'}
                </div>
                <div className="text-center sm:text-left">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 break-words">{myProfile.full_name}</h2>
                  <p className="text-sm sm:text-base text-gray-600">Student</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:gap-6">
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-start gap-3 p-3 sm:p-0">
                    <Mail className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0" style={{ color: '#f26918' }} />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm text-gray-500 mb-1">Email</p>
                      <p className="text-sm sm:text-base font-semibold break-all">{myProfile.email}</p>
                    </div>
                  </div>
                  {myProfile.phone_number && (
                    <div className="flex items-start gap-3 p-3 sm:p-0">
                      <Phone className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0" style={{ color: '#014b89' }} />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm text-gray-500 mb-1">Phone</p>
                        <p className="text-sm sm:text-base font-semibold">{myProfile.phone_number}</p>
                      </div>
                    </div>
                  )}
                  {myProfile.room_number && (
                    <div className="flex items-start gap-3 p-3 sm:p-0">
                      <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0" style={{ color: '#10b981' }} />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm text-gray-500 mb-1">Room</p>
                        <p className="text-sm sm:text-base font-semibold">{myProfile.room_number}</p>
                      </div>
                    </div>
                  )}
                  {myProfile.hostel_name && (
                    <div className="flex items-start gap-3 p-3 sm:p-0">
                      <Users className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0" style={{ color: '#a855f7' }} />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs sm:text-sm text-gray-500 mb-1">Hostel</p>
                        <p className="text-sm sm:text-base font-semibold break-words">{myProfile.hostel_name}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t-2 border-gray-100">
                <span 
                  className="inline-block px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold border-2"
                  style={
                    myProfile.approval_status === 'approved'
                      ? { background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.3)' }
                      : { background: 'rgba(242, 105, 24, 0.1)', color: '#f26918', borderColor: 'rgba(242, 105, 24, 0.3)' }
                  }
                >
                  {myProfile.approval_status === 'approved' ? '✓ Approved' : '⏳ Pending Approval'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Staff view - show all residents (Mobile Optimized)
  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fadeIn 0.6s ease-out; }
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
        {/* Header - Mobile Optimized */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-6 sm:mb-8 md:mb-12 animate-fade-in">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-1 sm:mb-2" style={{ color: '#014b89' }}>
              Residents Management
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-gray-600">View and manage hostel residents</p>
          </div>
          <Button
            onClick={fetchResidents}
            variant="outline"
            className="gap-2 h-10 sm:h-12 rounded-xl font-semibold border-2 text-sm sm:text-base"
            style={{ borderColor: '#014b89', color: '#014b89' }}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Stats - Mobile Optimized */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8 md:mb-12">
          {stats.map((stat, i) => (
            <div 
              key={stat.label} 
              className="bg-white border-2 border-gray-100 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 hover:shadow-xl transition-all animate-fade-in"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <p className="text-[10px] sm:text-xs md:text-sm font-semibold text-gray-600 mb-1 sm:mb-2 uppercase tracking-wide">{stat.label}</p>
              <p className="text-2xl sm:text-3xl md:text-4xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Search and Filter - Mobile Optimized */}
        {!isLoading && !error && (
        <>
        <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by name, room, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 sm:pl-12 border-2 border-gray-200 focus:border-[#014b89] focus:ring-[#014b89] rounded-xl h-11 sm:h-12 text-sm sm:text-base"
            />
          </div>

          {/* Filter */}
          <div className="flex gap-2 sm:gap-3 flex-wrap">
            {(['all', 'active', 'inactive'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className="px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-all border-2 flex-1 sm:flex-none"
                style={{
                  background: filterStatus === status ? '#014b89' : '#f9fafb',
                  color: filterStatus === status ? 'white' : '#6b7280',
                  borderColor: filterStatus === status ? '#014b89' : '#e5e7eb'
                }}
              >
                {status === 'all' ? 'All' : status === 'active' ? 'Approved' : 'Pending'}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="block lg:hidden space-y-3 sm:space-y-4">
          {filteredResidents.map((resident) => (
            <div
              key={resident.id}
              className="bg-white border-2 border-gray-100 rounded-xl p-4 hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 text-base sm:text-lg mb-1 break-words">{resident.full_name}</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" style={{ color: '#014b89' }} />
                    <span className="text-xs sm:text-sm font-medium text-gray-700">{resident.room_number || '-'}</span>
                  </div>
                </div>
                <span 
                  className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-bold border-2 flex-shrink-0"
                  style={
                    resident.approval_status === 'approved'
                      ? { background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.3)' }
                      : { background: 'rgba(242, 105, 24, 0.1)', color: '#f26918', borderColor: 'rgba(242, 105, 24, 0.3)' }
                  }
                >
                  {resident.approval_status === 'approved' ? '✓' : '⏳'}
                </span>
              </div>

              <div className="space-y-2 text-xs sm:text-sm">
                <div className="flex items-start gap-2">
                  <Mail className="w-3 h-3 sm:w-4 sm:h-4 mt-0.5 flex-shrink-0" style={{ color: '#f26918' }} />
                  <a
                    href={`mailto:${resident.email}`}
                    className="font-medium hover:underline break-all flex-1"
                    style={{ color: '#014b89' }}
                  >
                    {resident.email}
                  </a>
                </div>
                {resident.phone_number && (
                  <div className="flex items-center gap-2 text-gray-600 font-medium">
                    <Phone className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    {resident.phone_number}
                  </div>
                )}
                <div className="flex items-start gap-2 text-gray-700 font-medium">
                  <Users className="w-3 h-3 sm:w-4 sm:h-4 mt-0.5 flex-shrink-0" />
                  <span className="break-words flex-1">{resident.hostel_name || '-'}</span>
                </div>
                {resident.student_id && (
                  <div className="pt-2">
                    <span className="inline-block px-2 sm:px-3 py-1 rounded-lg text-[10px] sm:text-xs font-bold border-2" style={{ background: 'rgba(1, 75, 137, 0.1)', color: '#014b89', borderColor: 'rgba(1, 75, 137, 0.3)' }}>
                      ID: {resident.student_id}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block bg-white border-2 border-gray-100 rounded-2xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-600 uppercase tracking-wide">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-600 uppercase tracking-wide">Room</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-600 uppercase tracking-wide">Contact</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-600 uppercase tracking-wide">Hostel</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-600 uppercase tracking-wide">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-600 uppercase tracking-wide">Student ID</th>
                </tr>
              </thead>
              <tbody>
                {filteredResidents.map((resident) => (
                  <tr
                    key={resident.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-5">
                      <p className="font-bold text-gray-900">{resident.full_name}</p>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(1, 75, 137, 0.1)' }}>
                          <MapPin className="w-4 h-4" style={{ color: '#014b89' }} />
                        </div>
                        <span className="text-sm font-bold text-gray-900">{resident.room_number || '-'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="w-4 h-4" style={{ color: '#f26918' }} />
                          <a
                            href={`mailto:${resident.email}`}
                            className="font-medium hover:underline"
                            style={{ color: '#014b89' }}
                          >
                            {resident.email}
                          </a>
                        </div>
                        {resident.phone_number && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                            <Phone className="w-4 h-4" />
                            {resident.phone_number}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm font-medium text-gray-700">
                      {resident.hostel_name || '-'}
                    </td>
                    <td className="px-6 py-5">
                      <span 
                        className="px-3 py-1.5 rounded-xl text-xs font-bold border-2"
                        style={
                          resident.approval_status === 'approved'
                            ? { background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.3)' }
                            : { background: 'rgba(242, 105, 24, 0.1)', color: '#f26918', borderColor: 'rgba(242, 105, 24, 0.3)' }
                        }
                      >
                        {resident.approval_status === 'approved' ? '✓ Approved' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      {resident.student_id ? (
                        <span className="px-3 py-1.5 rounded-xl text-xs font-bold border-2" style={{ background: 'rgba(1, 75, 137, 0.1)', color: '#014b89', borderColor: 'rgba(1, 75, 137, 0.3)' }}>
                          {resident.student_id}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-500 font-medium">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Empty State - Mobile Optimized */}
        {filteredResidents.length === 0 && (
          <div className="bg-white border-2 border-gray-200 rounded-2xl sm:rounded-3xl p-8 sm:p-12 md:p-16 text-center shadow-lg mt-6 sm:mt-8">
            <div 
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full mx-auto mb-4 sm:mb-6 flex items-center justify-center"
              style={{ background: 'rgba(1, 75, 137, 0.1)' }}
            >
              <Users className="w-8 h-8 sm:w-10 sm:h-10" style={{ color: '#014b89' }} />
            </div>
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">No residents found</h3>
            <p className="text-sm sm:text-base text-gray-600 max-w-md mx-auto">
              No residents match your search criteria. Try adjusting your filters or search terms.
            </p>
          </div>
        )}
        </>
        )}

        {/* Loading State - Mobile Optimized */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12 sm:py-16 md:py-20">
            <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 animate-spin mb-4" style={{ color: '#014b89' }} />
            <p className="text-sm sm:text-base text-gray-600 font-medium">Loading residents...</p>
          </div>
        )}

        {/* Error State - Mobile Optimized */}
        {error && !isLoading && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 sm:p-8 text-center">
            <Users className="w-10 h-10 sm:w-12 sm:h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-bold text-red-700 mb-2">Failed to Load Residents</h3>
            <p className="text-sm sm:text-base text-red-600 mb-4 break-words">{error}</p>
            <Button onClick={fetchResidents} className="bg-red-600 hover:bg-red-700 text-white h-10 sm:h-11 text-sm sm:text-base">
              Try Again
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
