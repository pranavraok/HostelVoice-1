'use client'

import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Settings, Plus, Trash2, Edit, Building2, Shield } from 'lucide-react'

interface Hostel {
  id: string
  name: string
  block: string
  capacity: number
  currentOccupancy: number
  caretaker: string
  status: 'active' | 'maintenance'
}

export default function ManagementPage() {
  const { user } = useAuth()

  const hostels: Hostel[] = [
    {
      id: '1',
      name: 'North Wing',
      block: 'Block A',
      capacity: 200,
      currentOccupancy: 180,
      caretaker: 'Rajesh Kumar',
      status: 'active'
    },
    {
      id: '2',
      name: 'South Wing',
      block: 'Block B',
      capacity: 180,
      currentOccupancy: 165,
      caretaker: 'Sharma',
      status: 'active'
    },
    {
      id: '3',
      name: 'East Wing',
      block: 'Block C',
      capacity: 220,
      currentOccupancy: 190,
      caretaker: 'Patel',
      status: 'active'
    },
    {
      id: '4',
      name: 'West Wing',
      block: 'Block D',
      capacity: 200,
      currentOccupancy: 175,
      caretaker: 'Singh',
      status: 'active'
    },
    {
      id: '5',
      name: 'Central Block',
      block: 'Block E',
      capacity: 250,
      currentOccupancy: 200,
      caretaker: 'Kumar',
      status: 'active'
    },
    {
      id: '6',
      name: 'New Hostel',
      block: 'Block F',
      capacity: 150,
      currentOccupancy: 130,
      caretaker: 'Verma',
      status: 'active'
    }
  ]

  const caretakers = [
    { id: '1', name: 'Rajesh Kumar', hostel: 'North Wing', joinDate: '2023-01-15', status: 'active' },
    { id: '2', name: 'Sharma', hostel: 'South Wing', joinDate: '2022-06-20', status: 'active' },
    { id: '3', name: 'Patel', hostel: 'East Wing', joinDate: '2023-03-10', status: 'active' },
    { id: '4', name: 'Singh', hostel: 'West Wing', joinDate: '2022-11-05', status: 'active' },
    { id: '5', name: 'Kumar', hostel: 'Central Block', joinDate: '2023-02-28', status: 'active' },
    { id: '6', name: 'Verma', hostel: 'New Hostel', joinDate: '2023-09-12', status: 'active' }
  ]

  if (!user) return null

  const totalCapacity = hostels.reduce((sum, h) => sum + h.capacity, 0)
  const totalOccupancy = hostels.reduce((sum, h) => sum + h.currentOccupancy, 0)
  const occupancyRate = Math.round((totalOccupancy / totalCapacity) * 100)

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
          <Button 
            className="text-white font-bold gap-2 h-12 md:h-14 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
            style={{ background: '#f26918' }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#d95a0f'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#f26918'}
          >
            <Plus className="w-5 h-5" />
            New Hostel
          </Button>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12">
          {[
            { label: 'Total Hostels', value: hostels.length, color: '#014b89' },
            { label: 'Total Capacity', value: totalCapacity, color: '#f26918' },
            { label: 'Current Occupancy', value: totalOccupancy, color: '#014b89' },
            { label: 'Occupancy Rate', value: `${occupancyRate}%`, color: '#10b981' }
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
            Hostel Management
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="px-4 py-4 text-left font-bold text-gray-600 uppercase tracking-wide text-sm">Name</th>
                  <th className="px-4 py-4 text-left font-bold text-gray-600 uppercase tracking-wide text-sm">Block</th>
                  <th className="px-4 py-4 text-left font-bold text-gray-600 uppercase tracking-wide text-sm">Capacity</th>
                  <th className="px-4 py-4 text-left font-bold text-gray-600 uppercase tracking-wide text-sm">Occupancy</th>
                  <th className="px-4 py-4 text-left font-bold text-gray-600 uppercase tracking-wide text-sm">Caretaker</th>
                  <th className="px-4 py-4 text-left font-bold text-gray-600 uppercase tracking-wide text-sm">Status</th>
                  <th className="px-4 py-4 text-left font-bold text-gray-600 uppercase tracking-wide text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {hostels.map((hostel) => {
                  const occupancy = Math.round((hostel.currentOccupancy / hostel.capacity) * 100)
                  return (
                    <tr key={hostel.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4 font-bold text-gray-900">{hostel.name}</td>
                      <td className="px-4 py-4 text-gray-700 font-medium">{hostel.block}</td>
                      <td className="px-4 py-4 font-semibold text-gray-900">{hostel.capacity}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-24 h-3 rounded-full bg-gray-100 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{ 
                                width: `${occupancy}%`,
                                background: 'linear-gradient(to right, #014b89, #0369a1)'
                              }}
                            />
                          </div>
                          <span className="text-xs font-bold text-gray-700">{hostel.currentOccupancy}/{hostel.capacity}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 font-medium text-gray-700">{hostel.caretaker}</td>
                      <td className="px-4 py-4">
                        <span className="px-3 py-1.5 rounded-lg text-xs font-bold border-2" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
                          {hostel.status}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex gap-2">
                          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <Edit className="w-4 h-4" style={{ color: '#014b89' }} />
                          </button>
                          <button className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4" style={{ color: '#ef4444' }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Caretakers Management */}
        <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 md:p-8 shadow-lg mb-8 animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 flex items-center gap-3" style={{ color: '#014b89' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(242, 105, 24, 0.1)' }}>
              <Shield className="w-5 h-5" style={{ color: '#f26918' }} />
            </div>
            Caretaker Management
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="px-4 py-4 text-left font-bold text-gray-600 uppercase tracking-wide text-sm">Name</th>
                  <th className="px-4 py-4 text-left font-bold text-gray-600 uppercase tracking-wide text-sm">Assigned Hostel</th>
                  <th className="px-4 py-4 text-left font-bold text-gray-600 uppercase tracking-wide text-sm">Join Date</th>
                  <th className="px-4 py-4 text-left font-bold text-gray-600 uppercase tracking-wide text-sm">Status</th>
                  <th className="px-4 py-4 text-left font-bold text-gray-600 uppercase tracking-wide text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {caretakers.map((caretaker) => (
                  <tr key={caretaker.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4 font-bold text-gray-900">{caretaker.name}</td>
                    <td className="px-4 py-4 font-medium text-gray-700">{caretaker.hostel}</td>
                    <td className="px-4 py-4 text-gray-600 font-medium">
                      {new Date(caretaker.joinDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-4 py-4">
                      <span className="px-3 py-1.5 rounded-lg text-xs font-bold border-2" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
                        {caretaker.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                          <Edit className="w-4 h-4" style={{ color: '#f26918' }} />
                        </button>
                        <button className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" style={{ color: '#ef4444' }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
      </div>
    </div>
  )
}
