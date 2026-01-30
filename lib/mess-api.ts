'use client'

import { createClient } from '@/lib/supabase/client'

// ============================================
// MESS MANAGEMENT API
// ============================================
// Client-side functions for mess operations
// All queries respect RLS policies automatically
// ============================================

// ============================================
// TYPES
// ============================================

export interface WeeklyMenu {
  id: string
  hostel_name: string
  week_start_date: string
  week_end_date: string
  menu_image_url: string | null
  created_by: string
  created_at: string
  updated_at: string
  creator?: {
    full_name: string
  }
}

export interface DailyMeal {
  id: string
  weekly_menu_id: string
  date: string
  meal_type: 'breakfast' | 'lunch' | 'snacks' | 'dinner'
  items: string[]
  created_at: string
  updated_at: string
}

export interface DayMenu {
  breakfast: string[]
  lunch: string[]
  snacks: string[]
  dinner: string[]
}

export interface WeeklyMenuWithMeals extends WeeklyMenu {
  meals: Record<string, DayMenu>
}

export interface MessFeedback {
  id: string
  student_id: string
  hostel_name: string
  date: string
  meal_type: 'breakfast' | 'lunch' | 'snacks' | 'dinner'
  overall_rating: number
  taste_rating: number | null
  quantity_rating: number | null
  quality_rating: number | null
  cleanliness_rating: number | null
  comments: string | null
  status: 'pending' | 'reviewed'
  caretaker_reply: string | null
  replied_by: string | null
  replied_at: string | null
  created_at: string
  student?: {
    full_name: string
  }
  photos?: FeedbackPhoto[]
}

export interface FeedbackPhoto {
  photo_url?: string
  id?: string
  feedback_id?: string
  created_at?: string
}

export interface FeedbackFilters {
  meal_type?: 'breakfast' | 'lunch' | 'snacks' | 'dinner' | 'all'
  rating?: number | 'all'
  status?: 'pending' | 'reviewed' | 'all'
  has_photos?: boolean
  date_from?: string
  date_to?: string
}

export interface FeedbackStats {
  average_rating: number
  total_count: number
  pending_count: number
  reviewed_count: number
  low_rating_count: number
  by_meal: Record<string, { count: number; avg_rating: number }>
}

export interface CreateMenuData {
  hostel_name: string
  week_start_date: string
  menu_image_url?: string
  meals: Record<string, DayMenu>
}

export interface SubmitFeedbackData {
  hostel_name: string
  meal_type: 'breakfast' | 'lunch' | 'snacks' | 'dinner'
  overall_rating: number
  taste_rating?: number
  quantity_rating?: number
  quality_rating?: number
  cleanliness_rating?: number
  comments?: string
  photo_urls?: string[]
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function getWeekStart(date: Date = new Date()): string {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Adjust for Sunday
  d.setDate(diff)
  return d.toISOString().split('T')[0]
}

function getWeekEnd(weekStart: string): string {
  const d = new Date(weekStart)
  d.setDate(d.getDate() + 6)
  return d.toISOString().split('T')[0]
}

function getDayName(date: string): string {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  return days[new Date(date).getDay()]
}

// ============================================
// MENU FUNCTIONS
// ============================================

/**
 * Get the current week's menu for a hostel
 */
export async function getCurrentWeeklyMenu(hostelName: string | null): Promise<WeeklyMenuWithMeals | null> {
  const supabase = createClient()
  const today = new Date().toISOString().split('T')[0]
  
  let query = supabase
    .from('mess_weekly_menus')
    .select(`
      *,
      creator:users!created_by(full_name)
    `)
  
  if (hostelName) {
    // Caretaker/Student: filter by hostel and current week (today between start and end)
    query = query
      .eq('hostel_name', hostelName)
      .lte('week_start_date', today)
      .gte('week_end_date', today)
      .order('week_start_date', { ascending: false })
      .limit(1)
  } else {
    // Admin: get latest menu across all hostels
    query = query
      .lte('week_start_date', today)
      .gte('week_end_date', today)
      .order('week_start_date', { ascending: false })
      .limit(1)
  }
  
  const { data: menu, error: menuError } = await query.single()
  
  if (menuError || !menu) {
    console.log('[MessAPI] No menu found for current week:', menuError?.message)
    return null
  }
  
  // Get all meals for this menu
  const { data: meals, error: mealsError } = await supabase
    .from('mess_daily_meals')
    .select('*')
    .eq('weekly_menu_id', menu.id)
    .order('date', { ascending: true })
  
  if (mealsError) {
    console.error('[MessAPI] Error fetching meals:', mealsError.message)
    return null
  }
  
  // Organize meals by day of week (sunday, monday, ..., saturday)
  const mealsByDay: Record<string, DayMenu> = {}
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  
  // Initialize all days with empty arrays
  days.forEach(day => {
    mealsByDay[day] = { breakfast: [], lunch: [], snacks: [], dinner: [] }
  })
  
  // Fill in actual meals
  meals?.forEach(meal => {
    const dayName = getDayName(meal.date)
    if (mealsByDay[dayName]) {
      mealsByDay[dayName][meal.meal_type as keyof DayMenu] = meal.items
    }
  })
  
  return {
    ...menu,
    meals: mealsByDay
  }
}

/**
 * Get menu for a specific date
 */
export async function getMenuByDate(hostelName: string, date: Date): Promise<DayMenu | null> {
  const supabase = createClient()
  const weekStart = getWeekStart(date)
  const dateStr = date.toISOString().split('T')[0]
  
  // Get the weekly menu
  const { data: menu, error: menuError } = await supabase
    .from('mess_weekly_menus')
    .select('id')
    .eq('hostel_name', hostelName)
    .eq('week_start_date', weekStart)
    .single()
  
  if (menuError || !menu) {
    return null
  }
  
  // Get meals for this date
  const { data: meals, error: mealsError } = await supabase
    .from('mess_daily_meals')
    .select('meal_type, items')
    .eq('weekly_menu_id', menu.id)
    .eq('date', dateStr)
  
  if (mealsError || !meals) {
    return null
  }
  
  const dayMenu: DayMenu = { breakfast: [], lunch: [], snacks: [], dinner: [] }
  meals.forEach(meal => {
    dayMenu[meal.meal_type as keyof DayMenu] = meal.items
  })
  
  return dayMenu
}

/**
 * Create or update weekly menu (Caretaker only)
 */
export async function createWeeklyMenu(data: CreateMenuData): Promise<{ success: boolean; error?: string; menuId?: string }> {
  const supabase = createClient()
  
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }
    
    const weekEnd = getWeekEnd(data.week_start_date)
    
    // Check if menu already exists for this week
    const { data: existingMenu } = await supabase
      .from('mess_weekly_menus')
      .select('id')
      .eq('hostel_name', data.hostel_name)
      .eq('week_start_date', data.week_start_date)
      .single()
    
    let menuId: string
    
    if (existingMenu) {
      // Update existing menu
      const { error: updateError } = await supabase
        .from('mess_weekly_menus')
        .update({
          menu_image_url: data.menu_image_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingMenu.id)
      
      if (updateError) {
        return { success: false, error: updateError.message }
      }
      
      // Delete existing meals
      await supabase
        .from('mess_daily_meals')
        .delete()
        .eq('weekly_menu_id', existingMenu.id)
      
      menuId = existingMenu.id
    } else {
      // Create new menu
      const { data: newMenu, error: insertError } = await supabase
        .from('mess_weekly_menus')
        .insert({
          hostel_name: data.hostel_name,
          week_start_date: data.week_start_date,
          week_end_date: weekEnd,
          menu_image_url: data.menu_image_url,
          created_by: user.id
        })
        .select('id')
        .single()
      
      if (insertError || !newMenu) {
        return { success: false, error: insertError?.message || 'Failed to create menu' }
      }
      
      menuId = newMenu.id
    }
    
    // Insert all daily meals
    const mealsToInsert: Omit<DailyMeal, 'id' | 'created_at' | 'updated_at'>[] = []
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    
    days.forEach((day, index) => {
      const date = new Date(data.week_start_date)
      date.setDate(date.getDate() + index)
      const dateStr = date.toISOString().split('T')[0]
      
      const dayMenu = data.meals[day]
      if (dayMenu) {
        (['breakfast', 'lunch', 'snacks', 'dinner'] as const).forEach(mealType => {
          if (dayMenu[mealType] && dayMenu[mealType].length > 0) {
            mealsToInsert.push({
              weekly_menu_id: menuId,
              date: dateStr,
              meal_type: mealType,
              items: dayMenu[mealType]
            })
          }
        })
      }
    })
    
    if (mealsToInsert.length > 0) {
      const { error: mealsError } = await supabase
        .from('mess_daily_meals')
        .insert(mealsToInsert)
      
      if (mealsError) {
        return { success: false, error: mealsError.message }
      }
    }
    
    return { success: true, menuId }
  } catch (error) {
    console.error('[MessAPI] Error creating menu:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * Upload menu image to storage
 */
export async function uploadMenuImage(file: File, hostelName: string): Promise<{ url: string | null; error?: string }> {
  const supabase = createClient()
  
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${hostelName}/${Date.now()}.${fileExt}`
    
    const { error: uploadError } = await supabase.storage
      .from('mess-menus')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      })
    
    if (uploadError) {
      return { url: null, error: uploadError.message }
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from('mess-menus')
      .getPublicUrl(fileName)
    
    return { url: publicUrl }
  } catch (error) {
    console.error('[MessAPI] Error uploading image:', error)
    return { url: null, error: 'Failed to upload image' }
  }
}

// ============================================
// FEEDBACK FUNCTIONS
// ============================================

/**
 * Submit mess feedback (Student only)
 */
export async function submitMessFeedback(data: SubmitFeedbackData): Promise<{ success: boolean; error?: string; feedbackId?: string }> {
  const supabase = createClient()
  
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }
    
    // Insert feedback
    const { data: feedback, error: feedbackError } = await supabase
      .from('mess_feedback')
      .insert({
        student_id: user.id,
        hostel_name: data.hostel_name,
        meal_type: data.meal_type,
        overall_rating: data.overall_rating,
        taste_rating: data.taste_rating || null,
        quantity_rating: data.quantity_rating || null,
        quality_rating: data.quality_rating || null,
        cleanliness_rating: data.cleanliness_rating || null,
        comments: data.comments || null
      })
      .select('id')
      .single()
    
    if (feedbackError || !feedback) {
      return { success: false, error: feedbackError?.message || 'Failed to submit feedback' }
    }
    
    // Insert photos if any
    if (data.photo_urls && data.photo_urls.length > 0) {
      const photosToInsert = data.photo_urls.map(url => ({
        feedback_id: feedback.id,
        photo_url: url
      }))
      
      const { error: photosError } = await supabase
        .from('mess_feedback_photos')
        .insert(photosToInsert)
      
      if (photosError) {
        console.error('[MessAPI] Error inserting photos:', photosError.message)
        // Don't fail the whole request, feedback was submitted
      }
    }
    
    return { success: true, feedbackId: feedback.id }
  } catch (error) {
    console.error('[MessAPI] Error submitting feedback:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

/**
 * Upload feedback photo to storage
 */
export async function uploadFeedbackPhoto(file: File, userId: string): Promise<{ url: string | null; error?: string }> {
  const supabase = createClient()
  
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}/${Date.now()}.${fileExt}`
    
    const { error: uploadError } = await supabase.storage
      .from('mess-feedback')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })
    
    if (uploadError) {
      return { url: null, error: uploadError.message }
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from('mess-feedback')
      .getPublicUrl(fileName)
    
    return { url: publicUrl }
  } catch (error) {
    console.error('[MessAPI] Error uploading photo:', error)
    return { url: null, error: 'Failed to upload photo' }
  }
}

/**
 * Get feedbacks for a hostel (Caretaker/Admin)
 */
export async function getFeedbacks(
  hostelName: string | null,
  filters: FeedbackFilters = {},
  page: number = 1,
  limit: number = 20
): Promise<{ data: MessFeedback[]; total: number; error?: string }> {
  const supabase = createClient()
  
  try {
    let query = supabase
      .from('mess_feedback')
      .select(`
        id,
        student_id,
        hostel_name,
        date,
        meal_type,
        overall_rating,
        taste_rating,
        quantity_rating,
        quality_rating,
        cleanliness_rating,
        comments,
        status,
        caretaker_reply,
        replied_by,
        replied_at,
        created_at,
        student:users!student_id(full_name),
        photos:mess_feedback_photos(photo_url)
      `, { count: 'exact' })
    
    // Apply hostel filter if provided (null = all hostels for admin)
    if (hostelName) {
      query = query.eq('hostel_name', hostelName)
    }
    
    // Apply filters
    if (filters.meal_type && filters.meal_type !== 'all') {
      query = query.eq('meal_type', filters.meal_type)
    }
    
    if (filters.rating && filters.rating !== 'all') {
      query = query.eq('overall_rating', filters.rating)
    }
    
    if (filters.status && filters.status !== 'all') {
      query = query.eq('status', filters.status)
    }
    
    if (filters.date_from) {
      query = query.gte('date', filters.date_from)
    }
    
    if (filters.date_to) {
      query = query.lte('date', filters.date_to)
    }
    
    // Order by date descending
    query = query.order('created_at', { ascending: false })
    
    // Pagination
    const from = (page - 1) * limit
    query = query.range(from, from + limit - 1)
    
    const { data, error, count } = await query
    
    if (error) {
      return { data: [], total: 0, error: error.message }
    }
    
    // Filter by photos if needed (can't do this in query easily)
    let filteredData = data || []
    if (filters.has_photos) {
      filteredData = filteredData.filter(f => f.photos && f.photos.length > 0)
    }
    
    return { data: filteredData as any as MessFeedback[], total: count || 0 }
  } catch (error) {
    console.error('[MessAPI] Error fetching feedbacks:', error)
    return { data: [], total: 0, error: 'An unexpected error occurred' }
  }
}

/**
 * Get my feedbacks (Student)
 */
export async function getMyFeedbacks(
  page: number = 1,
  limit: number = 20
): Promise<{ data: MessFeedback[]; total: number; error?: string }> {
  const supabase = createClient()
  
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { data: [], total: 0, error: 'Not authenticated' }
    }
    
    const from = (page - 1) * limit
    
    const { data, error, count } = await supabase
      .from('mess_feedback')
      .select(`
        id,
        student_id,
        hostel_name,
        date,
        meal_type,
        overall_rating,
        taste_rating,
        quantity_rating,
        quality_rating,
        cleanliness_rating,
        comments,
        status,
        caretaker_reply,
        replied_by,
        replied_at,
        created_at,
        photos:mess_feedback_photos(photo_url)
      `, { count: 'exact' })
      .eq('student_id', user.id)
      .order('created_at', { ascending: false })
      .range(from, from + limit - 1)
    
    if (error) {
      return { data: [], total: 0, error: error.message }
    }
    
    return { data: data as any as MessFeedback[], total: count || 0 }
  } catch (error) {
    console.error('[MessAPI] Error fetching my feedbacks:', error)
    return { data: [], total: 0, error: 'An unexpected error occurred' }
  }
}

/**
 * Mark feedback as reviewed (Caretaker)
 */
export async function markFeedbackReviewed(
  feedbackId: string,
  reply?: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()
  
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }
    
    const updateData: any = {
      status: 'reviewed',
      replied_by: user.id,
      replied_at: new Date().toISOString()
    }
    
    if (reply) {
      updateData.caretaker_reply = reply
    }
    
    const { error } = await supabase
      .from('mess_feedback')
      .update(updateData)
      .eq('id', feedbackId)
    
    if (error) {
      return { success: false, error: error.message }
    }
    
    return { success: true }
  } catch (error) {
    console.error('[MessAPI] Error marking feedback reviewed:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

// ============================================
// ANALYTICS FUNCTIONS
// ============================================

/**
 * Get feedback statistics for a hostel
 */
export async function getFeedbackStats(
  hostelName: string | null,
  days: number = 30
): Promise<FeedbackStats | null> {
  const supabase = createClient()
  
  try {
    const fromDate = new Date()
    fromDate.setDate(fromDate.getDate() - days)
    const fromDateStr = fromDate.toISOString().split('T')[0]
    
    let query = supabase
      .from('mess_feedback')
      .select('overall_rating, meal_type, status')
    
    if (hostelName) {
      query = query.eq('hostel_name', hostelName)
    }
    
    query = query.gte('date', fromDateStr)
    
    const { data, error } = await query
    
    if (error || !data) {
      console.error('[MessAPI] Error fetching stats:', error?.message)
      return null
    }
    
    if (data.length === 0) {
      return {
        average_rating: 0,
        total_count: 0,
        pending_count: 0,
        reviewed_count: 0,
        low_rating_count: 0,
        by_meal: {}
      }
    }
    
    // Calculate stats
    const totalRating = data.reduce((sum, f) => sum + f.overall_rating, 0)
    const avgRating = totalRating / data.length
    
    const pendingCount = data.filter(f => f.status === 'pending').length
    const reviewedCount = data.filter(f => f.status === 'reviewed').length
    const lowRatingCount = data.filter(f => f.overall_rating <= 2).length
    
    // Group by meal type
    const byMeal: Record<string, { count: number; avg_rating: number }> = {}
    const mealTypes = ['breakfast', 'lunch', 'snacks', 'dinner']
    
    mealTypes.forEach(meal => {
      const mealFeedbacks = data.filter(f => f.meal_type === meal)
      if (mealFeedbacks.length > 0) {
        const mealTotal = mealFeedbacks.reduce((sum, f) => sum + f.overall_rating, 0)
        byMeal[meal] = {
          count: mealFeedbacks.length,
          avg_rating: Math.round((mealTotal / mealFeedbacks.length) * 10) / 10
        }
      }
    })
    
    return {
      average_rating: Math.round(avgRating * 10) / 10,
      total_count: data.length,
      pending_count: pendingCount,
      reviewed_count: reviewedCount,
      low_rating_count: lowRatingCount,
      by_meal: byMeal
    }
  } catch (error) {
    console.error('[MessAPI] Error calculating stats:', error)
    return null
  }
}

/**
 * Get low-rated meals for analysis
 */
export async function getLowRatedMeals(
  hostelName: string | null,
  days: number = 30,
  limit: number = 10
): Promise<{ meal_type: string; date: string; avg_rating: number; comments: string[] }[]> {
  const supabase = createClient()
  
  try {
    const fromDate = new Date()
    fromDate.setDate(fromDate.getDate() - days)
    const fromDateStr = fromDate.toISOString().split('T')[0]
    
    let query = supabase
      .from('mess_feedback')
      .select('meal_type, date, overall_rating, comments')
      .lte('overall_rating', 2)
      .gte('date', fromDateStr)
      .order('date', { ascending: false })
      .limit(limit * 4) // Get more to group
    
    if (hostelName) {
      query = query.eq('hostel_name', hostelName)
    }
    
    const { data, error } = await query
    
    if (error || !data) {
      return []
    }
    
    // Group by date and meal_type
    const grouped: Record<string, { ratings: number[]; comments: string[] }> = {}
    
    data.forEach(f => {
      const key = `${f.date}-${f.meal_type}`
      if (!grouped[key]) {
        grouped[key] = { ratings: [], comments: [] }
      }
      grouped[key].ratings.push(f.overall_rating)
      if (f.comments) {
        grouped[key].comments.push(f.comments)
      }
    })
    
    // Convert to array and calculate averages
    const result = Object.entries(grouped).map(([key, value]) => {
      const [date, meal_type] = key.split('-')
      const avg = value.ratings.reduce((a, b) => a + b, 0) / value.ratings.length
      return {
        date,
        meal_type,
        avg_rating: Math.round(avg * 10) / 10,
        comments: value.comments.slice(0, 3) // Top 3 comments
      }
    })
    
    // Sort by average rating ascending
    result.sort((a, b) => a.avg_rating - b.avg_rating)
    
    return result.slice(0, limit)
  } catch (error) {
    console.error('[MessAPI] Error fetching low-rated meals:', error)
    return []
  }
}

/**
 * Get rating trends over time
 */
export async function getRatingTrends(
  hostelName: string | null,
  days: number = 30
): Promise<{ date: string; avg_rating: number; count: number }[]> {
  const supabase = createClient()
  
  try {
    const fromDate = new Date()
    fromDate.setDate(fromDate.getDate() - days)
    const fromDateStr = fromDate.toISOString().split('T')[0]
    
    let query = supabase
      .from('mess_feedback')
      .select('date, overall_rating')
      .gte('date', fromDateStr)
      .order('date', { ascending: true })
    
    if (hostelName) {
      query = query.eq('hostel_name', hostelName)
    }
    
    const { data, error } = await query
    
    if (error || !data) {
      return []
    }
    
    // Group by date
    const byDate: Record<string, number[]> = {}
    
    data.forEach(f => {
      if (!byDate[f.date]) {
        byDate[f.date] = []
      }
      byDate[f.date].push(f.overall_rating)
    })
    
    // Calculate daily averages
    return Object.entries(byDate).map(([date, ratings]) => ({
      date,
      avg_rating: Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10,
      count: ratings.length
    }))
  } catch (error) {
    console.error('[MessAPI] Error fetching rating trends:', error)
    return []
  }
}
