'use client'

import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Settings, Plus, Trash2, Edit, Building2, Shield, Loader2, RefreshCw, AlertCircle } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { adminApi, analyticsApi } from '@/lib/api'
import { toast } from 'sonner'

interface Hostel {
  name: string
  student_count: number
}

interface Caretaker {
  id: string
  full_name: string
  email: string
  hostel_name: string
  phone_number: string
  created_at: string
  approval_status: string
}

export default function ManagementPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hostels, setHostels] = useState<Hostel[]>([])
  const [caretakers, setCaretakers] = useState<Caretaker[]>([])
  const [stats, setStats] = useState({
    totalHostels: 0,
    totalCapacity: 0,
    currentOccupancy: 0,
    occupancyRate: 0
  })

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch hostels and caretakers in parallel
      const [hostelsRes, caretakersRes, dashboardRes] = await Promise.all([
        adminApi.getHostels(),
        adminApi.getAllUsers({ role: 'caretaker', limit: 100 }),
        analyticsApi.getDashboard()
      ])

      const hostelData = hostelsRes.data || []
      setHostels(hostelData)

      const caretakerData = (caretakersRes.data || []) as unknown as Caretaker[]
      setCaretakers(caretakerData)

      // Calculate stats from dashboard data
      const dashboard = dashboardRes.data
      const totalStudents = dashboard?.totalStudents || 0
      const totalHostels = hostelData.length

      setStats({
        totalHostels,
        totalCapacity: totalStudents + Math.round(totalStudents * 0.1), // Estimate capacity as current + 10%
        currentOccupancy: totalStudents,
        occupancyRate: totalStudents > 0 ? 90 : 0 // Placeholder
      })

    } catch (err: any) {
      console.error('Error fetching management data:', err)
      setError(err.message || 'Failed to load management data')
      toast.error('Failed to load management data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (!user) return null

  if (user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-8">
        <div className="max-w-md w-full rounded-3xl p-8 border-2 shadow-xl" style={{ borderColor: 'rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.05)' }}>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(239, 68, 68, 0.15)' }}>
              <AlertCircle className="w-6 h-6" style={{ color: '#ef4444' }} />
            </div>
            <div>
              <h3 className="font-bold text-xl text-gray-900 mb-2">Access Denied</h3>
              <p className="text-gray-700 leading-relaxed">Only administrators can access system management.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.6s ease-out;
        }
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

      <div className="max-w-7xl mx-auto px-4 pt-6 pb-24 md:px-8 md:pt-12 md:pb-12 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 md:mb-12 animate-fade-in">
          <div>
            <h1 className="text-3xl md:text-5xl font-bold mb-2" style={{ color: '#014b89' }}>
              System Management
            </h1>
            <p className="text-base md:text-lg text-gray-600">Manage hostels, caretakers, and system settings</p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={fetchData}
              disabled={loading}
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-8 p-4 rounded-xl border-2 border-red-200 bg-red-50 text-red-700">
            <p className="font-medium">{error}</p>
            <button onClick={fetchData} className="text-sm underline mt-2">Try again</button>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin" style={{ color: '#014b89' }} />
          </div>
        ) : (
          <>
            {/* Overall Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12">
              {[
                { label: 'Total Hostels', value: stats.totalHostels, color: '#014b89' },
                { label: 'Total Students', value: stats.currentOccupancy, color: '#f26918' },
                { label: 'Caretakers', value: caretakers.length, color: '#014b89' },
                { label: 'Active Users', value: stats.currentOccupancy + caretakers.length, color: '#10b981' }
              ].map((stat, i) => (
                <div 
                  key={stat.label} 
                  className="bg-white border-2 border-gray-100 rounded-2xl p-5 md:p-6 hover:shadow-xl transition-all animate-fade-in"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <p className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">{stat.label}</p>
                  <p className="text-3xl md:text-4xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Hostels Management */}
            <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 md:p-8 shadow-lg mb-8 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 flex items-center gap-3" style={{ color: '#014b89' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(1, 75, 137, 0.1)' }}>
                  <Building2 className="w-5 h-5" style={{ color: '#014b89' }} />
                </div>
                Hostels ({hostels.length})
              </h2>
              {hostels.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No hostels found</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-gray-200">
                        <th className="px-4 py-4 text-left font-bold text-gray-600 uppercase tracking-wide text-sm">Hostel Name</th>
                        <th className="px-4 py-4 text-left font-bold text-gray-600 uppercase tracking-wide text-sm">Students</th>
                        <th className="px-4 py-4 text-left font-bold text-gray-600 uppercase tracking-wide text-sm">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {hostels.map((hostel, idx) => (
                        <tr key={hostel.name} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-4 font-bold text-gray-900">{hostel.name}</td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-24 h-3 rounded-full bg-gray-100 overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all duration-500"
                                  style={{ 
                                    width: `${Math.min(100, (hostel.student_count / Math.max(...hostels.map(h => h.student_count))) * 100)}%`,
                                    background: 'linear-gradient(to right, #014b89, #0369a1)'
                                  }}
                                />
                              </div>
                              <span className="text-sm font-bold text-gray-700">{hostel.student_count}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span className="px-3 py-1.5 rounded-lg text-xs font-bold border-2" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
                              active
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Caretakers Management */}
            <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 md:p-8 shadow-lg mb-8 animate-fade-in" style={{ animationDelay: '0.5s' }}>
              <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 flex items-center gap-3" style={{ color: '#014b89' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(242, 105, 24, 0.1)' }}>
                  <Shield className="w-5 h-5" style={{ color: '#f26918' }} />
                </div>
                Caretakers ({caretakers.length})
              </h2>
              {caretakers.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No caretakers found</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-gray-200">
                        <th className="px-4 py-4 text-left font-bold text-gray-600 uppercase tracking-wide text-sm">Name</th>
                        <th className="px-4 py-4 text-left font-bold text-gray-600 uppercase tracking-wide text-sm">Email</th>
                        <th className="px-4 py-4 text-left font-bold text-gray-600 uppercase tracking-wide text-sm">Assigned Hostel</th>
                        <th className="px-4 py-4 text-left font-bold text-gray-600 uppercase tracking-wide text-sm">Phone</th>
                        <th className="px-4 py-4 text-left font-bold text-gray-600 uppercase tracking-wide text-sm">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {caretakers.map((caretaker) => (
                        <tr key={caretaker.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-4 font-bold text-gray-900">{caretaker.full_name}</td>
                          <td className="px-4 py-4 text-gray-600">{caretaker.email}</td>
                          <td className="px-4 py-4 font-medium text-gray-700">{caretaker.hostel_name || 'Not assigned'}</td>
                          <td className="px-4 py-4 text-gray-600">{caretaker.phone_number || 'N/A'}</td>
                          <td className="px-4 py-4">
                            <span 
                              className="px-3 py-1.5 rounded-lg text-xs font-bold border-2" 
                              style={caretaker.approval_status === 'approved' 
                                ? { background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.3)' }
                                : { background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', borderColor: 'rgba(245, 158, 11, 0.3)' }
                              }
                            >
                              {caretaker.approval_status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* System Settings */}
            <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 md:p-8 shadow-lg animate-fade-in" style={{ animationDelay: '0.6s' }}>
              <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 flex items-center gap-3" style={{ color: '#014b89' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(1, 75, 137, 0.1)' }}>
                  <Settings className="w-5 h-5" style={{ color: '#014b89' }} />
                </div>
                System Settings
              </h2>
              <div className="space-y-4">
                {[
                  { title: 'Maintenance Mode', desc: 'Temporarily disable system access', enabled: false },
                  { title: 'Auto-Backup', desc: 'Daily database backups', enabled: true },
                  { title: 'Email Notifications', desc: 'Send alerts for critical issues', enabled: true },
                  { title: 'Issue Auto-Assignment', desc: 'Automatically assign issues to caretakers', enabled: false }
                ].map((setting, i) => (
                  <div 
                    key={setting.title} 
                    className="flex items-center justify-between p-5 md:p-6 rounded-xl bg-gray-50 border-2 border-gray-100 hover:border-gray-200 transition-all"
                  >
                    <div>
                      <p className="font-bold text-gray-900 mb-1">{setting.title}</p>
                      <p className="text-sm text-gray-600">{setting.desc}</p>
                    </div>
                    <button 
                      className="px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm hover:shadow-md"
                      style={{
                        background: setting.enabled ? '#10b981' : '#e5e7eb',
                        color: setting.enabled ? 'white' : '#6b7280'
                      }}
                    >
                      {setting.enabled ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
