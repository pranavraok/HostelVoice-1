import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../types';
import { sendError } from '../utils/response';

/**
 * Role Middleware Factory
 * Creates middleware that checks if user has the required role(s)
 * Must be used after authMiddleware
 */
export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      const user = req.user;

      if (!user) {
        sendError(res, 'Authentication required', 401);
        return;
      }

      if (!allowedRoles.includes(user.role)) {
        sendError(
          res,
          `Access denied. Required role(s): ${allowedRoles.join(', ')}`,
          403
        );
        return;
      }

      next();
    } catch (error) {
      console.error('Role middleware error:', error);
      sendError(res, 'Authorization failed', 500);
    }
  };
}

/**
 * Specific role middlewares for convenience
 */

// Only students can access
export const studentOnly = requireRole('student');

// Only caretakers can access
export const caretakerOnly = requireRole('caretaker');

// Only admins can access
export const adminOnly = requireRole('admin');

// Staff (caretakers and admins) can access
export const staffOnly = requireRole('caretaker', 'admin');

// All authenticated users can access (any role)
export const anyRole = requireRole('student', 'caretaker', 'admin');

/**
 * Check if user is the owner of a resource or has staff privileges
 */
export function requireOwnerOrStaff(getOwnerId: (req: Request) => string | Promise<string>) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = req.user;

      if (!user) {
        sendError(res, 'Authentication required', 401);
        return;
      }

      // Staff always has access
      if (user.role === 'caretaker' || user.role === 'admin') {
        next();
        return;
      }

      // Check if user is the owner
      const ownerId = await getOwnerId(req);
      if (user.id === ownerId) {
        next();
        return;
      }

      sendError(res, 'Access denied. You can only access your own resources.', 403);
    } catch (error) {
      console.error('Owner check middleware error:', error);
      sendError(res, 'Authorization failed', 500);
    }
  };
}

export default requireRole;
