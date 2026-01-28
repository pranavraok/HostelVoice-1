import { Request, Response } from 'express';
/**
 * Announcements Controller
 * Handles all announcement-related operations
 */
export declare class AnnouncementsController {
    /**
     * Create a new announcement
     * POST /api/announcements
     */
    static create(req: Request, res: Response): Promise<void>;
    /**
     * Notify users based on announcement targeting
     */
    private static notifyTargetedUsers;
    /**
     * Get announcements targeted to the current user
     * GET /api/announcements
     */
    static getTargeted(req: Request, res: Response): Promise<void>;
    /**
     * Get all announcements (for staff management)
     * GET /api/announcements/all
     */
    static getAll(req: Request, res: Response): Promise<void>;
    /**
     * Get a single announcement by ID
     * GET /api/announcements/:id
     */
    static getById(req: Request, res: Response): Promise<void>;
    /**
     * Update an announcement
     * PATCH /api/announcements/:id
     */
    static update(req: Request, res: Response): Promise<void>;
    /**
     * Delete an announcement
     * DELETE /api/announcements/:id
     */
    static delete(req: Request, res: Response): Promise<void>;
    /**
     * Toggle announcement active status
     * PATCH /api/announcements/:id/toggle
     */
    static toggleActive(req: Request, res: Response): Promise<void>;
}
export default AnnouncementsController;
//# sourceMappingURL=announcements.controller.d.ts.map