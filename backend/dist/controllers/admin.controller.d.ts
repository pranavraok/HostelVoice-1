import { Request, Response } from 'express';
/**
 * Admin Controller
 * Handles admin-specific operations like user approval
 */
export declare class AdminController {
    /**
     * Get pending user approvals
     * GET /api/admin/pending-users
     */
    static getPendingUsers(req: Request, res: Response): Promise<void>;
    /**
     * Approve a user
     * PATCH /api/admin/approve-user
     */
    static approveUser(req: Request, res: Response): Promise<void>;
    /**
     * Reject a user
     * PATCH /api/admin/reject-user
     */
    static rejectUser(req: Request, res: Response): Promise<void>;
    /**
     * Get all users (with filters)
     * GET /api/admin/users
     */
    static getAllUsers(req: Request, res: Response): Promise<void>;
    /**
     * Get a specific user by ID
     * GET /api/admin/users/:id
     */
    static getUserById(req: Request, res: Response): Promise<void>;
    /**
     * Get audit logs
     * GET /api/admin/audit-logs
     */
    static getAuditLogs(req: Request, res: Response): Promise<void>;
    /**
     * Get system statistics
     * GET /api/admin/stats
     */
    static getSystemStats(req: Request, res: Response): Promise<void>;
    /**
     * Get list of hostels
     * GET /api/admin/hostels
     */
    static getHostels(req: Request, res: Response): Promise<void>;
}
export default AdminController;
//# sourceMappingURL=admin.controller.d.ts.map