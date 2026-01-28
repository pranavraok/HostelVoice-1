import { Request, Response } from 'express';
/**
 * Analytics Controller
 * Provides data-driven insights for administrators
 */
export declare class AnalyticsController {
    /**
     * Get overall issue statistics
     * GET /api/analytics/issues-summary
     */
    static getIssuesSummary(req: Request, res: Response): Promise<void>;
    /**
     * Get average resolution time
     * GET /api/analytics/resolution-time
     */
    static getResolutionTime(req: Request, res: Response): Promise<void>;
    /**
     * Get issue frequency by category
     * GET /api/analytics/category-frequency
     */
    static getCategoryFrequency(req: Request, res: Response): Promise<void>;
    /**
     * Get hostel-wise issue density
     * GET /api/analytics/hostel-density
     */
    static getHostelDensity(req: Request, res: Response): Promise<void>;
    /**
     * Get pending vs resolved statistics over time
     * GET /api/analytics/status-trends
     */
    static getStatusTrends(req: Request, res: Response): Promise<void>;
    /**
     * Get dashboard overview stats
     * GET /api/analytics/dashboard
     */
    static getDashboardStats(req: Request, res: Response): Promise<void>;
}
export default AnalyticsController;
//# sourceMappingURL=analytics.controller.d.ts.map