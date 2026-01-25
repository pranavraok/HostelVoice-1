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
    { label: 'Total Residents', value: residents.length, color: 'text-accent' },
    { label: 'Active', value: residents.filter(r => r.status === 'active').length, color: 'text-green-400' },
    { label: 'Inactive', value: residents.filter(r => r.status === 'inactive').length, color: 'text-muted-foreground' },
    { label: 'Pending Issues', value: residents.reduce((sum, r) => sum + r.issues, 0), color: 'text-orange-400' }
  ]

  if (!user) return null

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Residents Management</h1>
        <p className="text-muted-foreground">View and manage hostel residents</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-card border border-border rounded-lg p-4">
            <p className="text-muted-foreground text-sm mb-1">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Search and Filter */}
      <div className="space-y-4 mb-8">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by name, room, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-muted border-border"
          />
        </div>

        {/* Filter */}
        <div className="flex gap-2 flex-wrap">
          {(['all', 'active', 'inactive'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filterStatus === status
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Residents Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">Room</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">Contact</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">Check-in</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-muted-foreground">Issues</th>
              </tr>
            </thead>
            <tbody>
              {filteredResidents.map((resident) => (
                <tr
                  key={resident.id}
                  className="border-b border-border hover:bg-muted/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <p className="font-semibold">{resident.name}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{resident.room}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <a
                          href={`mailto:${resident.email}`}
                          className="text-accent hover:underline"
                        >
                          {resident.email}
                        </a>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="w-4 h-4" />
                        {resident.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {resident.checkInDate}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      resident.status === 'active'
                        ? 'bg-green-500/10 text-green-400'
                        : 'bg-muted/50 text-muted-foreground'
                    }`}>
                      {resident.status === 'active' ? '✓ Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {resident.issues > 0 ? (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-500/10 text-orange-400">
                        {resident.issues} open
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">None</span>
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
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No residents found matching your search</p>
        </div>
      )}
    </div>
  )
}
