import { supabaseAdmin } from '../config';
import { NotificationType, AuthenticatedUser } from '../types';

interface CreateNotificationData {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  referenceId?: string;
  referenceType?: string;
}

/**
 * Notification Service
 * Handles creating and managing notifications
 */
export class NotificationService {
  /**
   * Create a single notification
   */
  static async create(data: CreateNotificationData): Promise<void> {
    try {
      await supabaseAdmin.from('notifications').insert({
        user_id: data.userId,
        title: data.title,
        message: data.message,
        type: data.type,
        reference_id: data.referenceId,
        reference_type: data.referenceType,
        is_read: false,
      });
    } catch (error) {
      console.error('Failed to create notification:', error);
    }
  }

  /**
   * Create notifications for multiple users
   */
  static async createBulk(
    userIds: string[],
    notification: Omit<CreateNotificationData, 'userId'>
  ): Promise<void> {
    try {
      const notifications = userIds.map((userId) => ({
        user_id: userId,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        reference_id: notification.referenceId,
        reference_type: notification.referenceType,
        is_read: false,
      }));

      await supabaseAdmin.from('notifications').insert(notifications);
    } catch (error) {
      console.error('Failed to create bulk notifications:', error);
    }
  }

  /**
   * Notify issue reporter about status change
   */
  static async notifyIssueStatusChange(
    reporterId: string,
    issueId: string,
    issueTitle: string,
    newStatus: string
  ): Promise<void> {
    await this.create({
      userId: reporterId,
      title: 'Issue Status Updated',
      message: `Your issue "${issueTitle}" has been updated to: ${newStatus.replace('_', ' ')}`,
      type: 'issue',
      referenceId: issueId,
      referenceType: 'issue',
    });
  }

  /**
   * Notify caretaker about new issue assignment
   */
  static async notifyIssueAssignment(
    caretakerId: string,
    issueId: string,
    issueTitle: string
  ): Promise<void> {
    await this.create({
      userId: caretakerId,
      title: 'New Issue Assigned',
      message: `You have been assigned to issue: "${issueTitle}"`,
      type: 'issue',
      referenceId: issueId,
      referenceType: 'issue',
    });
  }

  /**
   * Notify about issue merge
   */
  static async notifyIssueMerge(
    affectedUserIds: string[],
    masterIssueId: string,
    masterIssueTitle: string
  ): Promise<void> {
    await this.createBulk(affectedUserIds, {
      title: 'Issue Merged',
      message: `Your issue has been merged with: "${masterIssueTitle}". You can track progress there.`,
      type: 'issue',
      referenceId: masterIssueId,
      referenceType: 'issue',
    });
  }

  /**
   * Notify users about new announcement
   */
  static async notifyNewAnnouncement(
    userIds: string[],
    announcementId: string,
    announcementTitle: string,
    priority: string
  ): Promise<void> {
    const prefix = priority === 'urgent' ? '🚨 URGENT: ' : priority === 'high' ? '⚠️ ' : '';
    
    await this.createBulk(userIds, {
      title: `${prefix}New Announcement`,
      message: announcementTitle,
      type: 'announcement',
      referenceId: announcementId,
      referenceType: 'announcement',
    });
  }

  /**
   * Notify about lost item match
   */
  static async notifyLostItemMatch(
    userId: string,
    itemId: string,
    itemName: string
  ): Promise<void> {
    await this.create({
      userId,
      title: 'Possible Match Found',
      message: `A found item may match your lost item: "${itemName}"`,
      type: 'lost_found',
      referenceId: itemId,
      referenceType: 'lost_found',
    });
  }

  /**
   * Notify about lost/found item claim
   */
  static async notifyItemClaimed(
    reporterId: string,
    itemId: string,
    itemName: string,
    claimerName: string
  ): Promise<void> {
    await this.create({
      userId: reporterId,
      title: 'Item Claimed',
      message: `Your reported item "${itemName}" has been claimed by ${claimerName}`,
      type: 'lost_found',
      referenceId: itemId,
      referenceType: 'lost_found',
    });
  }

  /**
   * Notify user about account approval
   */
  static async notifyAccountApproved(userId: string): Promise<void> {
    await this.create({
      userId,
      title: 'Account Approved',
      message: 'Your account has been approved. You can now access all features.',
      type: 'approval',
    });
  }

  /**
   * Notify user about account rejection
   */
  static async notifyAccountRejected(userId: string, reason: string): Promise<void> {
    await this.create({
      userId,
      title: 'Account Application Rejected',
      message: `Your account application has been rejected. Reason: ${reason}`,
      type: 'approval',
    });
  }

  /**
   * Notify admins about new registration pending approval
   */
  static async notifyAdminsNewRegistration(
    userName: string,
    userRole: string
  ): Promise<void> {
    // Get all admin user IDs
    const { data: admins } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('role', 'admin')
      .eq('approval_status', 'approved');

    if (admins && admins.length > 0) {
      const adminIds = admins.map((a) => a.id);
      await this.createBulk(adminIds, {
        title: 'New Registration Pending',
        message: `New ${userRole} registration: ${userName} is waiting for approval.`,
        type: 'approval',
      });
    }
  }

  /**
   * Get user notifications
   */
  static async getUserNotifications(
    userId: string,
    options: { unreadOnly?: boolean; limit?: number; offset?: number }
  ): Promise<{ data: unknown[]; count: number }> {
    let query = supabaseAdmin
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', userId);

    if (options.unreadOnly) {
      query = query.eq('is_read', false);
    }

    query = query
      .order('created_at', { ascending: false })
      .range(options.offset || 0, (options.offset || 0) + (options.limit || 20) - 1);

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to fetch notifications: ${error.message}`);
    }

    return { data: data || [], count: count || 0 };
  }

  /**
   * Mark notifications as read
   */
  static async markAsRead(userId: string, notificationIds: string[]): Promise<void> {
    const { error } = await supabaseAdmin
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('user_id', userId)
      .in('id', notificationIds);

    if (error) {
      throw new Error(`Failed to mark notifications as read: ${error.message}`);
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllAsRead(userId: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) {
      throw new Error(`Failed to mark all notifications as read: ${error.message}`);
    }
  }

  /**
   * Get unread notification count
   */
  static async getUnreadCount(userId: string): Promise<number> {
    const { count, error } = await supabaseAdmin
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) {
      throw new Error(`Failed to get unread count: ${error.message}`);
    }

    return count || 0;
  }
}

export default NotificationService;
