"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Edit,
  Upload,
  Download,
  FileText,
  MessageSquare,
  Star,
  Image as ImageIcon,
  Filter,
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart3,
  CheckCircle2,
  Reply,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import {
  getCurrentWeeklyMenu,
  createWeeklyMenu,
  uploadMenuImage,
  getFeedbacks,
  getFeedbackStats,
  getLowRatedMeals,
  markFeedbackReviewed,
  type WeeklyMenuWithMeals,
  type MessFeedback,
  type FeedbackStats,
  type FeedbackFilters,
} from "@/lib/mess-api";

type LowRatedMeal = {
  meal_type: string;
  date: string;
  avg_rating: number;
  comments: string[];
};

export default function MessManagementPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  
  // Menu state
  const [weeklyMenu, setWeeklyMenu] = useState<WeeklyMenuWithMeals | null>(null);
  const [isLoadingMenu, setIsLoadingMenu] = useState(true);
  const [showUploadForm, setShowUploadForm] = useState(false);
  
  // Feedback state
  const [feedbacks, setFeedbacks] = useState<MessFeedback[]>([]);
  const [isLoadingFeedbacks, setIsLoadingFeedbacks] = useState(true);
  const [feedbackStats, setFeedbackStats] = useState<FeedbackStats | null>(null);
  const [lowRatedMeals, setLowRatedMeals] = useState<LowRatedMeal[]>([]);
  const [totalFeedbacks, setTotalFeedbacks] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Filters
  const [filterMeal, setFilterMeal] = useState<string>("all");
  const [filterRating, setFilterRating] = useState<string>("all");
  const [showPhotosOnly, setShowPhotosOnly] = useState(false);
  
  // Reply dialog
  const [replyText, setReplyText] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  
  // Photo signed URLs state
  const [photoSignedUrls, setPhotoSignedUrls] = useState<Record<string, string>>({});
  const [loadingPhotoUrls, setLoadingPhotoUrls] = useState(false);
  
  // Weekly menu upload state
  const [weeklyMenuData, setWeeklyMenuData] = useState({
    monday: { breakfast: "", lunch: "", snacks: "", dinner: "" },
    tuesday: { breakfast: "", lunch: "", snacks: "", dinner: "" },
    wednesday: { breakfast: "", lunch: "", snacks: "", dinner: "" },
    thursday: { breakfast: "", lunch: "", snacks: "", dinner: "" },
    friday: { breakfast: "", lunch: "", snacks: "", dinner: "" },
    saturday: { breakfast: "", lunch: "", snacks: "", dinner: "" },
    sunday: { breakfast: "", lunch: "", snacks: "", dinner: "" },
  });
  const [menuPhoto, setMenuPhoto] = useState<File | null>(null);
  const [isUploadingMenu, setIsUploadingMenu] = useState(false);

  // Get user role from auth context
  const userRole = user?.role as "admin" | "caretaker" | undefined;
  const hostelName = user?.hostelName || "";

  // Helper function to get signed URL for a photo path
  const getSignedUrl = async (photoPath: string): Promise<string | null> => {
    if (!photoPath) return null;
    
    // If already a full URL, return as is (for backwards compatibility)
    if (photoPath.startsWith('http')) return photoPath;
    
    try {
      const supabase = createClient();
      const { data, error } = await supabase.storage
        .from('mess-feedback')
        .createSignedUrl(photoPath, 60 * 60); // 1 hour expiry
      
      if (error) {
        console.error('[MessManagement] Error creating signed URL:', error.message);
        return null;
      }
      
      return data.signedUrl;
    } catch (error) {
      console.error('[MessManagement] Error getting signed URL:', error);
      return null;
    }
  };

  // Fetch signed URLs for all feedback photos
  useEffect(() => {
    const fetchPhotoUrls = async () => {
      if (!feedbacks || feedbacks.length === 0) return;
      
      setLoadingPhotoUrls(true);
      const urlMap: Record<string, string> = {};
      
      for (const feedback of feedbacks) {
        if (feedback.photos && feedback.photos.length > 0) {
          for (const photo of feedback.photos) {
            if (photo.photo_url && !urlMap[photo.photo_url]) {
              const signedUrl = await getSignedUrl(photo.photo_url);
              if (signedUrl) {
                urlMap[photo.photo_url] = signedUrl;
              }
            }
          }
        }
      }
      
      setPhotoSignedUrls(urlMap);
      setLoadingPhotoUrls(false);
    };
    
    fetchPhotoUrls();
  }, [feedbacks]);

  // Load initial data
  useEffect(() => {
    if (userRole !== 'admin' && !hostelName) return;
    
    if (hostelName) {
      loadMenu();
    }
    loadFeedbacks();
    if (userRole === "admin") {
      loadAnalytics();
    }
  }, [hostelName, userRole]);

  // Reload feedbacks when filters change
  useEffect(() => {
    if (userRole !== 'admin' && !hostelName) return;
    loadFeedbacks();
  }, [filterMeal, filterRating, showPhotosOnly, currentPage, userRole]);

  async function loadMenu() {
    setIsLoadingMenu(true);
    try {
      const hostelFilter = userRole === 'admin' ? null : hostelName;
      const menu = await getCurrentWeeklyMenu(hostelFilter);
      setWeeklyMenu(menu);
      setShowUploadForm(!menu);
    } catch (error) {
      console.error('[MessManagement] Error loading menu:', error);
      toast.error("Failed to load menu");
    } finally {
      setIsLoadingMenu(false);
    }
  }

  async function loadFeedbacks() {
    setIsLoadingFeedbacks(true);
    try {
      const filters: FeedbackFilters = {};
      if (filterMeal !== "all") {
        filters.meal_type = filterMeal as 'breakfast' | 'lunch' | 'snacks' | 'dinner';
      }
      if (filterRating !== "all") {
        filters.rating = parseInt(filterRating);
      }
      if (showPhotosOnly) {
        filters.has_photos = true;
      }
      
      const hostelFilter = userRole === 'admin' ? null : hostelName;
      const result = await getFeedbacks(hostelFilter, filters, currentPage, 20);
      setFeedbacks(result.data);
      setTotalFeedbacks(result.total);
    } catch (error) {
      console.error('[MessManagement] Error loading feedbacks:', error);
      toast.error("Failed to load feedbacks");
    } finally {
      setIsLoadingFeedbacks(false);
    }
  }

  async function loadAnalytics() {
    try {
      const hostelFilter = userRole === 'admin' ? null : hostelName;
      const [stats, lowRated] = await Promise.all([
        getFeedbackStats(hostelFilter, 30),
        getLowRatedMeals(hostelFilter, 30, 5)
      ]);
      setFeedbackStats(stats);
      setLowRatedMeals(lowRated);
    } catch (error) {
      console.error('[MessManagement] Error loading analytics:', error);
    }
  }

  const handleUploadWeeklyMenu = async () => {
    // Validate that all fields are filled
    const allDaysFilled = Object.values(weeklyMenuData).every((day) =>
      Object.values(day).every((meal) => meal.trim() !== "")
    );

    if (!allDaysFilled) {
      toast.error("Please fill in all meals for all days");
      return;
    }

    if (!menuPhoto) {
      toast.error("Please upload a menu card image");
      return;
    }

    setIsUploadingMenu(true);
    try {
      // Upload the menu image first
      const imageResult = await uploadMenuImage(menuPhoto, hostelName);
      if (!imageResult.url) {
        throw new Error(imageResult.error || "Failed to upload menu image");
      }

      // Parse the menu data into Record<string, DayMenu> format
      const meals: Record<string, { breakfast: string[]; lunch: string[]; snacks: string[]; dinner: string[] }> = {};
      
      Object.entries(weeklyMenuData).forEach(([day, dayMeals]) => {
        meals[day] = {
          breakfast: dayMeals.breakfast.split(',').map(item => item.trim()).filter(Boolean),
          lunch: dayMeals.lunch.split(',').map(item => item.trim()).filter(Boolean),
          snacks: dayMeals.snacks.split(',').map(item => item.trim()).filter(Boolean),
          dinner: dayMeals.dinner.split(',').map(item => item.trim()).filter(Boolean),
        };
      });

      // Get week start date (Monday of current week)
      const now = new Date();
      const dayOfWeek = now.getDay();
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const monday = new Date(now);
      monday.setDate(now.getDate() + mondayOffset);
      const weekStartDate = monday.toISOString().split('T')[0];

      // Create the weekly menu
      const result = await createWeeklyMenu({
        hostel_name: hostelName,
        week_start_date: weekStartDate,
        menu_image_url: imageResult.url,
        meals
      });

      if (result.success) {
        toast.success("Weekly menu uploaded successfully!");
        setShowUploadForm(false);
        loadMenu(); // Reload menu
      } else {
        toast.error(result.error || "Failed to create menu");
      }
    } catch (error) {
      console.error('[MessManagement] Error uploading menu:', error);
      toast.error("Failed to upload menu");
    } finally {
      setIsUploadingMenu(false);
    }
  };

  const handleUpdateMenu = (day: string, mealType: string, value: string) => {
    setWeeklyMenuData((prev) => ({
      ...prev,
      [day]: {
        ...prev[day as keyof typeof prev],
        [mealType]: value,
      },
    }));
  };

  const handleCreateNewMenu = () => {
    setShowUploadForm(true);
    setWeeklyMenuData({
      monday: { breakfast: "", lunch: "", snacks: "", dinner: "" },
      tuesday: { breakfast: "", lunch: "", snacks: "", dinner: "" },
      wednesday: { breakfast: "", lunch: "", snacks: "", dinner: "" },
      thursday: { breakfast: "", lunch: "", snacks: "", dinner: "" },
      friday: { breakfast: "", lunch: "", snacks: "", dinner: "" },
      saturday: { breakfast: "", lunch: "", snacks: "", dinner: "" },
      sunday: { breakfast: "", lunch: "", snacks: "", dinner: "" },
    });
    setMenuPhoto(null);
  };

  const handleExportFeedback = () => {
    // Generate CSV export
    const headers = ['Date', 'Meal', 'Student', 'Overall', 'Taste', 'Quantity', 'Quality', 'Cleanliness', 'Comments', 'Status'];
    const rows = feedbacks.map(f => [
      new Date(f.created_at).toLocaleDateString(),
      f.meal_type,
      f.student?.full_name || 'Unknown',
      f.overall_rating,
      f.taste_rating || '-',
      f.quantity_rating || '-',
      f.quality_rating || '-',
      f.cleanliness_rating || '-',
      f.comments || '',
      f.status
    ]);
    
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mess-feedback-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success("Feedback exported successfully!");
  };

  const handleMarkReviewed = async (id: string, reply?: string) => {
    setIsSubmittingReply(true);
    try {
      const result = await markFeedbackReviewed(id, reply);
      if (result.success) {
        toast.success("Feedback marked as reviewed");
        loadFeedbacks(); // Reload
        setReplyText("");
        setReplyingTo(null);
      } else {
        toast.error(result.error || "Failed to update feedback");
      }
    } catch (error) {
      console.error('[MessManagement] Error marking reviewed:', error);
      toast.error("Failed to update feedback");
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5 sm:gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-3 w-3 sm:h-4 sm:w-4 ${
              star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  // Calculate average rating from the actual feedback list being displayed
  const averageRating = feedbacks.length > 0
    ? (feedbacks.reduce((sum, f) => sum + f.overall_rating, 0) / feedbacks.length).toFixed(1)
    : "0.0";
  
  const satisfactionPercent = feedbacks.length > 0
    ? Math.round((parseFloat(averageRating) / 5) * 100)
    : 0;
  
  const pendingCount = feedbacks.filter(f => f.status === 'pending').length;

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
        <div className="mb-6 sm:mb-8 md:mb-12 animate-fade-in">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-1 sm:mb-2" style={{ color: '#014b89' }}>
            Mess Management
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-gray-600">
            {userRole === "admin" ? "Admin Dashboard" : "Manage menu and view feedback"}
          </p>
        </div>

        {/* Tabs - Mobile Optimized */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
          <TabsList className={`grid w-full ${userRole === "admin" ? "grid-cols-3" : "grid-cols-2"} h-11 sm:h-12 bg-gray-100`}>
            {userRole === "admin" && (
              <TabsTrigger 
                value="overview"
                className="text-xs sm:text-sm font-semibold data-[state=active]:bg-white"
              >
                <Activity className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Overview</span>
                <span className="sm:hidden">Stats</span>
              </TabsTrigger>
            )}
            <TabsTrigger 
              value="menu"
              className="text-xs sm:text-sm font-semibold data-[state=active]:bg-white"
            >
              <FileText className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">{userRole === "admin" ? "View Menu" : "Update Menu"}</span>
              <span className="sm:hidden">Menu</span>
            </TabsTrigger>
            <TabsTrigger 
              value="feedback"
              className="text-xs sm:text-sm font-semibold data-[state=active]:bg-white"
            >
              <MessageSquare className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Feedbacks</span>
              <span className="sm:hidden">Feedback</span>
            </TabsTrigger>
          </TabsList>

          {/* Admin Overview Tab - Mobile Optimized */}
          {userRole === "admin" && (
            <TabsContent value="overview" className="space-y-4 sm:space-y-6 mt-0">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-white border-2 border-gray-100 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 hover:shadow-xl transition-all">
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <p className="text-[10px] sm:text-xs md:text-sm font-semibold text-gray-600 uppercase">Avg Rating</p>
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(234, 179, 8, 0.1)' }}>
                      <Star className="h-3 w-3 sm:h-4 sm:w-4" style={{ color: '#eab308' }} />
                    </div>
                  </div>
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold" style={{ color: '#014b89' }}>{averageRating}/5</div>
                  <p className="text-[10px] sm:text-xs text-gray-500 mt-1">Last 30 days</p>
                </div>

                <div className="bg-white border-2 border-gray-100 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 hover:shadow-xl transition-all">
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <p className="text-[10px] sm:text-xs md:text-sm font-semibold text-gray-600 uppercase">Feedbacks</p>
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(1, 75, 137, 0.1)' }}>
                      <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4" style={{ color: '#014b89' }} />
                    </div>
                  </div>
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold" style={{ color: '#014b89' }}>{feedbackStats?.total_count || 0}</div>
                  <p className="text-[10px] sm:text-xs text-gray-500 mt-1">Last 30 days</p>
                </div>

                <div className="bg-white border-2 border-gray-100 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 hover:shadow-xl transition-all">
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <p className="text-[10px] sm:text-xs md:text-sm font-semibold text-gray-600 uppercase">Satisfaction</p>
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
                      <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" style={{ color: '#10b981' }} />
                    </div>
                  </div>
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold" style={{ color: '#10b981' }}>{satisfactionPercent}%</div>
                  <p className="text-[10px] sm:text-xs text-gray-500 mt-1">Based on ratings</p>
                </div>

                <div className="bg-white border-2 border-gray-100 rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 hover:shadow-xl transition-all">
                  <div className="flex items-center justify-between mb-2 sm:mb-3">
                    <p className="text-[10px] sm:text-xs md:text-sm font-semibold text-gray-600 uppercase">Pending</p>
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(242, 105, 24, 0.1)' }}>
                      <Activity className="h-3 w-3 sm:h-4 sm:w-4" style={{ color: '#f26918' }} />
                    </div>
                  </div>
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold" style={{ color: '#f26918' }}>
                    {pendingCount}
                  </div>
                  <p className="text-[10px] sm:text-xs text-gray-500 mt-1">Needs attention</p>
                </div>
              </div>

              {/* Rating Trend Graph */}
              <div className="bg-white border-2 border-gray-100 rounded-2xl sm:rounded-3xl shadow-lg overflow-hidden">
                <div className="p-4 sm:p-6 md:p-8">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-1 sm:mb-2" style={{ color: '#014b89' }}>
                    Rating Trends (Last 30 Days)
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6">Daily average ratings over time</p>
                  <div className="h-40 sm:h-48 md:h-56 flex items-center justify-center text-gray-400">
                    <BarChart3 className="h-12 w-12 sm:h-16 sm:w-16 opacity-20" />
                    <span className="ml-3 sm:ml-4 text-xs sm:text-sm">Graph visualization would go here</span>
                  </div>
                </div>
              </div>

              {/* Low-Rated Meals */}
              <div className="bg-white border-2 border-gray-100 rounded-2xl sm:rounded-3xl shadow-lg overflow-hidden">
                <div className="p-4 sm:p-6 md:p-8">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-1 sm:mb-2" style={{ color: '#014b89' }}>
                    Low-Rated Meals
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6">Meals that need improvement (under 3.5 stars)</p>
                  {lowRatedMeals.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-green-500" />
                      <p className="font-medium">Great news! No low-rated meals found.</p>
                    </div>
                  ) : (
                    <div className="space-y-2 sm:space-y-3">
                      {lowRatedMeals.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center p-2 sm:p-3 rounded-lg bg-gray-50">
                          <div>
                            <span className="text-sm sm:text-base font-medium text-gray-900 capitalize">{item.meal_type}</span>
                            <span className="text-xs text-gray-500 ml-2">{new Date(item.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1 sm:gap-2">
                            <span className="text-base sm:text-lg font-bold" style={{ color: item.avg_rating < 2 ? '#ef4444' : '#f26918' }}>
                              {item.avg_rating.toFixed(1)}
                            </span>
                            <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4" style={{ color: item.avg_rating < 2 ? '#ef4444' : '#f26918' }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Reports */}
              <div className="bg-white border-2 border-gray-100 rounded-2xl sm:rounded-3xl shadow-lg overflow-hidden">
                <div className="p-4 sm:p-6 md:p-8">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-1 sm:mb-2" style={{ color: '#014b89' }}>
                    Reports
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6">Download comprehensive mess reports</p>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                    <Button 
                      variant="outline"
                      onClick={handleExportFeedback}
                      className="border-2 font-semibold h-10 sm:h-11 text-xs sm:text-sm"
                      style={{ borderColor: '#014b89', color: '#014b89' }}
                    >
                      <Download className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Download Monthly Report (PDF)</span>
                      <span className="sm:hidden">Monthly Report</span>
                    </Button>
                    <Button 
                      variant="outline"
                      className="border-2 font-semibold h-10 sm:h-11 text-xs sm:text-sm"
                      style={{ borderColor: '#014b89', color: '#014b89' }}
                    >
                      <BarChart3 className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Compare Month-by-Month</span>
                      <span className="sm:hidden">Compare</span>
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          )}

          {/* Menu Tab - Mobile Optimized */}
          <TabsContent value="menu" className="space-y-4 sm:space-y-6 mt-0">
            {isLoadingMenu ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin" style={{ color: '#014b89' }} />
                <span className="ml-3 text-gray-600">Loading menu...</span>
              </div>
            ) : userRole === "caretaker" ? (
              /* Caretaker View */
              <div className="space-y-4 sm:space-y-6">
                {!weeklyMenu || showUploadForm ? (
                  /* Upload New Menu Form */
                  <div className="bg-white border-2 border-gray-100 rounded-2xl sm:rounded-3xl shadow-lg overflow-hidden">
                    <div className="p-4 sm:p-6 md:p-8">
                      <div className="flex items-center justify-between mb-6 sm:mb-8">
                        <div>
                          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2" style={{ color: '#014b89' }}>
                            Create Weekly Menu
                          </h2>
                          <p className="text-xs sm:text-sm md:text-base text-gray-600">
                            Upload complete week's menu with all meals
                          </p>
                        </div>
                        {showUploadForm && weeklyMenu && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowUploadForm(false)}
                            className="border-2 font-semibold h-9 sm:h-10 text-xs sm:text-sm"
                          >
                            Cancel
                          </Button>
                        )}
                      </div>

                      {/* Upload Menu Image First */}
                      <div className="mb-8 p-6 border-2 border-dashed rounded-2xl" style={{ borderColor: '#014b89' }}>
                        <div className="text-center">
                          <Upload className="mx-auto h-12 w-12 mb-4" style={{ color: '#014b89' }} />
                          <Label className="text-base font-bold mb-2 block" style={{ color: '#014b89' }}>
                            Upload Weekly Menu Card Image *
                          </Label>
                          <p className="text-xs sm:text-sm text-gray-600 mb-4">
                            This image will be shown to students for download
                          </p>
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setMenuPhoto(e.target.files?.[0] || null)}
                            className="border-2 border-gray-200 rounded-xl h-11 text-sm max-w-md mx-auto"
                          />
                          {menuPhoto && (
                            <p className="text-sm text-green-600 mt-3 font-semibold">
                              ✓ {menuPhoto.name} selected
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Days Grid */}
                      <div className="space-y-6">
                        {Object.keys(weeklyMenuData).map((day) => (
                          <div
                            key={day}
                            className="border-2 border-gray-200 rounded-xl sm:rounded-2xl overflow-hidden"
                          >
                            <div className="p-4 sm:p-5 border-b-2 border-gray-100" style={{ background: 'rgba(1, 75, 137, 0.05)' }}>
                              <h3 className="text-base sm:text-lg font-bold capitalize" style={{ color: '#014b89' }}>
                                {day}
                              </h3>
                            </div>
                            <div className="p-4 sm:p-5 md:p-6">
                              <div className="grid sm:grid-cols-2 gap-4">
                                {["breakfast", "lunch", "snacks", "dinner"].map((mealType) => (
                                  <div key={mealType} className="space-y-2">
                                    <Label className="capitalize text-sm font-bold flex items-center gap-2">
                                      <span style={{ color: '#f26918' }}>{mealType}</span>
                                      <span className="text-[10px] text-gray-500">(comma separated)</span>
                                    </Label>
                                    <Textarea
                                      placeholder="e.g., Idli, Sambar, Chutney, Tea"
                                      value={weeklyMenuData[day as keyof typeof weeklyMenuData][mealType as keyof (typeof weeklyMenuData)["monday"]]}
                                      onChange={(e) => handleUpdateMenu(day, mealType, e.target.value)}
                                      rows={2}
                                      className="border-2 border-gray-200 rounded-xl text-sm sm:text-base"
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Submit Button */}
                      <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                        <Button
                          onClick={handleUploadWeeklyMenu}
                          disabled={isUploadingMenu}
                          className="text-white font-bold h-12 rounded-xl text-base px-8"
                          style={{ background: '#014b89' }}
                        >
                          {isUploadingMenu ? (
                            <>
                              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="mr-2 h-5 w-5" />
                              Upload Weekly Menu
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Display Existing Menu in Calendar View */
                  <div className="bg-white border-2 border-gray-100 rounded-2xl sm:rounded-3xl shadow-lg overflow-hidden">
                    <div className="p-4 sm:p-6 md:p-8">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
                        <div className="flex-1">
                          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2" style={{ color: '#014b89' }}>
                            Current Week's Menu
                          </h2>
                          <p className="text-xs sm:text-sm md:text-base text-gray-600">
                            View and manage the weekly menu
                          </p>
                        </div>
                        <Button
                          onClick={handleCreateNewMenu}
                          className="text-white font-bold h-10 sm:h-11 rounded-xl text-sm"
                          style={{ background: '#f26918' }}
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          Create New Week Menu
                        </Button>
                      </div>

                      {/* Current Menu Image */}
                      {weeklyMenu.menu_image_url && (
                        <div className="mb-6 p-4 sm:p-6 rounded-xl border-2" style={{ background: 'rgba(242, 105, 24, 0.05)', borderColor: 'rgba(242, 105, 24, 0.2)' }}>
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-base sm:text-lg font-bold" style={{ color: '#f26918' }}>
                              Menu Card Image
                            </h3>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => weeklyMenu.menu_image_url && window.open(weeklyMenu.menu_image_url, '_blank')}
                              className="border-2 font-semibold h-8 sm:h-9 text-xs sm:text-sm"
                              style={{ borderColor: '#10b981', color: '#10b981' }}
                            >
                              <Download className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                              Download
                            </Button>
                          </div>
                          <p className="text-xs sm:text-sm text-gray-600">
                            Students can download this menu card from their dashboard
                          </p>
                        </div>
                      )}

                      {/* Calendar View of Menu */}
                      <div className="space-y-4">
                        {(['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const).map((day) => {
                          const dayMenu = weeklyMenu.meals[day];
                          if (!dayMenu) return null;
                          
                          const hasItems = dayMenu.breakfast.length > 0 || dayMenu.lunch.length > 0 || 
                                          dayMenu.snacks.length > 0 || dayMenu.dinner.length > 0;
                          if (!hasItems) return null;

                          return (
                            <div
                              key={day}
                              className="bg-white border-2 border-gray-200 rounded-xl sm:rounded-2xl overflow-hidden hover:shadow-md transition-shadow"
                            >
                              <div className="p-4 sm:p-5 border-b-2 border-gray-100 flex items-center justify-between">
                                <h3 className="text-base sm:text-lg md:text-xl font-bold capitalize" style={{ color: '#014b89' }}>
                                  {day}
                                </h3>
                                <Badge className="text-xs font-bold px-3 py-1" style={{ background: 'rgba(1, 75, 137, 0.1)', color: '#014b89' }}>
                                  {day === new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() ? "Today" : "Scheduled"}
                                </Badge>
                              </div>
                              <div className="p-4 sm:p-5 md:p-6">
                                <div className="grid sm:grid-cols-2 gap-4">
                                  {(['breakfast', 'lunch', 'snacks', 'dinner'] as const).map((mealType) => {
                                    const items = dayMenu[mealType];
                                    if (!items || items.length === 0) return null;
                                    
                                    return (
                                      <div key={mealType} className="bg-gray-50 rounded-xl p-4">
                                        <h4 className="font-bold capitalize mb-3 text-sm sm:text-base" style={{ color: '#f26918' }}>
                                          {mealType}
                                        </h4>
                                        <ul className="space-y-1.5">
                                          {items.map((item, idx) => (
                                            <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm">
                                              <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: '#014b89' }} />
                                              <span className="text-gray-700 font-medium">{item}</span>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Menu Info Footer */}
                      <div className="mt-6 p-4 sm:p-5 rounded-xl border-2 border-gray-200" style={{ background: 'rgba(16, 185, 129, 0.05)' }}>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div>
                            <p className="text-xs sm:text-sm font-medium text-gray-700 mb-1">
                              <strong>Last Updated:</strong> {new Date(weeklyMenu.updated_at).toLocaleString()}
                            </p>
                            <p className="text-xs sm:text-sm font-medium text-gray-700">
                              <strong>Week Period:</strong> {new Date(weeklyMenu.week_start_date).toLocaleDateString()} - {new Date(weeklyMenu.week_end_date).toLocaleDateString()}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCreateNewMenu}
                            className="border-2 font-semibold h-9 text-xs sm:text-sm"
                            style={{ borderColor: '#014b89', color: '#014b89' }}
                          >
                            <Edit className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                            Create New Menu
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Admin View */
              <div className="bg-white border-2 border-gray-100 rounded-2xl sm:rounded-3xl shadow-lg overflow-hidden">
                <div className="p-4 sm:p-6 md:p-8">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
                    <div className="flex-1">
                      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2" style={{ color: '#014b89' }}>
                        Weekly Menu
                      </h2>
                      <p className="text-xs sm:text-sm md:text-base text-gray-600">
                        View current week's menu and caretaker updates
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={loadMenu}
                      className="border-2 font-semibold h-9 text-xs sm:text-sm"
                      style={{ borderColor: '#014b89', color: '#014b89' }}
                    >
                      <RefreshCw className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                      Refresh
                    </Button>
                  </div>

                  {!weeklyMenu ? (
                    <div className="text-center py-12 text-gray-500">
                      <AlertCircle className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                      <p className="font-medium">No menu uploaded for this week</p>
                      <p className="text-sm mt-1">Caretaker needs to upload the weekly menu</p>
                    </div>
                  ) : (
                    <>
                      {/* Menu Cards */}
                      <div className="space-y-4">
                        {(['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const).map((day) => {
                          const dayMenu = weeklyMenu.meals[day];
                          if (!dayMenu) return null;
                          
                          const hasItems = dayMenu.breakfast.length > 0 || dayMenu.lunch.length > 0 || 
                                          dayMenu.snacks.length > 0 || dayMenu.dinner.length > 0;
                          if (!hasItems) return null;

                          return (
                            <div
                              key={day}
                              className="bg-white border-2 border-gray-200 rounded-xl sm:rounded-2xl overflow-hidden"
                            >
                              <div className="p-4 sm:p-5 md:p-6 border-b-2 border-gray-100">
                                <div className="flex items-center justify-between">
                                  <h3 className="text-base sm:text-lg md:text-xl font-bold capitalize" style={{ color: '#014b89' }}>
                                    {day}
                                  </h3>
                                </div>
                              </div>
                              <div className="p-4 sm:p-5 md:p-6">
                                <div className="grid sm:grid-cols-2 gap-4">
                                  {(['breakfast', 'lunch', 'snacks', 'dinner'] as const).map((mealType) => {
                                    const items = dayMenu[mealType];
                                    if (!items || items.length === 0) return null;
                                    
                                    return (
                                      <div key={mealType}>
                                        <h4 className="font-bold capitalize mb-2 text-sm sm:text-base" style={{ color: '#f26918' }}>
                                          {mealType}
                                        </h4>
                                        <ul className="space-y-1">
                                          {items.map((item, idx) => (
                                            <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm">
                                              <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: '#014b89' }} />
                                              <span className="text-gray-700 font-medium">{item}</span>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Admin Info */}
                      <div className="mt-6 p-4 sm:p-5 rounded-xl border-2 border-gray-200" style={{ background: 'rgba(1, 75, 137, 0.05)' }}>
                        <p className="text-xs sm:text-sm font-medium text-gray-700 mb-1">
                          <strong>Last Updated:</strong> {new Date(weeklyMenu.updated_at).toLocaleString()}
                        </p>
                        <p className="text-xs sm:text-sm font-medium text-gray-700">
                          <strong>Week Period:</strong> {new Date(weeklyMenu.week_start_date).toLocaleDateString()} - {new Date(weeklyMenu.week_end_date).toLocaleDateString()}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </TabsContent>

          {/* Feedback Tab - Mobile Optimized */}
          <TabsContent value="feedback" className="space-y-4 sm:space-y-6 mt-0">
            <div className="bg-white border-2 border-gray-100 rounded-2xl sm:rounded-3xl shadow-lg overflow-hidden">
              <div className="p-4 sm:p-6 md:p-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
                  <div className="flex-1">
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2" style={{ color: '#014b89' }}>
                      Student Feedbacks
                    </h2>
                    <p className="text-xs sm:text-sm md:text-base text-gray-600">
                      View and manage all student feedback submissions
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={loadFeedbacks}
                      className="border-2 font-semibold h-9 sm:h-10 text-xs sm:text-sm"
                      style={{ borderColor: '#014b89', color: '#014b89' }}
                    >
                      <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleExportFeedback}
                      disabled={feedbacks.length === 0}
                      className="border-2 font-semibold h-9 sm:h-10 text-xs sm:text-sm"
                      style={{ borderColor: '#10b981', color: '#10b981' }}
                    >
                      <Download className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Export CSV</span>
                      <span className="sm:hidden">Export</span>
                    </Button>
                  </div>
                </div>

                {/* Filters - Mobile Optimized */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" style={{ color: '#014b89' }} />
                    <Label className="text-sm font-bold">Filters:</Label>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:flex md:flex-wrap gap-2 sm:gap-3">
                    <Select value={filterMeal} onValueChange={setFilterMeal}>
                      <SelectTrigger className="h-9 sm:h-10 border-2 border-gray-200 rounded-xl text-xs sm:text-sm">
                        <SelectValue placeholder="Meal Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Meals</SelectItem>
                        <SelectItem value="breakfast">Breakfast</SelectItem>
                        <SelectItem value="lunch">Lunch</SelectItem>
                        <SelectItem value="snacks">Snacks</SelectItem>
                        <SelectItem value="dinner">Dinner</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={filterRating} onValueChange={setFilterRating}>
                      <SelectTrigger className="h-9 sm:h-10 border-2 border-gray-200 rounded-xl text-xs sm:text-sm">
                        <SelectValue placeholder="Rating" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Ratings</SelectItem>
                        <SelectItem value="1">1 Star</SelectItem>
                        <SelectItem value="2">2 Stars</SelectItem>
                        <SelectItem value="3">3 Stars</SelectItem>
                        <SelectItem value="4">4 Stars</SelectItem>
                        <SelectItem value="5">5 Stars</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                      variant={showPhotosOnly ? "default" : "outline"}
                      size="sm"
                      onClick={() => setShowPhotosOnly(!showPhotosOnly)}
                      className="col-span-2 sm:col-span-1 border-2 font-semibold h-9 sm:h-10 text-xs sm:text-sm"
                      style={showPhotosOnly ? { background: '#014b89' } : { borderColor: '#014b89', color: '#014b89' }}
                    >
                      <ImageIcon className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                      With Photos Only
                    </Button>
                  </div>
                </div>

                {/* Average Rating Display */}
                <div className="mb-6 p-4 sm:p-5 rounded-xl border-2 border-gray-200" style={{ background: 'rgba(242, 105, 24, 0.05)' }}>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
                    <div>
                      <p className="text-xs sm:text-sm text-gray-600 font-semibold mb-2">Average Rating</p>
                      <div className="flex items-center gap-2 sm:gap-3">
                        <span className="text-3xl sm:text-4xl font-bold" style={{ color: '#014b89' }}>{averageRating}</span>
                        {renderStars(Math.round(parseFloat(averageRating)))}
                      </div>
                    </div>
                    <div className="sm:text-right">
                      <p className="text-xs sm:text-sm text-gray-600 font-semibold mb-2">Total Feedbacks</p>
                      <span className="text-3xl sm:text-4xl font-bold" style={{ color: '#f26918' }}>{totalFeedbacks}</span>
                    </div>
                  </div>
                </div>

                {/* Loading State */}
                {isLoadingFeedbacks && (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin" style={{ color: '#014b89' }} />
                    <span className="ml-3 text-gray-600">Loading feedbacks...</span>
                  </div>
                )}

                {/* Empty State */}
                {!isLoadingFeedbacks && feedbacks.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                    <p className="font-medium">No feedbacks found</p>
                    <p className="text-sm mt-1">Try adjusting your filters</p>
                  </div>
                )}

                {/* Mobile Card View */}
                {!isLoadingFeedbacks && feedbacks.length > 0 && (
                  <div className="block lg:hidden space-y-3">
                    {feedbacks.map((feedback) => (
                      <div
                        key={feedback.id}
                        className="border-2 rounded-xl p-4"
                        style={{ 
                          borderColor: feedback.overall_rating <= 2 ? 'rgba(239, 68, 68, 0.3)' : '#e5e7eb',
                          background: feedback.overall_rating <= 2 ? 'rgba(239, 68, 68, 0.05)' : 'white'
                        }}
                      >
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900 text-sm mb-1">{feedback.student?.full_name || 'Unknown'}</h3>
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge 
                                className="text-[10px] font-bold px-2 py-0.5 border-2 capitalize"
                                style={{ 
                                  background: 'rgba(1, 75, 137, 0.1)',
                                  color: '#014b89',
                                  borderColor: 'rgba(1, 75, 137, 0.3)'
                                }}
                              >
                                {feedback.meal_type}
                              </Badge>
                              <span className="text-xs text-gray-600">{new Date(feedback.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <Badge
                            className="text-[10px] font-bold px-2 py-1 border-2 shrink-0"
                            style={
                              feedback.status === 'reviewed'
                                ? { background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.3)' }
                                : { background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }
                            }
                          >
                            {feedback.status === 'reviewed' ? "Done" : "Pending"}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-lg font-bold" style={{ color: '#014b89' }}>{feedback.overall_rating}</span>
                          {renderStars(feedback.overall_rating)}
                        </div>

                        {feedback.comments && (
                          <p className="text-xs text-gray-700 mb-3 line-clamp-2">{feedback.comments}</p>
                        )}

                        <div className="flex items-center gap-2">
                          {feedback.status !== 'reviewed' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleMarkReviewed(feedback.id)}
                              disabled={isSubmittingReply}
                              className="flex-1 border-2 font-semibold h-8 text-xs"
                              style={{ borderColor: '#10b981', color: '#10b981' }}
                            >
                              <CheckCircle2 className="mr-1 h-3 w-3" />
                              Mark Reviewed
                            </Button>
                          )}
                          {feedback.photos && feedback.photos.length > 0 && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-2 h-8 px-3"
                                  style={{ borderColor: '#014b89', color: '#014b89' }}
                                >
                                  <ImageIcon className="h-3 w-3" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="w-[calc(100%-2rem)] max-w-2xl mx-auto">
                                <DialogHeader>
                                  <DialogTitle className="text-base">Feedback Photos</DialogTitle>
                                </DialogHeader>
                                {loadingPhotoUrls ? (
                                  <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-6 w-6 animate-spin" style={{ color: '#014b89' }} />
                                    <span className="ml-2 text-sm text-gray-600">Loading photos...</span>
                                  </div>
                                ) : (
                                  <div className="grid grid-cols-2 gap-2">
                                    {feedback.photos.map((photo, idx) => {
                                      const signedUrl = photo.photo_url ? photoSignedUrls[photo.photo_url] : null;
                                      return signedUrl ? (
                                        <img
                                          key={idx}
                                          src={signedUrl}
                                          alt={`Feedback photo ${idx + 1}`}
                                          className="w-full h-auto rounded-lg"
                                        />
                                      ) : (
                                        <div key={idx} className="flex items-center justify-center bg-gray-100 rounded-lg p-4">
                                          <AlertCircle className="h-6 w-6 text-gray-400" />
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                          )}
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setReplyingTo(feedback.id)}
                                className="border-2 h-8 px-3"
                                style={{ borderColor: '#f26918', color: '#f26918' }}
                              >
                                <Reply className="h-3 w-3" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="w-[calc(100%-2rem)] max-w-lg mx-auto">
                              <DialogHeader>
                                <DialogTitle className="text-base">Reply to Feedback</DialogTitle>
                                <DialogDescription className="text-xs">
                                  Send a response to {feedback.student?.full_name || 'student'}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label className="text-sm font-bold">Your Reply</Label>
                                  <Textarea
                                    placeholder="Type your response..."
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    rows={4}
                                    className="border-2 border-gray-200 rounded-xl text-sm mt-2"
                                  />
                                </div>
                                <Button 
                                  onClick={() => handleMarkReviewed(feedback.id, replyText)}
                                  disabled={isSubmittingReply}
                                  className="w-full text-white font-bold h-10 rounded-xl text-sm"
                                  style={{ background: '#014b89' }}
                                >
                                  {isSubmittingReply ? (
                                    <>
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                      Sending...
                                    </>
                                  ) : (
                                    "Send Reply"
                                  )}
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Desktop Table View */}
                {!isLoadingFeedbacks && feedbacks.length > 0 && (
                  <div className="hidden lg:block border-2 border-gray-200 rounded-xl overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-b-2 border-gray-200">
                          <TableHead className="font-bold text-gray-600 text-xs uppercase">Date</TableHead>
                          <TableHead className="font-bold text-gray-600 text-xs uppercase">Meal</TableHead>
                          <TableHead className="font-bold text-gray-600 text-xs uppercase">Student</TableHead>
                          <TableHead className="font-bold text-gray-600 text-xs uppercase">Rating</TableHead>
                          <TableHead className="font-bold text-gray-600 text-xs uppercase">Comments</TableHead>
                          <TableHead className="font-bold text-gray-600 text-xs uppercase">Photos</TableHead>
                          <TableHead className="font-bold text-gray-600 text-xs uppercase">Status</TableHead>
                          <TableHead className="font-bold text-gray-600 text-xs uppercase">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {feedbacks.map((feedback) => (
                          <TableRow
                            key={feedback.id}
                            className="border-b border-gray-100 hover:bg-gray-50"
                            style={{ background: feedback.overall_rating <= 2 ? 'rgba(239, 68, 68, 0.05)' : 'white' }}
                          >
                            <TableCell className="text-sm">{new Date(feedback.created_at).toLocaleDateString()}</TableCell>
                            <TableCell>
                              <Badge 
                                className="text-xs font-bold px-2 py-1 border-2 capitalize"
                                style={{ 
                                  background: 'rgba(1, 75, 137, 0.1)',
                                  color: '#014b89',
                                  borderColor: 'rgba(1, 75, 137, 0.3)'
                                }}
                              >
                                {feedback.meal_type}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm font-semibold">{feedback.student?.full_name || 'Unknown'}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span className="font-bold" style={{ color: '#014b89' }}>{feedback.overall_rating}</span>
                                {renderStars(feedback.overall_rating)}
                              </div>
                            </TableCell>
                            <TableCell className="max-w-xs truncate text-sm">{feedback.comments || '-'}</TableCell>
                            <TableCell>
                              {feedback.photos && feedback.photos.length > 0 && (
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <ImageIcon className="h-4 w-4" style={{ color: '#014b89' }} />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-2xl">
                                    <DialogHeader>
                                      <DialogTitle>Feedback Photos</DialogTitle>
                                    </DialogHeader>
                                    {loadingPhotoUrls ? (
                                      <div className="flex items-center justify-center py-8">
                                        <Loader2 className="h-6 w-6 animate-spin" style={{ color: '#014b89' }} />
                                        <span className="ml-2 text-sm text-gray-600">Loading photos...</span>
                                      </div>
                                    ) : (
                                      <div className="grid grid-cols-2 gap-2">
                                        {feedback.photos.map((photo, idx) => {
                                          const signedUrl = photo.photo_url ? photoSignedUrls[photo.photo_url] : null;
                                          return signedUrl ? (
                                            <img
                                              key={idx}
                                              src={signedUrl}
                                              alt={`Feedback photo ${idx + 1}`}
                                              className="w-full h-auto rounded-lg"
                                            />
                                          ) : (
                                            <div key={idx} className="flex items-center justify-center bg-gray-100 rounded-lg p-4">
                                              <AlertCircle className="h-6 w-6 text-gray-400" />
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </DialogContent>
                                </Dialog>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge
                                className="text-xs font-bold px-2 py-1 border-2"
                                style={
                                  feedback.status === 'reviewed'
                                    ? { background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.3)' }
                                    : { background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }
                                }
                              >
                                {feedback.status === 'reviewed' ? (
                                  <>
                                    <CheckCircle2 className="mr-1 h-3 w-3 inline" />
                                    Reviewed
                                  </>
                                ) : (
                                  "Pending"
                                )}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                {feedback.status !== 'reviewed' && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleMarkReviewed(feedback.id)}
                                    disabled={isSubmittingReply}
                                    className="border-2 h-8 px-3"
                                    style={{ borderColor: '#10b981', color: '#10b981' }}
                                  >
                                    <CheckCircle2 className="h-4 w-4" />
                                  </Button>
                                )}
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => setReplyingTo(feedback.id)}
                                      className="border-2 h-8 px-3"
                                      style={{ borderColor: '#f26918', color: '#f26918' }}
                                    >
                                      <Reply className="h-4 w-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Reply to Feedback</DialogTitle>
                                      <DialogDescription>
                                        Send a response to {feedback.student?.full_name || 'student'}
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <div>
                                        <Label>Your Reply</Label>
                                        <Textarea
                                          placeholder="Type your response..."
                                          value={replyText}
                                          onChange={(e) => setReplyText(e.target.value)}
                                          rows={4}
                                          className="border-2 border-gray-200 rounded-xl mt-2"
                                        />
                                      </div>
                                      <Button 
                                        onClick={() => handleMarkReviewed(feedback.id, replyText)}
                                        disabled={isSubmittingReply}
                                        className="w-full text-white font-bold h-11 rounded-xl"
                                        style={{ background: '#014b89' }}
                                      >
                                        {isSubmittingReply ? (
                                          <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Sending...
                                          </>
                                        ) : (
                                          "Send Reply"
                                        )}
                                      </Button>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </div>

            {/* Trend Graph */}
            <div className="bg-white border-2 border-gray-100 rounded-2xl sm:rounded-3xl shadow-lg overflow-hidden">
              <div className="p-4 sm:p-6 md:p-8">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-1 sm:mb-2" style={{ color: '#014b89' }}>
                  Rating Trends Over Time
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6">Track how ratings change over the past month</p>
                <div className="h-40 sm:h-48 md:h-56 flex items-center justify-center text-gray-400">
                  <TrendingUp className="h-12 w-12 sm:h-16 sm:w-16 opacity-20" />
                  <span className="ml-3 sm:ml-4 text-xs sm:text-sm">Trend graph visualization would go here</span>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
