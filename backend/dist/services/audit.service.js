"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditService = void 0;
const config_1 = require("../config");
/**
 * Audit Service
 * Logs all important actions for accountability and tracking
 */
class AuditService {
    /**
     * Create an audit log entry
     */
    static async log(data) {
        try {
            const { userId, action, entityType, entityId, oldData, newData, req } = data;
            await config_1.supabaseAdmin.from('audit_logs').insert({
                user_id: userId,
                action,
                entity_type: entityType,
                entity_id: entityId,
                old_data: oldData,
                new_data: newData,
                ip_address: req?.ip || req?.headers['x-forwarded-for'] || null,
                user_agent: req?.headers['user-agent'] || null,
            });
        }
        catch (error) {
            // Log error but don't throw - audit logging shouldn't break the main flow
            console.error('Audit log error:', error);
        }
    }
    /**
     * Log issue creation
     */
    static async logIssueCreate(user, issueId, issueData, req) {
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
    static async logIssueStatusUpdate(user, issueId, oldStatus, newStatus, notes, req) {
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
    static async logIssueAssign(user, issueId, oldAssignee, newAssignee, req) {
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
    static async logIssueMerge(user, masterIssueId, mergedIssueIds, req) {
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
    static async logUserApproval(admin, userId, approved, reason, req) {
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
    static async logAnnouncementAction(user, action, announcementId, data, req) {
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
    static async logLostFoundAction(user, action, itemId, data, req) {
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
    static async getLogs(filters) {
        let query = config_1.supabaseAdmin
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
exports.AuditService = AuditService;
exports.default = AuditService;
//# sourceMappingURL=audit.service.js.map