import { Request, Response } from 'express';
/**
 * Notifications Controller
 * Handles notification retrieval and management
 */
export declare class NotificationsController {
    /**
     * Get user notifications
     * GET /api/notifications
     */
    static getNotifications(req: Request, res: Response): Promise<void>;
    /**
     * Get unread notification count
     * GET /api/notifications/count
     */
    static getUnreadCount(req: Request, res: Response): Promise<void>;
    /**
     * Mark specific notifications as read
     * PATCH /api/notifications/read
     */
    static markAsRead(req: Request, res: Response): Promise<void>;
    /**
     * Mark all notifications as read
     * PATCH /api/notifications/read-all
     */
    static markAllAsRead(req: Request, res: Response): Promise<void>;
}
export default NotificationsController;
//# sourceMappingURL=notifications.controller.d.ts.map