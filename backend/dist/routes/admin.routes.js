"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_controller_1 = require("../controllers/admin.controller");
const middleware_1 = require("../middleware");
const router = (0, express_1.Router)();
// All routes require authentication and admin role
router.use(middleware_1.authMiddleware);
router.use(middleware_1.adminOnly);
/**
 * @route   GET /api/admin/pending-users
 * @desc    Get pending user approvals
 * @access  Admin only
 */
router.get('/pending-users', (0, middleware_1.asyncHandler)(admin_controller_1.AdminController.getPendingUsers));
/**
 * @route   PATCH /api/admin/approve-user
 * @desc    Approve a user
 * @access  Admin only
 */
router.patch('/approve-user', (0, middleware_1.asyncHandler)(admin_controller_1.AdminController.approveUser));
/**
 * @route   PATCH /api/admin/reject-user
 * @desc    Reject a user
 * @access  Admin only
 */
router.patch('/reject-user', (0, middleware_1.asyncHandler)(admin_controller_1.AdminController.rejectUser));
/**
 * @route   GET /api/admin/users
 * @desc    Get all users
 * @access  Admin only
 */
router.get('/users', (0, middleware_1.asyncHandler)(admin_controller_1.AdminController.getAllUsers));
/**
 * @route   GET /api/admin/users/:id
 * @desc    Get a specific user by ID
 * @access  Admin only
 */
router.get('/users/:id', (0, middleware_1.asyncHandler)(admin_controller_1.AdminController.getUserById));
/**
 * @route   GET /api/admin/audit-logs
 * @desc    Get audit logs
 * @access  Admin only
 */
router.get('/audit-logs', (0, middleware_1.asyncHandler)(admin_controller_1.AdminController.getAuditLogs));
/**
 * @route   GET /api/admin/stats
 * @desc    Get system statistics
 * @access  Admin only
 */
router.get('/stats', (0, middleware_1.asyncHandler)(admin_controller_1.AdminController.getSystemStats));
/**
 * @route   GET /api/admin/hostels
 * @desc    Get list of hostels
 * @access  Admin only
 */
router.get('/hostels', (0, middleware_1.asyncHandler)(admin_controller_1.AdminController.getHostels));
exports.default = router;
//# sourceMappingURL=admin.routes.js.map