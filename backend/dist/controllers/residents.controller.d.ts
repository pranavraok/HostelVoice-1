import { Request, Response } from 'express';
/**
 * Residents Controller
 * Handles resident profile management
 */
export declare class ResidentsController {
    /**
     * Add or update resident profile for current user
     * POST /api/residents
     */
    static add(req: Request, res: Response): Promise<void>;
    /**
     * Get current user's resident profile
     * GET /api/residents/me
     */
    static getMe(req: Request, res: Response): Promise<void>;
    /**
     * Update current user's resident profile
     * PATCH /api/residents/me
     */
    static updateMe(req: Request, res: Response): Promise<void>;
    /**
     * Get residents from users table (role-based access)
     * GET /api/residents
     * Admin: all students
     * Caretaker: students from their hostel
     * Student: only self
     */
    static getResidents(req: Request, res: Response): Promise<void>;
    /**
     * Get all residents (staff only) - DEPRECATED, use getResidents instead
     * GET /api/residents/all
     */
    static getAll(req: Request, res: Response): Promise<void>;
    /**
     * Get a specific resident by ID (staff only)
     * GET /api/residents/:id
     */
    static getById(req: Request, res: Response): Promise<void>;
    /**
     * Get resident by user ID (staff only)
     * GET /api/residents/user/:userId
     */
    static getByUserId(req: Request, res: Response): Promise<void>;
    /**
     * Update a resident (staff only)
     * PATCH /api/residents/:id
     */
    static update(req: Request, res: Response): Promise<void>;
    /**
     * Get residents by hostel (for overview)
     * GET /api/residents/hostel/:hostelName
     */
    static getByHostel(req: Request, res: Response): Promise<void>;
}
export default ResidentsController;
//# sourceMappingURL=residents.controller.d.ts.map