import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authMiddleware, adminOnly, asyncHandler } from '../middleware';

const router = Router();

// All routes require authentication and admin role
router.use(authMiddleware);
router.use(adminOnly);

/**
 * @route   GET /api/admin/pending-users
 * @desc    Get pending user approvals
 * @access  Admin only
 */
router.get('/pending-users', asyncHandler(AdminController.getPendingUsers));

/**
 * @route   PATCH /api/admin/approve-user
 * @desc    Approve a user
 * @access  Admin only
 */
router.patch('/approve-user', asyncHandler(AdminController.approveUser));

/**
 * @route   PATCH /api/admin/reject-user
 * @desc    Reject a user
 * @access  Admin only
 */
router.patch('/reject-user', asyncHandler(AdminController.rejectUser));

/**
 * @route   GET /api/admin/users
 * @desc    Get all users
 * @access  Admin only
 */
router.get('/users', asyncHandler(AdminController.getAllUsers));

/**
 * @route   GET /api/admin/users/:id
 * @desc    Get a specific user by ID
 * @access  Admin only
 */
router.get('/users/:id', asyncHandler(AdminController.getUserById));

/**
 * @route   GET /api/admin/audit-logs
 * @desc    Get audit logs
 * @access  Admin only
 */
router.get('/audit-logs', asyncHandler(AdminController.getAuditLogs));

/**
 * @route   GET /api/admin/stats
 * @desc    Get system statistics
 * @access  Admin only
 */
router.get('/stats', asyncHandler(AdminController.getSystemStats));

/**
 * @route   GET /api/admin/hostels
 * @desc    Get list of hostels
 * @access  Admin only
 */
router.get('/hostels', asyncHandler(AdminController.getHostels));

export default router;
