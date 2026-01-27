import { Request, Response } from 'express';
import { NotificationService } from '../services';
import { sendSuccess, sendPaginated, parsePaginationParams, getOffset } from '../utils/response';
import { validate, markNotificationReadSchema } from '../utils/validators';

/**
 * Notifications Controller
 * Handles notification retrieval and management
 */
export class NotificationsController {
  /**
   * Get user notifications
   * GET /api/notifications
   */
  static async getNotifications(req: Request, res: Response): Promise<void> {
    const user = req.user!;
    const pagination = parsePaginationParams(req.query as Record<string, unknown>);
    const offset = getOffset(pagination.page, pagination.limit);
    const unreadOnly = req.query.unread === 'true';

    const { data, count } = await NotificationService.getUserNotifications(user.id, {
      unreadOnly,
      limit: pagination.limit,
      offset,
    });

    sendPaginated(res, 'Notifications retrieved successfully', data, pagination, count);
  }

  /**
   * Get unread notification count
   * GET /api/notifications/count
   */
  static async getUnreadCount(req: Request, res: Response): Promise<void> {
    const user = req.user!;

    const count = await NotificationService.getUnreadCount(user.id);

    sendSuccess(res, 'Unread count retrieved', { count });
  }

  /**
   * Mark specific notifications as read
   * PATCH /api/notifications/read
   */
  static async markAsRead(req: Request, res: Response): Promise<void> {
    const user = req.user!;
    const data = validate(markNotificationReadSchema, req.body);

    await NotificationService.markAsRead(user.id, data.notification_ids);

    sendSuccess(res, 'Notifications marked as read');
  }

  /**
   * Mark all notifications as read
   * PATCH /api/notifications/read-all
   */
  static async markAllAsRead(req: Request, res: Response): Promise<void> {
    const user = req.user!;

    await NotificationService.markAllAsRead(user.id);

    sendSuccess(res, 'All notifications marked as read');
  }
}

export default NotificationsController;
