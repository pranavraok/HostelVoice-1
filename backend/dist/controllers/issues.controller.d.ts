import { Request, Response } from 'express';
/**
 * Issues Controller
 * Handles all issue-related operations
 */
export declare class IssuesController {
    /**
     * Create a new issue
     * POST /api/issues
     */
    static create(req: Request, res: Response): Promise<void>;
    /**
     * Get current user's issues
     * GET /api/issues/my
     */
    static getMyIssues(req: Request, res: Response): Promise<void>;
    /**
     * Get all issues (staff only)
     * GET /api/issues
     */
    static getAllIssues(req: Request, res: Response): Promise<void>;
    /**
     * Get a single issue by ID
     * GET /api/issues/:id
     */
    static getById(req: Request, res: Response): Promise<void>;
    /**
     * Assign an issue to a caretaker
     * PATCH /api/issues/:id/assign
     */
    static assign(req: Request, res: Response): Promise<void>;
    /**
     * Update issue status
     * PATCH /api/issues/:id/status
     */
    static updateStatus(req: Request, res: Response): Promise<void>;
    /**
     * Merge duplicate issues
     * POST /api/issues/merge
     */
    static merge(req: Request, res: Response): Promise<void>;
    /**
     * Find potential duplicate issues
     * GET /api/issues/:id/duplicates
     */
    static findDuplicates(req: Request, res: Response): Promise<void>;
}
export default IssuesController;
//# sourceMappingURL=issues.controller.d.ts.map