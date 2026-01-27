import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';
import { authMiddleware, staffOnly, adminOnly, asyncHandler } from '../middleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

/**
 * @route   GET /api/analytics/dashboard
 * @desc    Get dashboard overview stats
 * @access  Staff only
 */
router.get('/dashboard', staffOnly, asyncHandler(AnalyticsController.getDashboardStats));

/**
 * @route   GET /api/analytics/issues-summary
 * @desc    Get overall issue statistics
 * @access  Staff only
 */
router.get('/issues-summary', staffOnly, asyncHandler(AnalyticsController.getIssuesSummary));

/**
 * @route   GET /api/analytics/resolution-time
 * @desc    Get average resolution time
 * @access  Staff only
 */
router.get('/resolution-time', staffOnly, asyncHandler(AnalyticsController.getResolutionTime));

/**
 * @route   GET /api/analytics/category-frequency
 * @desc    Get issue frequency by category
 * @access  Staff only
 */
router.get('/category-frequency', staffOnly, asyncHandler(AnalyticsController.getCategoryFrequency));

/**
 * @route   GET /api/analytics/hostel-density
 * @desc    Get hostel-wise issue density
 * @access  Admin only
 */
router.get('/hostel-density', adminOnly, asyncHandler(AnalyticsController.getHostelDensity));

/**
 * @route   GET /api/analytics/status-trends
 * @desc    Get pending vs resolved statistics over time
 * @access  Staff only
 */
router.get('/status-trends', staffOnly, asyncHandler(AnalyticsController.getStatusTrends));

export default router;
