"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notifications_controller_1 = require("../controllers/notifications.controller");
const middleware_1 = require("../middleware");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(middleware_1.authMiddleware);
/**
 * @route   GET /api/notifications
 * @desc    Get user notifications
 * @access  All authenticated users
 */
router.get('/', (0, middleware_1.asyncHandler)(notifications_controller_1.NotificationsController.getNotifications));
/**
 * @route   GET /api/notifications/count
 * @desc    Get unread notification count
 * @access  All authenticated users
 */
router.get('/count', (0, middleware_1.asyncHandler)(notifications_controller_1.NotificationsController.getUnreadCount));
/**
 * @route   PATCH /api/notifications/read
 * @desc    Mark specific notifications as read
 * @access  All authenticated users
 */
router.patch('/read', (0, middleware_1.asyncHandler)(notifications_controller_1.NotificationsController.markAsRead));
/**
 * @route   PATCH /api/notifications/read-all
 * @desc    Mark all notifications as read
 * @access  All authenticated users
 */
router.patch('/read-all', (0, middleware_1.asyncHandler)(notifications_controller_1.NotificationsController.markAllAsRead));
exports.default = router;
//# sourceMappingURL=notifications.routes.js.map