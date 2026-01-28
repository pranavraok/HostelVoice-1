"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const analytics_controller_1 = require("../controllers/analytics.controller");
const middleware_1 = require("../middleware");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(middleware_1.authMiddleware);
/**
 * @route   GET /api/analytics/dashboard
 * @desc    Get dashboard overview stats
 * @access  Staff only
 */
router.get('/dashboard', middleware_1.staffOnly, (0, middleware_1.asyncHandler)(analytics_controller_1.AnalyticsController.getDashboardStats));
/**
 * @route   GET /api/analytics/issues-summary
 * @desc    Get overall issue statistics
 * @access  Staff only
 */
router.get('/issues-summary', middleware_1.staffOnly, (0, middleware_1.asyncHandler)(analytics_controller_1.AnalyticsController.getIssuesSummary));
/**
 * @route   GET /api/analytics/resolution-time
 * @desc    Get average resolution time
 * @access  Staff only
 */
router.get('/resolution-time', middleware_1.staffOnly, (0, middleware_1.asyncHandler)(analytics_controller_1.AnalyticsController.getResolutionTime));
/**
 * @route   GET /api/analytics/category-frequency
 * @desc    Get issue frequency by category
 * @access  Staff only
 */
router.get('/category-frequency', middleware_1.staffOnly, (0, middleware_1.asyncHandler)(analytics_controller_1.AnalyticsController.getCategoryFrequency));
/**
 * @route   GET /api/analytics/hostel-density
 * @desc    Get hostel-wise issue density
 * @access  Admin only
 */
router.get('/hostel-density', middleware_1.adminOnly, (0, middleware_1.asyncHandler)(analytics_controller_1.AnalyticsController.getHostelDensity));
/**
 * @route   GET /api/analytics/status-trends
 * @desc    Get pending vs resolved statistics over time
 * @access  Staff only
 */
router.get('/status-trends', middleware_1.staffOnly, (0, middleware_1.asyncHandler)(analytics_controller_1.AnalyticsController.getStatusTrends));
exports.default = router;
//# sourceMappingURL=analytics.routes.js.map