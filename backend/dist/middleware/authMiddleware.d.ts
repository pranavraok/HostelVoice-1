import { Request, Response, NextFunction } from 'express';
/**
 * Authentication Middleware
 * Extracts Bearer token from Authorization header
 * Verifies the token using Supabase
 * Attaches user object to the request
 */
export declare function authMiddleware(req: Request, res: Response, next: NextFunction): Promise<void>;
export default authMiddleware;
//# sourceMappingURL=authMiddleware.d.ts.map