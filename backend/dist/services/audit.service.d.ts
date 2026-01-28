import { AuditAction, EntityType, AuthenticatedUser } from '../types';
import { Request } from 'express';
interface AuditLogData {
    userId: string;
    action: AuditAction;
    entityType: EntityType;
    entityId: string;
    oldData?: Record<string, unknown>;
    newData?: Record<string, unknown>;
    req?: Request;
}
/**
 * Audit Service
 * Logs all important actions for accountability and tracking
 */
export declare class AuditService {
    /**
     * Create an audit log entry
     */
    static log(data: AuditLogData): Promise<void>;
    /**
     * Log issue creation
     */
    static logIssueCreate(user: AuthenticatedUser, issueId: string, issueData: Record<string, unknown>, req?: Request): Promise<void>;
    /**
     * Log issue status update
     */
    static logIssueStatusUpdate(user: AuthenticatedUser, issueId: string, oldStatus: string, newStatus: string, notes?: string, req?: Request): Promise<void>;
    /**
     * Log issue assignment
     */
    static logIssueAssign(user: AuthenticatedUser, issueId: string, oldAssignee: string | null, newAssignee: string, req?: Request): Promise<void>;
    /**
     * Log issue merge
     */
    static logIssueMerge(user: AuthenticatedUser, masterIssueId: string, mergedIssueIds: string[], req?: Request): Promise<void>;
    /**
     * Log user approval
     */
    static logUserApproval(admin: AuthenticatedUser, userId: string, approved: boolean, reason?: string, req?: Request): Promise<void>;
    /**
     * Log announcement actions
     */
    static logAnnouncementAction(user: AuthenticatedUser, action: AuditAction, announcementId: string, data: Record<string, unknown>, req?: Request): Promise<void>;
    /**
     * Log lost & found actions
     */
    static logLostFoundAction(user: AuthenticatedUser, action: AuditAction, itemId: string, data: Record<string, unknown>, req?: Request): Promise<void>;
    /**
     * Get audit logs with filters
     */
    static getLogs(filters: {
        entityType?: EntityType;
        entityId?: string;
        userId?: string;
        action?: AuditAction;
        startDate?: string;
        endDate?: string;
        limit?: number;
        offset?: number;
    }): Promise<{
        data: unknown[];
        count: number;
    }>;
}
export default AuditService;
//# sourceMappingURL=audit.service.d.ts.map