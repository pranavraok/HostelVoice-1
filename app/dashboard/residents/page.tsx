'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Input } from '@/components/ui/input'
import { Search, Users, Phone, Mail, MapPin } from 'lucide-react'

interface Resident {
  id: string
  name: string
  email: string
  phone: string
  room: string
  floor: string
  checkInDate: string
  status: 'active' | 'inactive'
  issues: number
}

export default function ResidentsPage() {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all')

  const [residents] = useState<Resident[]>([
    {
      id: '1',
      name: 'Arjun Singh',
      email: 'arjun@college.edu',
      phone: '+91-9876543210',
      room: 'A-203',
      floor: '2',
      checkInDate: '2024-08-15',
      status: 'active',
      issues: 2
    },
    {
      id: '2',
      name: 'John Doe',
      email: 'john@college.edu',
      phone: '+91-9876543211',
      room: 'B-105',
      floor: '1',
      checkInDate: '2024-08-20',
      status: 'active',
      issues: 1
    },
    {
      id: '3',
      name: 'Sarah Smith',
      email: 'sarah@college.edu',
      phone: '+91-9876543212',
      room: 'C-302',
      floor: '3',
      checkInDate: '2024-09-01',
      status: 'active',
      issues: 0
    },
    {
      id: '4',
      name: 'Michael Chen',
      email: 'michael@college.edu',
      phone: '+91-9876543213',
      room: 'A-105',
      floor: '1',
      checkInDate: '2024-08-10',
      status: 'inactive',
      issues: 0
    },
    {
      id: '5',
      name: 'Emma Wilson',
      email: 'emma@college.edu',
      phone: '+91-9876543214',
      room: 'B-201',
      floor: '2',
      checkInDate: '2024-08-25',
      status: 'active',
      issues: 1
    },
    {
      id: '6',
      name: 'David Brown',
      email: 'david@college.edu',
      phone: '+91-9876543215',
      room: 'C-401',
      floor: '4',
      checkInDate: '2024-09-05',
      status: 'active',
      issues: 0
    }
  ])

  const filteredResidents = residents.filter((resident) => {
    const matchesSearch = searchQuery === '' ||
      resident.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resident.room.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resident.email.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = filterStatus === 'all' || resident.status === filterStatus

    return matchesSearch && matchesStatus
  })

  const stats = [
    { label: 'Total Residents', value: residents.length, color: '#014b89' },
    { label: 'Active', value: residents.filter(r => r.status === 'active').length, color: '#10b981' },
    { label: 'Inactive', value: residents.filter(r => r.status === 'inactive').length, color: '#6b7280' },
    { label: 'Pending Issues', value: residents.reduce((sum, r) => sum + r.issues, 0), color: '#f26918' }
  ]

  if (!user) return null

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
        <div className="mb-8 md:mb-12 animate-fade-in">
          <h1 className="text-3xl md:text-5xl font-bold mb-2" style={{ color: '#014b89' }}>
            Residents Management
          </h1>
          <p className="text-base md:text-lg text-gray-600">View and manage hostel residents</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12">
          {stats.map((stat, i) => (
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

        {/* Search and Filter */}
        <div className="space-y-4 mb-8">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by name, room, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 border-2 border-gray-200 focus:border-[#014b89] focus:ring-[#014b89] rounded-xl h-12"
            />
          </div>

          {/* Filter */}
          <div className="flex gap-3 flex-wrap">
            {(['all', 'active', 'inactive'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className="px-6 py-3 rounded-xl text-sm font-bold transition-all border-2"
                style={{
                  background: filterStatus === status ? '#014b89' : '#f9fafb',
                  color: filterStatus === status ? 'white' : '#6b7280',
                  borderColor: filterStatus === status ? '#014b89' : '#e5e7eb'
                }}
              >
                {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Residents Table */}
        <div className="bg-white border-2 border-gray-100 rounded-2xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-600 uppercase tracking-wide">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-600 uppercase tracking-wide">Room</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-600 uppercase tracking-wide">Contact</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-600 uppercase tracking-wide">Check-in</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-600 uppercase tracking-wide">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-600 uppercase tracking-wide">Issues</th>
                </tr>
              </thead>
              <tbody>
                {filteredResidents.map((resident) => (
                  <tr
                    key={resident.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-5">
                      <p className="font-bold text-gray-900">{resident.name}</p>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(1, 75, 137, 0.1)' }}>
                          <MapPin className="w-4 h-4" style={{ color: '#014b89' }} />
                        </div>
                        <span className="text-sm font-bold text-gray-900">{resident.room}</span>
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
                        <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                          <Phone className="w-4 h-4" />
                          {resident.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm font-medium text-gray-700">
                      {new Date(resident.checkInDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-6 py-5">
                      <span 
                        className="px-3 py-1.5 rounded-xl text-xs font-bold border-2"
                        style={
                          resident.status === 'active'
                            ? { background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.3)' }
                            : { background: 'rgba(107, 114, 128, 0.1)', color: '#6b7280', borderColor: 'rgba(107, 114, 128, 0.3)' }
                        }
                      >
                        {resident.status === 'active' ? '✓ Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      {resident.issues > 0 ? (
                        <span className="px-3 py-1.5 rounded-xl text-xs font-bold border-2" style={{ background: 'rgba(242, 105, 24, 0.1)', color: '#f26918', borderColor: 'rgba(242, 105, 24, 0.3)' }}>
                          {resident.issues} open
                        </span>
                      ) : (
                        <span className="text-xs text-gray-500 font-medium">None</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Empty State */}
        {filteredResidents.length === 0 && (
          <div className="bg-white border-2 border-gray-200 rounded-3xl p-12 md:p-16 text-center shadow-lg mt-8">
            <div 
              className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
              style={{ background: 'rgba(1, 75, 137, 0.1)' }}
            >
              <Users className="w-10 h-10" style={{ color: '#014b89' }} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No residents found</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              No residents match your search criteria. Try adjusting your filters or search terms.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
