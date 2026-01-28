import { Request, Response } from 'express';
/**
 * Lost & Found Controller
 * Handles all lost and found item operations
 */
export declare class LostFoundController {
    /**
     * Report a lost or found item
     * POST /api/lostfound
     */
    static report(req: Request, res: Response): Promise<void>;
    /**
     * Check for potential matches when a found item is reported
     */
    private static checkForMatches;
    /**
     * Get open lost and found items
     * GET /api/lostfound
     */
    static getOpen(req: Request, res: Response): Promise<void>;
    /**
     * Get user's own lost and found reports
     * GET /api/lostfound/my
     */
    static getMyItems(req: Request, res: Response): Promise<void>;
    /**
     * Get a single item by ID
     * GET /api/lostfound/:id
     */
    static getById(req: Request, res: Response): Promise<void>;
    /**
     * Claim an item
     * PATCH /api/lostfound/:id/claim
     */
    static claim(req: Request, res: Response): Promise<void>;
    /**
     * Close an item (mark as returned or resolved)
     * PATCH /api/lostfound/:id/close
     */
    static close(req: Request, res: Response): Promise<void>;
    /**
     * Get all items (staff view)
     * GET /api/lostfound/all
     */
    static getAll(req: Request, res: Response): Promise<void>;
}
export default LostFoundController;
//# sourceMappingURL=lostfound.controller.d.ts.map