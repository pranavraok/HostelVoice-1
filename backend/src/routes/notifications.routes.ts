import { Router } from 'express';
import { NotificationsController } from '../controllers/notifications.controller';
import { authMiddleware, asyncHandler } from '../middleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

/**
 * @route   GET /api/notifications
 * @desc    Get user notifications
 * @access  All authenticated users
 */
router.get('/', asyncHandler(NotificationsController.getNotifications));

/**
 * @route   GET /api/notifications/count
 * @desc    Get unread notification count
 * @access  All authenticated users
 */
router.get('/count', asyncHandler(NotificationsController.getUnreadCount));

/**
 * @route   PATCH /api/notifications/read
 * @desc    Mark specific notifications as read
 * @access  All authenticated users
 */
router.patch('/read', asyncHandler(NotificationsController.markAsRead));

/**
 * @route   PATCH /api/notifications/read-all
 * @desc    Mark all notifications as read
 * @access  All authenticated users
 */
router.patch('/read-all', asyncHandler(NotificationsController.markAllAsRead));

export default router;
