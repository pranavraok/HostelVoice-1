'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/auth-context'
import { lostFoundApi, LostFoundItem, ApiError } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, X, Plus, CheckCircle, Clock, MapPin, Loader2, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

export default function LostFoundPage() {
  const { user } = useAuth()
  const [showForm, setShowForm] = useState(false)
  const [filter, setFilter] = useState<'all' | 'lost' | 'found'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [items, setItems] = useState<LostFoundItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    item_name: '',
    description: '',
    category: 'other',
    type: 'lost' as 'lost' | 'found',
    location_lost: '',
    location_found: '',
    current_location: '',
    date_lost_found: '',
    contact_info: '',
    notes: ''
  })

  // Fetch items
  const fetchItems = useCallback(async () => {
    if (!user) return
    setIsLoading(true)
    setError(null)

    try {
      const response = await lostFoundApi.getOpenItems(1, 50)
      if (response.data) {
        setItems(response.data)
      }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to load items'
      setError(message)
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsSubmitting(true)

    try {
      const submitData: any = {
        item_name: formData.item_name,
        description: formData.description,
        category: formData.category,
        type: formData.type,
        contact_info: formData.contact_info || user.email,
      }

      // Add type-specific fields
      if (formData.type === 'lost') {
        if (formData.location_lost) submitData.location_lost = formData.location_lost
        if (formData.date_lost_found) {
          // Convert date to ISO datetime string
          submitData.date_lost = new Date(formData.date_lost_found).toISOString()
        }
      } else {
        if (formData.location_found) submitData.location_found = formData.location_found
        if (formData.current_location) submitData.current_location = formData.current_location
        if (formData.date_lost_found) {
          // Convert date to ISO datetime string
          submitData.date_found = new Date(formData.date_lost_found).toISOString()
        }
      }

      if (formData.notes) submitData.notes = formData.notes

      console.log('Submitting data:', submitData) // Debug log

      const response = await lostFoundApi.report(submitData)

      if (response.data) {
        setItems(prev => [response.data!, ...prev])
        toast.success('Item reported successfully!')
        setFormData({ 
          item_name: '', 
          description: '', 
          category: 'other', 
          type: 'lost', 
          location_lost: '',
          location_found: '',
          current_location: '',
          date_lost_found: '',
          contact_info: '',
          notes: ''
        })
        setShowForm(false)
      }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to report item'
      console.error('Error submitting item:', err)
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClaim = async (id: string) => {
    try {
      const response = await lostFoundApi.claim(id, user?.email || 'Contact via hostel staff')
      if (response.data) {
        setItems(prev => prev.map(i => i.id === id ? response.data! : i))
        toast.success('Claim submitted! The reporter will be notified.')
      }
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to claim'
      toast.error(message)
    }
  }

  const filteredItems = items.filter((item) => {
    const matchesType = filter === 'all' || item.type === filter
    const matchesSearch = searchQuery === '' || 
      item.item_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesType && matchesSearch
  })

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      wallet: '👛',
      electronics: '📱',
      bags: '🎒',
      keys: '🔑',
      documents: '📄',
      clothing: '👕',
      other: '📦'
    }
    return icons[category?.toLowerCase()] || '📦'
  }

  const getTypeColor = (type: 'lost' | 'found') => {
    return type === 'lost' 
      ? { bg: 'rgba(239, 68, 68, 0.1)', text: '#ef4444', border: 'rgba(239, 68, 68, 0.3)' }
      : { bg: 'rgba(16, 185, 129, 0.1)', text: '#10b981', border: 'rgba(16, 185, 129, 0.3)' }
  }

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

      <div className="max-w-6xl mx-auto px-4 pt-6 pb-24 md:px-8 md:pt-12 md:pb-12 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 md:mb-12 animate-fade-in">
          <div>
            <h1 className="text-3xl md:text-5xl font-bold mb-2" style={{ color: '#014b89' }}>
              Lost & Found
            </h1>
            <p className="text-base md:text-lg text-gray-600">
              Help community members find their lost items or claim found items
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={fetchItems}
              variant="outline"
              className="gap-2 h-12 rounded-xl font-semibold border-2"
              style={{ borderColor: '#014b89', color: '#014b89' }}
              disabled={isLoading}
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              onClick={() => setShowForm(!showForm)}
              className="text-white font-bold gap-2 w-full md:w-auto h-12 md:h-14 rounded-xl shadow-lg hover:shadow-xl transition-all text-base"
              style={{ background: '#014b89' }}
            >
              <Plus className="w-5 h-5" />
              Report Item
            </Button>
          </div>
        </div>

        {/* Report Form */}
        {showForm && (
          <div className="bg-white border-2 rounded-3xl p-6 md:p-8 mb-8 shadow-xl animate-fade-in" style={{ borderColor: 'rgba(1, 75, 137, 0.2)' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl md:text-3xl font-bold" style={{ color: '#014b89' }}>Report a Lost or Found Item</h2>
              <button
                onClick={() => setShowForm(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Type Selection */}
              <div>
                <label className="text-sm font-bold text-gray-900 mb-3 block">Item Type *</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'lost' })}
                    className="py-4 px-4 rounded-xl text-sm font-bold transition-all border-2"
                    style={{
                      background: formData.type === 'lost' ? 'rgba(239, 68, 68, 0.1)' : '#f9fafb',
                      color: formData.type === 'lost' ? '#ef4444' : '#6b7280',
                      borderColor: formData.type === 'lost' ? 'rgba(239, 68, 68, 0.3)' : '#e5e7eb'
                    }}
                  >
                    ❌ Lost Item
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'found' })}
                    className="py-4 px-4 rounded-xl text-sm font-bold transition-all border-2"
                    style={{
                      background: formData.type === 'found' ? 'rgba(16, 185, 129, 0.1)' : '#f9fafb',
                      color: formData.type === 'found' ? '#10b981' : '#6b7280',
                      borderColor: formData.type === 'found' ? 'rgba(16, 185, 129, 0.3)' : '#e5e7eb'
                    }}
                  >
                    ✅ Found Item
                  </button>
                </div>
              </div>

              {/* Item Name */}
              <div>
                <label className="text-sm font-bold text-gray-900 mb-2 block">Item Name *</label>
                <Input
                  type="text"
                  placeholder="e.g., Black Leather Wallet, iPhone 13 Pro"
                  value={formData.item_name}
                  onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
                  className="border-2 border-gray-200 focus:border-[#014b89] focus:ring-[#014b89] rounded-xl h-12"
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label className="text-sm font-bold text-gray-900 mb-2 block">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full h-12 px-4 border-2 border-gray-200 rounded-xl focus:border-[#014b89] focus:ring-[#014b89] bg-white text-gray-900 font-medium transition-all"
                >
                  <option value="wallet">👛 Wallet</option>
                  <option value="electronics">📱 Electronics</option>
                  <option value="bags">🎒 Bags</option>
                  <option value="keys">🔑 Keys</option>
                  <option value="documents">📄 Documents</option>
                  <option value="clothing">👕 Clothing</option>
                  <option value="other">📦 Other</option>
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="text-sm font-bold text-gray-900 mb-2 block">
                  Date {formData.type === 'lost' ? 'Lost' : 'Found'}
                </label>
                <Input
                  type="date"
                  value={formData.date_lost_found}
                  onChange={(e) => setFormData({ ...formData, date_lost_found: e.target.value })}
                  className="border-2 border-gray-200 focus:border-[#014b89] focus:ring-[#014b89] rounded-xl h-12"
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>

              {/* Location - Lost Item */}
              {formData.type === 'lost' && (
                <div>
                  <label className="text-sm font-bold text-gray-900 mb-2 block">Where did you lose it?</label>
                  <Input
                    type="text"
                    placeholder="e.g., Library, Cafeteria, Room 232"
                    value={formData.location_lost}
                    onChange={(e) => setFormData({ ...formData, location_lost: e.target.value })}
                    className="border-2 border-gray-200 focus:border-[#014b89] focus:ring-[#014b89] rounded-xl h-12"
                  />
                </div>
              )}

              {/* Location - Found Item */}
              {formData.type === 'found' && (
                <>
                  <div>
                    <label className="text-sm font-bold text-gray-900 mb-2 block">Where did you find it?</label>
                    <Input
                      type="text"
                      placeholder="e.g., Library, Cafeteria, Near Gate"
                      value={formData.location_found}
                      onChange={(e) => setFormData({ ...formData, location_found: e.target.value })}
                      className="border-2 border-gray-200 focus:border-[#014b89] focus:ring-[#014b89] rounded-xl h-12"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-gray-900 mb-2 block">Current Location</label>
                    <Input
                      type="text"
                      placeholder="e.g., With Security, Room 101, Office"
                      value={formData.current_location}
                      onChange={(e) => setFormData({ ...formData, current_location: e.target.value })}
                      className="border-2 border-gray-200 focus:border-[#014b89] focus:ring-[#014b89] rounded-xl h-12"
                    />
                  </div>
                </>
              )}

              {/* Contact Info */}
              <div>
                <label className="text-sm font-bold text-gray-900 mb-2 block">Contact Information</label>
                <Input
                  type="text"
                  placeholder="Phone number or email (optional)"
                  value={formData.contact_info}
                  onChange={(e) => setFormData({ ...formData, contact_info: e.target.value })}
                  className="border-2 border-gray-200 focus:border-[#014b89] focus:ring-[#014b89] rounded-xl h-12"
                />
                <p className="text-xs text-gray-500 mt-1">Your email will be used if not provided</p>
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-bold text-gray-900 mb-2 block">Description *</label>
                <textarea
                  placeholder="Describe the item in detail (color, brand, unique features)..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#014b89] focus:ring-[#014b89] resize-none font-medium"
                  rows={4}
                  required
                />
              </div>

              {/* Additional Notes */}
              <div>
                <label className="text-sm font-bold text-gray-900 mb-2 block">Additional Notes</label>
                <textarea
                  placeholder="Any other information that might help..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#014b89] focus:ring-[#014b89] resize-none font-medium"
                  rows={2}
                />
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button 
                  type="submit" 
                  className="text-white font-bold w-full sm:flex-1 h-12 rounded-xl shadow-lg hover:shadow-xl transition-all"
                  style={{ background: '#014b89' }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit Report'}
                </Button>
                <Button
                  type="button"
                  onClick={() => setShowForm(false)}
                  variant="outline"
                  className="border-2 w-full sm:w-auto h-12 rounded-xl font-semibold"
                  style={{ borderColor: '#014b89', color: '#014b89' }}
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
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 border-2 border-gray-200 focus:border-[#014b89] focus:ring-[#014b89] rounded-xl h-12"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-3 flex-wrap">
            {(['all', 'lost', 'found'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className="px-6 py-3 rounded-xl text-sm font-bold transition-all border-2"
                style={{
                  background: filter === type ? '#014b89' : '#f9fafb',
                  color: filter === type ? 'white' : '#6b7280',
                  borderColor: filter === type ? '#014b89' : '#e5e7eb'
                }}
              >
                {type === 'all' ? 'All Items' : type === 'lost' ? '❌ Lost' : '✅ Found'}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 animate-spin mb-4" style={{ color: '#014b89' }} />
            <p className="text-gray-600 font-medium">Loading items...</p>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 text-center mb-8">
            <Search className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-red-700 mb-2">Failed to Load Items</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchItems} className="bg-red-600 hover:bg-red-700 text-white">
              Try Again
            </Button>
          </div>
        )}

        {/* Items Grid */}
        {!isLoading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredItems.length === 0 ? (
            <div className="col-span-full bg-white border-2 border-gray-200 rounded-3xl p-12 md:p-16 text-center shadow-lg">
              <div 
                className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
                style={{ background: 'rgba(1, 75, 137, 0.1)' }}
              >
                <Search className="w-10 h-10" style={{ color: '#014b89' }} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No items found</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                No items match your search criteria. Try adjusting your filters or report a new item.
              </p>
              <Button
                onClick={() => setShowForm(true)}
                className="text-white font-bold gap-2 h-12 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all"
                style={{ background: '#014b89' }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#012d52'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#014b89'}
              >
                <Plus className="w-5 h-5" />
                Report an Item
              </Button>
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const typeColor = getTypeColor(item.type)
              const location = item.type === 'lost' ? item.location_lost : (item.location_found || item.current_location)
              const dateDisplay = item.type === 'lost' ? item.date_lost : item.date_found
              
              return (
                <div
                  key={item.id}
                  className="bg-white border-2 border-gray-200 rounded-2xl p-6 hover:border-gray-300 hover:shadow-xl transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-4xl">{getCategoryIcon(item.category)}</span>
                        <h3 className="text-xl font-bold text-gray-900">{item.item_name}</h3>
                      </div>
                      <p className="text-gray-600 leading-relaxed mb-3">{item.description}</p>
                      {item.notes && (
                        <p className="text-sm text-gray-500 italic bg-gray-50 p-3 rounded-xl border border-gray-200">
                          💡 {item.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span 
                      className="px-4 py-2 rounded-xl text-sm font-bold border-2"
                      style={{ 
                        background: typeColor.bg, 
                        color: typeColor.text,
                        borderColor: typeColor.border
                      }}
                    >
                      {item.type === 'lost' ? '❌ Lost' : '✅ Found'}
                    </span>
                    <span className="px-4 py-2 rounded-xl text-sm bg-gray-100 text-gray-700 font-semibold border-2 border-gray-200 capitalize">
                      {item.category}
                    </span>
                  </div>

                  {/* Location and Date */}
                  <div className="text-sm text-gray-600 border-t-2 border-gray-100 pt-4 pb-4 space-y-2">
                    {location && (
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 mt-0.5" style={{ color: '#f26918' }} />
                        <div>
                          <span className="font-semibold">{item.type === 'lost' ? 'Lost at:' : 'Found at:'}</span>
                          <span className="ml-1">{location}</span>
                        </div>
                      </div>
                    )}
                    {item.type === 'found' && item.current_location && item.current_location !== item.location_found && (
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 mt-0.5" style={{ color: '#10b981' }} />
                        <div>
                          <span className="font-semibold">Currently at:</span>
                          <span className="ml-1">{item.current_location}</span>
                        </div>
                      </div>
                    )}
                    {dateDisplay && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="font-semibold">{item.type === 'lost' ? 'Lost on:' : 'Found on:'}</span>
                        <span>{new Date(dateDisplay).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="font-semibold">Reported:</span>
                      <span>{new Date(item.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                  </div>

                  {/* Contact Info */}
                  {item.contact_info && (
                    <div className="mb-4 px-4 py-3 bg-blue-50 border-2 border-blue-100 rounded-xl">
                      <p className="text-sm font-semibold text-blue-700">
                        📞 Contact: {item.contact_info}
                      </p>
                    </div>
                  )}

                  {/* Status */}
                  <div className="mb-4">
                    {item.status === 'claimed' || item.status === 'closed' || item.status === 'returned' ? (
                      <div className="flex items-center gap-2 px-4 py-2 rounded-xl border-2" style={{ background: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
                        <CheckCircle className="w-5 h-5" style={{ color: '#10b981' }} />
                        <span className="text-sm font-bold" style={{ color: '#10b981' }}>
                          {item.status === 'returned' ? 'Returned to Owner' : 'Claimed'}
                        </span>
                        {item.claimed_at && (
                          <span className="text-xs text-gray-600 ml-2">
                            on {new Date(item.claimed_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 px-4 py-2 rounded-xl border-2" style={{ background: 'rgba(242, 105, 24, 0.1)', borderColor: 'rgba(242, 105, 24, 0.3)' }}>
                        <span className="text-sm font-bold" style={{ color: '#f26918' }}>Available</span>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <Button
                    disabled={item.status === 'claimed' || item.status === 'closed' || item.status === 'returned' || item.reported_by === user?.id}
                    onClick={() => handleClaim(item.id)}
                    className="w-full text-white font-bold h-12 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-3"
                    style={{ background: (item.status === 'claimed' || item.status === 'closed' || item.status === 'returned' || item.reported_by === user?.id) ? '#9ca3af' : '#014b89' }}
                  >
                    {item.reported_by === user?.id ? 'Your Item' : item.type === 'lost' ? 'I Found This Item' : 'This Is My Item'}
                  </Button>

                  {/* Posted By */}
                  <div className="text-xs text-gray-500 text-center font-medium">
                    Posted by: <span className="font-bold text-gray-700">{item.reporter?.full_name || 'Anonymous'}</span>
                    {item.reporter?.phone_number && (
                      <span className="ml-2">• 📞 {item.reporter.phone_number}</span>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
        )}
      </div>
    </div>
  )
}
