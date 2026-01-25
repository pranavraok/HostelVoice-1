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
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">System Management</h1>
          <p className="text-muted-foreground">Manage hostels, caretakers, and system settings</p>
        </div>
        <Button className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2">
          <Plus className="w-4 h-4" />
          New Hostel
        </Button>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-muted-foreground text-sm mb-2">Total Hostels</p>
          <p className="text-3xl font-bold">{hostels.length}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-muted-foreground text-sm mb-2">Total Capacity</p>
          <p className="text-3xl font-bold">{totalCapacity}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-muted-foreground text-sm mb-2">Current Occupancy</p>
          <p className="text-3xl font-bold">{totalOccupancy}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-muted-foreground text-sm mb-2">Occupancy Rate</p>
          <p className="text-3xl font-bold">{occupancyRate}%</p>
        </div>
      </div>

      {/* Hostels Management */}
      <div className="bg-card border border-border rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-accent" />
          Hostel Management
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Name</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Block</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Capacity</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Occupancy</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Caretaker</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {hostels.map((hostel) => {
                const occupancy = Math.round((hostel.currentOccupancy / hostel.capacity) * 100)
                return (
                  <tr key={hostel.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3 font-medium">{hostel.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{hostel.block}</td>
                    <td className="px-4 py-3">{hostel.capacity}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-accent to-secondary"
                            style={{ width: `${occupancy}%` }}
                          />
                        </div>
                        <span className="text-xs">{hostel.currentOccupancy}/{hostel.capacity}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">{hostel.caretaker}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded-full text-xs bg-green-500/10 text-green-400">
                        {hostel.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button className="p-1 hover:bg-muted rounded transition-colors">
                          <Edit className="w-4 h-4 text-accent" />
                        </button>
                        <button className="p-1 hover:bg-muted rounded transition-colors">
                          <Trash2 className="w-4 h-4 text-destructive" />
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
      <div className="bg-card border border-border rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-accent" />
          Caretaker Management
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Name</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Assigned Hostel</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Join Date</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {caretakers.map((caretaker) => (
                <tr key={caretaker.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3 font-medium">{caretaker.name}</td>
                  <td className="px-4 py-3">{caretaker.hostel}</td>
                  <td className="px-4 py-3 text-muted-foreground">{caretaker.joinDate}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 rounded-full text-xs bg-green-500/10 text-green-400">
                      {caretaker.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button className="p-1 hover:bg-muted rounded transition-colors">
                        <Edit className="w-4 h-4 text-accent" />
                      </button>
                      <button className="p-1 hover:bg-muted rounded transition-colors">
                        <Trash2 className="w-4 h-4 text-destructive" />
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
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5 text-accent" />
          System Settings
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
            <div>
              <p className="font-semibold">Maintenance Mode</p>
              <p className="text-sm text-muted-foreground">Temporarily disable system access</p>
            </div>
            <button className="px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors">
              Disabled
            </button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
            <div>
              <p className="font-semibold">Auto-Backup</p>
              <p className="text-sm text-muted-foreground">Daily database backups</p>
            </div>
            <button className="px-4 py-2 rounded-lg bg-accent hover:bg-accent/90 text-accent-foreground transition-colors">
              Enabled
            </button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
            <div>
              <p className="font-semibold">Email Notifications</p>
              <p className="text-sm text-muted-foreground">Send alerts for critical issues</p>
            </div>
            <button className="px-4 py-2 rounded-lg bg-accent hover:bg-accent/90 text-accent-foreground transition-colors">
              Enabled
            </button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
            <div>
              <p className="font-semibold">Issue Auto-Assignment</p>
              <p className="text-sm text-muted-foreground">Automatically assign issues to caretakers</p>
            </div>
            <button className="px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors">
              Disabled
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
