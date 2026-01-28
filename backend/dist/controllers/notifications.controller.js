"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsController = void 0;
const services_1 = require("../services");
const response_1 = require("../utils/response");
const validators_1 = require("../utils/validators");
/**
 * Notifications Controller
 * Handles notification retrieval and management
 */
class NotificationsController {
    /**
     * Get user notifications
     * GET /api/notifications
     */
    static async getNotifications(req, res) {
        const user = req.user;
        const pagination = (0, response_1.parsePaginationParams)(req.query);
        const offset = (0, response_1.getOffset)(pagination.page, pagination.limit);
        const unreadOnly = req.query.unread === 'true';
        const { data, count } = await services_1.NotificationService.getUserNotifications(user.id, {
            unreadOnly,
            limit: pagination.limit,
            offset,
        });
        (0, response_1.sendPaginated)(res, 'Notifications retrieved successfully', data, pagination, count);
    }
    /**
     * Get unread notification count
     * GET /api/notifications/count
     */
    static async getUnreadCount(req, res) {
        const user = req.user;
        const count = await services_1.NotificationService.getUnreadCount(user.id);
        (0, response_1.sendSuccess)(res, 'Unread count retrieved', { count });
    }
    /**
     * Mark specific notifications as read
     * PATCH /api/notifications/read
     */
    static async markAsRead(req, res) {
        const user = req.user;
        const data = (0, validators_1.validate)(validators_1.markNotificationReadSchema, req.body);
        await services_1.NotificationService.markAsRead(user.id, data.notification_ids);
        (0, response_1.sendSuccess)(res, 'Notifications marked as read');
    }
    /**
     * Mark all notifications as read
     * PATCH /api/notifications/read-all
     */
    static async markAllAsRead(req, res) {
        const user = req.user;
        await services_1.NotificationService.markAllAsRead(user.id);
        (0, response_1.sendSuccess)(res, 'All notifications marked as read');
    }
}
exports.NotificationsController = NotificationsController;
exports.default = NotificationsController;
//# sourceMappingURL=notifications.controller.js.map