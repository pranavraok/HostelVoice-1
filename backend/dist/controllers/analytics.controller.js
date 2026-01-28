"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsController = void 0;
const config_1 = require("../config");
const response_1 = require("../utils/response");
const middleware_1 = require("../middleware");
/**
 * Analytics Controller
 * Provides data-driven insights for administrators
 */
class AnalyticsController {
    /**
     * Get overall issue statistics
     * GET /api/analytics/issues-summary
     */
    static async getIssuesSummary(req, res) {
        const { hostel_name, start_date, end_date } = req.query;
        // Base query for issue counts
        let baseQuery = config_1.supabaseAdmin.from('issues').select('id, status, category, priority, created_at, resolved_at');
        if (hostel_name) {
            baseQuery = baseQuery.eq('hostel_name', hostel_name);
        }
        if (start_date) {
            baseQuery = baseQuery.gte('created_at', start_date);
        }
        if (end_date) {
            baseQuery = baseQuery.lte('created_at', end_date);
        }
        const { data: issues, error } = await baseQuery;
        if (error) {
            throw new middleware_1.ApiError(`Failed to fetch analytics: ${error.message}`, 500);
        }
        // Calculate statistics
        const summary = {
            total: issues?.length || 0,
            by_status: {
                pending: 0,
                in_progress: 0,
                resolved: 0,
                closed: 0,
            },
            by_category: {
                maintenance: 0,
                cleanliness: 0,
                security: 0,
                food: 0,
                other: 0,
            },
            by_priority: {
                low: 0,
                medium: 0,
                high: 0,
                urgent: 0,
            },
        };
        issues?.forEach((issue) => {
            // Count by status
            if (issue.status in summary.by_status) {
                summary.by_status[issue.status]++;
            }
            // Count by category
            if (issue.category in summary.by_category) {
                summary.by_category[issue.category]++;
            }
            // Count by priority
            if (issue.priority in summary.by_priority) {
                summary.by_priority[issue.priority]++;
            }
        });
        (0, response_1.sendSuccess)(res, 'Issues summary retrieved', summary);
    }
    /**
     * Get average resolution time
     * GET /api/analytics/resolution-time
     */
    static async getResolutionTime(req, res) {
        const { hostel_name, category, start_date, end_date } = req.query;
        let query = config_1.supabaseAdmin
            .from('issues')
            .select('created_at, resolved_at, category, hostel_name')
            .not('resolved_at', 'is', null);
        if (hostel_name) {
            query = query.eq('hostel_name', hostel_name);
        }
        if (category) {
            query = query.eq('category', category);
        }
        if (start_date) {
            query = query.gte('created_at', start_date);
        }
        if (end_date) {
            query = query.lte('created_at', end_date);
        }
        const { data: issues, error } = await query;
        if (error) {
            throw new middleware_1.ApiError(`Failed to fetch analytics: ${error.message}`, 500);
        }
        if (!issues || issues.length === 0) {
            (0, response_1.sendSuccess)(res, 'No resolved issues found', {
                total_resolved: 0,
                avg_resolution_time_hours: 0,
                avg_resolution_time_days: 0,
                by_category: {},
            });
            return;
        }
        // Calculate average resolution time
        let totalTime = 0;
        const categoryTimes = {};
        issues.forEach((issue) => {
            const created = new Date(issue.created_at).getTime();
            const resolved = new Date(issue.resolved_at).getTime();
            const resolutionTime = resolved - created;
            totalTime += resolutionTime;
            // Track by category
            if (!categoryTimes[issue.category]) {
                categoryTimes[issue.category] = { total: 0, count: 0 };
            }
            categoryTimes[issue.category].total += resolutionTime;
            categoryTimes[issue.category].count++;
        });
        const avgTimeMs = totalTime / issues.length;
        const avgTimeHours = avgTimeMs / (1000 * 60 * 60);
        const avgTimeDays = avgTimeHours / 24;
        // Calculate by category
        const byCategory = {};
        Object.entries(categoryTimes).forEach(([category, data]) => {
            byCategory[category] = {
                avg_hours: Math.round((data.total / data.count / (1000 * 60 * 60)) * 100) / 100,
                count: data.count,
            };
        });
        (0, response_1.sendSuccess)(res, 'Resolution time analytics retrieved', {
            total_resolved: issues.length,
            avg_resolution_time_hours: Math.round(avgTimeHours * 100) / 100,
            avg_resolution_time_days: Math.round(avgTimeDays * 100) / 100,
            by_category: byCategory,
        });
    }
    /**
     * Get issue frequency by category
     * GET /api/analytics/category-frequency
     */
    static async getCategoryFrequency(req, res) {
        const { hostel_name, period = '30' } = req.query;
        const daysBack = parseInt(period) || 30;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - daysBack);
        let query = config_1.supabaseAdmin
            .from('issues')
            .select('category, created_at')
            .gte('created_at', startDate.toISOString());
        if (hostel_name) {
            query = query.eq('hostel_name', hostel_name);
        }
        const { data: issues, error } = await query;
        if (error) {
            throw new middleware_1.ApiError(`Failed to fetch analytics: ${error.message}`, 500);
        }
        // Count by category
        const categoryCounts = {
            maintenance: 0,
            cleanliness: 0,
            security: 0,
            food: 0,
            other: 0,
        };
        issues?.forEach((issue) => {
            if (issue.category in categoryCounts) {
                categoryCounts[issue.category]++;
            }
        });
        // Calculate percentages
        const total = issues?.length || 0;
        const categoryPercentages = {};
        Object.entries(categoryCounts).forEach(([category, count]) => {
            categoryPercentages[category] = {
                count,
                percentage: total > 0 ? Math.round((count / total) * 10000) / 100 : 0,
            };
        });
        (0, response_1.sendSuccess)(res, 'Category frequency retrieved', {
            period_days: daysBack,
            total_issues: total,
            by_category: categoryPercentages,
        });
    }
    /**
     * Get hostel-wise issue density
     * GET /api/analytics/hostel-density
     */
    static async getHostelDensity(req, res) {
        const { status, period = '30' } = req.query;
        const daysBack = parseInt(period) || 30;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - daysBack);
        let query = config_1.supabaseAdmin
            .from('issues')
            .select('hostel_name, status, category')
            .gte('created_at', startDate.toISOString())
            .not('hostel_name', 'is', null);
        if (status) {
            query = query.eq('status', status);
        }
        const { data: issues, error } = await query;
        if (error) {
            throw new middleware_1.ApiError(`Failed to fetch analytics: ${error.message}`, 500);
        }
        // Group by hostel
        const hostelData = {};
        issues?.forEach((issue) => {
            const hostel = issue.hostel_name;
            if (!hostelData[hostel]) {
                hostelData[hostel] = {
                    total: 0,
                    pending: 0,
                    resolved: 0,
                    by_category: {},
                };
            }
            hostelData[hostel].total++;
            if (issue.status === 'pending' || issue.status === 'in_progress') {
                hostelData[hostel].pending++;
            }
            else {
                hostelData[hostel].resolved++;
            }
            if (!hostelData[hostel].by_category[issue.category]) {
                hostelData[hostel].by_category[issue.category] = 0;
            }
            hostelData[hostel].by_category[issue.category]++;
        });
        // Sort by total issues
        const sortedHostels = Object.entries(hostelData)
            .sort(([, a], [, b]) => b.total - a.total)
            .reduce((acc, [hostel, data]) => {
            acc[hostel] = data;
            return acc;
        }, {});
        (0, response_1.sendSuccess)(res, 'Hostel density retrieved', {
            period_days: daysBack,
            total_issues: issues?.length || 0,
            by_hostel: sortedHostels,
        });
    }
    /**
     * Get pending vs resolved statistics over time
     * GET /api/analytics/status-trends
     */
    static async getStatusTrends(req, res) {
        const { hostel_name, period = '30' } = req.query;
        const daysBack = parseInt(period) || 30;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - daysBack);
        let query = config_1.supabaseAdmin
            .from('issues')
            .select('status, created_at, resolved_at')
            .gte('created_at', startDate.toISOString());
        if (hostel_name) {
            query = query.eq('hostel_name', hostel_name);
        }
        const { data: issues, error } = await query;
        if (error) {
            throw new middleware_1.ApiError(`Failed to fetch analytics: ${error.message}`, 500);
        }
        // Group by week
        const weeklyData = {};
        issues?.forEach((issue) => {
            // Get week start date
            const createdDate = new Date(issue.created_at);
            const weekStart = new Date(createdDate);
            weekStart.setDate(createdDate.getDate() - createdDate.getDay());
            const weekKey = weekStart.toISOString().split('T')[0];
            if (!weeklyData[weekKey]) {
                weeklyData[weekKey] = { created: 0, resolved: 0 };
            }
            weeklyData[weekKey].created++;
            // Check if resolved in this period
            if (issue.resolved_at) {
                const resolvedDate = new Date(issue.resolved_at);
                const resolvedWeekStart = new Date(resolvedDate);
                resolvedWeekStart.setDate(resolvedDate.getDate() - resolvedDate.getDay());
                const resolvedWeekKey = resolvedWeekStart.toISOString().split('T')[0];
                if (!weeklyData[resolvedWeekKey]) {
                    weeklyData[resolvedWeekKey] = { created: 0, resolved: 0 };
                }
                weeklyData[resolvedWeekKey].resolved++;
            }
        });
        // Sort by date
        const sortedWeeks = Object.entries(weeklyData)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([week, data]) => ({
            week_start: week,
            ...data,
        }));
        (0, response_1.sendSuccess)(res, 'Status trends retrieved', {
            period_days: daysBack,
            weekly_data: sortedWeeks,
        });
    }
    /**
     * Get dashboard overview stats
     * GET /api/analytics/dashboard
     */
    static async getDashboardStats(req, res) {
        const user = req.user;
        // Get current counts
        const today = new Date();
        const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        // Issues stats
        const { count: totalIssues } = await config_1.supabaseAdmin
            .from('issues')
            .select('*', { count: 'exact', head: true });
        const { count: pendingIssues } = await config_1.supabaseAdmin
            .from('issues')
            .select('*', { count: 'exact', head: true })
            .in('status', ['pending', 'in_progress']);
        const { count: thisMonthIssues } = await config_1.supabaseAdmin
            .from('issues')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', thisMonth.toISOString());
        const { count: lastMonthIssues } = await config_1.supabaseAdmin
            .from('issues')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', lastMonth.toISOString())
            .lt('created_at', thisMonth.toISOString());
        // Users stats
        const { count: totalUsers } = await config_1.supabaseAdmin
            .from('users')
            .select('*', { count: 'exact', head: true })
            .eq('approval_status', 'approved');
        const { count: pendingApprovals } = await config_1.supabaseAdmin
            .from('users')
            .select('*', { count: 'exact', head: true })
            .eq('approval_status', 'pending');
        // Active announcements
        const { count: activeAnnouncements } = await config_1.supabaseAdmin
            .from('announcements')
            .select('*', { count: 'exact', head: true })
            .eq('is_active', true);
        // Open lost/found items
        const { count: openLostFound } = await config_1.supabaseAdmin
            .from('lost_found')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'open');
        (0, response_1.sendSuccess)(res, 'Dashboard stats retrieved', {
            issues: {
                total: totalIssues || 0,
                pending: pendingIssues || 0,
                this_month: thisMonthIssues || 0,
                last_month: lastMonthIssues || 0,
                trend: lastMonthIssues ?
                    Math.round(((thisMonthIssues || 0) - lastMonthIssues) / lastMonthIssues * 100) : 0,
            },
            users: {
                total: totalUsers || 0,
                pending_approvals: pendingApprovals || 0,
            },
            announcements: {
                active: activeAnnouncements || 0,
            },
            lost_found: {
                open: openLostFound || 0,
            },
        });
    }
}
exports.AnalyticsController = AnalyticsController;
exports.default = AnalyticsController;
//# sourceMappingURL=analytics.controller.js.map