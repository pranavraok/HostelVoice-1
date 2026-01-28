import { supabaseAdmin } from '../config';
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
export class AuditService {
  /**
   * Create an audit log entry
   */
  static async log(data: AuditLogData): Promise<void> {
    try {
      const { userId, action, entityType, entityId, oldData, newData, req } = data;

      const { error } = await supabaseAdmin.from('audit_logs').insert({
        user_id: userId,
        action,
        entity_type: entityType,
        entity_id: entityId,
        old_data: oldData,
        new_data: newData,
        ip_address: req?.ip || req?.headers['x-forwarded-for'] || null,
        user_agent: req?.headers['user-agent'] || null,
      });

      if (error) {
        console.error('[AuditService] Failed to create audit log:', {
          error: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
          userId,
          action,
          entityType,
          entityId
        });
      }
    } catch (error) {
      // Log error but don't throw - audit logging shouldn't break the main flow
      console.error('[AuditService] Exception in audit logging:', error);
    }
  }

  /**
   * Log issue creation
   */
  static async logIssueCreate(
    user: AuthenticatedUser,
    issueId: string,
    issueData: Record<string, unknown>,
    req?: Request
  ): Promise<void> {
    await this.log({
      userId: user.id,
      action: 'create',
      entityType: 'issue',
      entityId: issueId,
      newData: issueData,
      req,
    });
  }

  /**
   * Log issue status update
   */
  static async logIssueStatusUpdate(
    user: AuthenticatedUser,
    issueId: string,
    oldStatus: string,
    newStatus: string,
    notes?: string,
    req?: Request
  ): Promise<void> {
    await this.log({
      userId: user.id,
      action: 'update',
      entityType: 'issue',
      entityId: issueId,
      oldData: { status: oldStatus },
      newData: { status: newStatus, notes },
      req,
    });
  }

  /**
   * Log issue assignment
   */
  static async logIssueAssign(
    user: AuthenticatedUser,
    issueId: string,
    oldAssignee: string | null,
    newAssignee: string,
    req?: Request
  ): Promise<void> {
    await this.log({
      userId: user.id,
      action: 'assign',
      entityType: 'issue',
      entityId: issueId,
      oldData: { assigned_to: oldAssignee },
      newData: { assigned_to: newAssignee },
      req,
    });
  }

  /**
   * Log issue merge
   */
  static async logIssueMerge(
    user: AuthenticatedUser,
    masterIssueId: string,
    mergedIssueIds: string[],
    req?: Request
  ): Promise<void> {
    await this.log({
      userId: user.id,
      action: 'merge',
      entityType: 'issue',
      entityId: masterIssueId,
      newData: { merged_issue_ids: mergedIssueIds },
      req,
    });
  }

  /**
   * Log user approval
   */
  static async logUserApproval(
    admin: AuthenticatedUser,
    userId: string,
    approved: boolean,
    reason?: string,
    req?: Request
  ): Promise<void> {
    await this.log({
      userId: admin.id,
      action: approved ? 'approve' : 'reject',
      entityType: 'user',
      entityId: userId,
      newData: {
        approved,
        reason,
        approved_by: admin.id,
        approval_date: new Date().toISOString(),
      },
      req,
    });
  }

  /**
   * Log announcement actions
   */
  static async logAnnouncementAction(
    user: AuthenticatedUser,
    action: AuditAction,
    announcementId: string,
    data: Record<string, unknown>,
    req?: Request
  ): Promise<void> {
    await this.log({
      userId: user.id,
      action,
      entityType: 'announcement',
      entityId: announcementId,
      newData: data,
      req,
    });
  }

  /**
   * Log lost & found actions
   */
  static async logLostFoundAction(
    user: AuthenticatedUser,
    action: AuditAction,
    itemId: string,
    data: Record<string, unknown>,
    req?: Request
  ): Promise<void> {
    await this.log({
      userId: user.id,
      action,
      entityType: 'lost_found',
      entityId: itemId,
      newData: data,
      req,
    });
  }

  /**
   * Get audit logs with filters
   */
  static async getLogs(filters: {
    entityType?: EntityType;
    entityId?: string;
    userId?: string;
    action?: AuditAction;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ data: unknown[]; count: number }> {
    let query = supabaseAdmin
      .from('audit_logs')
      .select('*, user:users(full_name, email, role)', { count: 'exact' });

    if (filters.entityType) {
      query = query.eq('entity_type', filters.entityType);
    }
    if (filters.entityId) {
      query = query.eq('entity_id', filters.entityId);
    }
    if (filters.userId) {
      query = query.eq('user_id', filters.userId);
    }
    if (filters.action) {
      query = query.eq('action', filters.action);
    }
    if (filters.startDate) {
      query = query.gte('created_at', filters.startDate);
    }
    if (filters.endDate) {
      query = query.lte('created_at', filters.endDate);
    }

    query = query
      .order('created_at', { ascending: false })
      .range(filters.offset || 0, (filters.offset || 0) + (filters.limit || 50) - 1);

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to fetch audit logs: ${error.message}`);
    }

    return { data: data || [], count: count || 0 };
  }
}

export default AuditService;
