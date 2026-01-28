import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../types';
/**
 * Role Middleware Factory
 * Creates middleware that checks if user has the required role(s)
 * Must be used after authMiddleware
 */
export declare function requireRole(...allowedRoles: UserRole[]): (req: Request, res: Response, next: NextFunction) => void;
/**
 * Specific role middlewares for convenience
 */
export declare const studentOnly: (req: Request, res: Response, next: NextFunction) => void;
export declare const caretakerOnly: (req: Request, res: Response, next: NextFunction) => void;
export declare const adminOnly: (req: Request, res: Response, next: NextFunction) => void;
export declare const staffOnly: (req: Request, res: Response, next: NextFunction) => void;
export declare const anyRole: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Check if user is the owner of a resource or has staff privileges
 */
export declare function requireOwnerOrStaff(getOwnerId: (req: Request) => string | Promise<string>): (req: Request, res: Response, next: NextFunction) => Promise<void>;
export default requireRole;
//# sourceMappingURL=roleMiddleware.d.ts.map