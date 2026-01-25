'use client'

import React from "react"

import { useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, X, Plus, CheckCircle, Clock } from 'lucide-react'

interface LostFoundItem {
  id: string
  title: string
  description: string
  category: string
  type: 'lost' | 'found'
  status: 'open' | 'claimed'
  postedBy: string
  createdAt: string
  location?: string
}

export default function LostFoundPage() {
  const { user } = useAuth()
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState<'all' | 'lost' | 'found'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const [items, setItems] = useState<LostFoundItem[]>([
    {
      id: '1',
      title: 'Black Leather Wallet',
      description: 'Black leather wallet with ID cards inside. Contains important documents.',
      category: 'Wallet',
      type: 'lost',
      status: 'open',
      postedBy: 'Arjun Singh',
      createdAt: '2026-01-24',
      location: 'Room A-203'
    },
    {
      id: '2',
      title: 'Apple AirPods Pro',
      description: 'Found near the common area. Black color with charging case.',
      category: 'Electronics',
      type: 'found',
      status: 'open',
      postedBy: 'Staff',
      createdAt: '2026-01-23',
      location: 'Common Hall'
    },
    {
      id: '3',
      title: 'Blue Backpack',
      description: 'Blue backpack with college logo. Left near the entrance.',
      category: 'Bags',
      type: 'found',
      status: 'claimed',
      postedBy: 'Staff',
      createdAt: '2026-01-22',
      location: 'Main Entrance'
    },
    {
      id: '4',
      title: 'House Keys',
      description: 'Set of 3 house keys lost somewhere in the hostel premises.',
      category: 'Keys',
      type: 'lost',
      status: 'open',
      postedBy: 'John Doe',
      createdAt: '2026-01-21',
      location: 'Hostel premises'
    }
  ])

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Other',
    type: 'lost' as 'lost' | 'found',
    location: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newItem: LostFoundItem = {
      id: String(items.length + 1),
      title: formData.title,
      description: formData.description,
      category: formData.category,
      type: formData.type,
      status: 'open',
      postedBy: user?.name || 'Anonymous',
      createdAt: new Date().toISOString().split('T')[0],
      location: formData.location
    }
    setItems([newItem, ...items])
    setFormData({ title: '', description: '', category: 'Other', type: 'lost', location: '' })
    setShowForm(false)
  }

  const filteredItems = items.filter((item) => {
    const matchesType = filter === 'all' || item.type === filter
    const matchesSearch = searchQuery === '' || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesType && matchesSearch
  })

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      Wallet: '👛',
      Electronics: '📱',
      Bags: '🎒',
      Keys: '🔑',
      Documents: '📄',
      Clothing: '👕',
      Other: '📦'
    }
    return icons[category] || '📦'
  }

  const getTypeColor = (type: 'lost' | 'found') => {
    return type === 'lost' 
      ? 'bg-red-500/10 text-red-400' 
      : 'bg-green-500/10 text-green-400'
  }

  if (!user) return null

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Lost & Found</h1>
          <p className="text-muted-foreground">
            Help community members find their lost items or claim found items
          </p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="mt-4 md:mt-0 bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
        >
          <Plus className="w-4 h-4" />
          Report Item
        </Button>
      </div>

      {/* Report Form */}
      {showForm && (
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Report a Lost or Found Item</h2>
            <button
              onClick={() => setShowForm(false)}
              className="p-1 hover:bg-muted rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Type Selection */}
            <div>
              <label className="text-sm font-medium mb-3 block">Item Type</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'lost' })}
                  className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                    formData.type === 'lost'
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  Lost Item
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'found' })}
                  className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                    formData.type === 'found'
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  Found Item
                </button>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="text-sm font-medium mb-2 block">Item Title</label>
              <Input
                type="text"
                placeholder="e.g., Black Leather Wallet"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="bg-muted border-border"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <option>Wallet</option>
                <option>Electronics</option>
                <option>Bags</option>
                <option>Keys</option>
                <option>Documents</option>
                <option>Clothing</option>
                <option>Other</option>
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="text-sm font-medium mb-2 block">Location</label>
              <Input
                type="text"
                placeholder="Where was it lost/found?"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="bg-muted border-border"
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-sm font-medium mb-2 block">Description</label>
              <textarea
                placeholder="Describe the item in detail..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                rows={4}
                required
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                Report Item
              </Button>
              <Button
                type="button"
                onClick={() => setShowForm(false)}
                variant="outline"
                className="border-border"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Search and Filter */}
      <div className="space-y-4 mb-8">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-muted border-border"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 flex-wrap">
          {(['all', 'lost', 'found'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === type
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {type === 'all' ? 'All Items' : type === 'lost' ? 'Lost' : 'Found'}
            </button>
          ))}
        </div>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredItems.length === 0 ? (
          <div className="col-span-full bg-card border border-border rounded-lg p-12 text-center">
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No items found</p>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2"
            >
              <Plus className="w-4 h-4" />
              Report an Item
            </Button>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-card border border-border rounded-lg p-6 hover:border-accent/30 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">{getCategoryIcon(item.category)}</span>
                    <h3 className="text-lg font-semibold">{item.title}</h3>
                  </div>
                  <p className="text-muted-foreground text-sm mb-3">{item.description}</p>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(item.type)}`}>
                  {item.type === 'lost' ? '❌ Lost' : '✅ Found'}
                </span>
                <span className="px-3 py-1 rounded-full text-xs bg-muted/50 text-muted-foreground">
                  {item.category}
                </span>
              </div>

              {/* Location and Date */}
              <div className="text-xs text-muted-foreground border-t border-border pt-3 pb-3">
                {item.location && <div>📍 {item.location}</div>}
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {item.createdAt}
                </div>
              </div>

              {/* Status */}
              <div className="mb-3 flex items-center gap-2">
                {item.status === 'claimed' ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-xs text-green-400">Claimed</span>
                  </>
                ) : (
                  <span className="text-xs text-accent">Available</span>
                )}
              </div>

              {/* Action Button */}
              <Button
                disabled={item.status === 'claimed'}
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground disabled:opacity-50"
              >
                {item.type === 'lost' ? 'I Found It' : 'This Is Mine'}
              </Button>

              {/* Posted By */}
              <div className="mt-3 text-xs text-muted-foreground text-center">
                Posted by: {item.postedBy}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
