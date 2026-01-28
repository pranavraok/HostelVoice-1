import { NotificationType } from '../types';
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
export declare class NotificationService {
    /**
     * Create a single notification
     */
    static create(data: CreateNotificationData): Promise<void>;
    /**
     * Create notifications for multiple users
     */
    static createBulk(userIds: string[], notification: Omit<CreateNotificationData, 'userId'>): Promise<void>;
    /**
     * Notify issue reporter about status change
     */
    static notifyIssueStatusChange(reporterId: string, issueId: string, issueTitle: string, newStatus: string): Promise<void>;
    /**
     * Notify caretaker about new issue assignment
     */
    static notifyIssueAssignment(caretakerId: string, issueId: string, issueTitle: string): Promise<void>;
    /**
     * Notify about issue merge
     */
    static notifyIssueMerge(affectedUserIds: string[], masterIssueId: string, masterIssueTitle: string): Promise<void>;
    /**
     * Notify users about new announcement
     */
    static notifyNewAnnouncement(userIds: string[], announcementId: string, announcementTitle: string, priority: string): Promise<void>;
    /**
     * Notify about lost item match
     */
    static notifyLostItemMatch(userId: string, itemId: string, itemName: string): Promise<void>;
    /**
     * Notify about lost/found item claim
     */
    static notifyItemClaimed(reporterId: string, itemId: string, itemName: string, claimerName: string): Promise<void>;
    /**
     * Notify user about account approval
     */
    static notifyAccountApproved(userId: string): Promise<void>;
    /**
     * Notify user about account rejection
     */
    static notifyAccountRejected(userId: string, reason: string): Promise<void>;
    /**
     * Notify admins about new registration pending approval
     */
    static notifyAdminsNewRegistration(userName: string, userRole: string): Promise<void>;
    /**
     * Get user notifications
     */
    static getUserNotifications(userId: string, options: {
        unreadOnly?: boolean;
        limit?: number;
        offset?: number;
    }): Promise<{
        data: unknown[];
        count: number;
    }>;
    /**
     * Mark notifications as read
     */
    static markAsRead(userId: string, notificationIds: string[]): Promise<void>;
    /**
     * Mark all notifications as read for a user
     */
    static markAllAsRead(userId: string): Promise<void>;
    /**
     * Get unread notification count
     */
    static getUnreadCount(userId: string): Promise<number>;
}
export default NotificationService;
//# sourceMappingURL=notification.service.d.ts.map