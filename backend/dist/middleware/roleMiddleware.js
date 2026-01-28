"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.anyRole = exports.staffOnly = exports.adminOnly = exports.caretakerOnly = exports.studentOnly = void 0;
exports.requireRole = requireRole;
exports.requireOwnerOrStaff = requireOwnerOrStaff;
const response_1 = require("../utils/response");
/**
 * Role Middleware Factory
 * Creates middleware that checks if user has the required role(s)
 * Must be used after authMiddleware
 */
function requireRole(...allowedRoles) {
    return (req, res, next) => {
        try {
            const user = req.user;
            if (!user) {
                (0, response_1.sendError)(res, 'Authentication required', 401);
                return;
            }
            if (!allowedRoles.includes(user.role)) {
                (0, response_1.sendError)(res, `Access denied. Required role(s): ${allowedRoles.join(', ')}`, 403);
                return;
            }
            next();
        }
        catch (error) {
            console.error('Role middleware error:', error);
            (0, response_1.sendError)(res, 'Authorization failed', 500);
        }
    };
}
/**
 * Specific role middlewares for convenience
 */
// Only students can access
exports.studentOnly = requireRole('student');
// Only caretakers can access
exports.caretakerOnly = requireRole('caretaker');
// Only admins can access
exports.adminOnly = requireRole('admin');
// Staff (caretakers and admins) can access
exports.staffOnly = requireRole('caretaker', 'admin');
// All authenticated users can access (any role)
exports.anyRole = requireRole('student', 'caretaker', 'admin');
/**
 * Check if user is the owner of a resource or has staff privileges
 */
function requireOwnerOrStaff(getOwnerId) {
    return async (req, res, next) => {
        try {
            const user = req.user;
            if (!user) {
                (0, response_1.sendError)(res, 'Authentication required', 401);
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
            (0, response_1.sendError)(res, 'Access denied. You can only access your own resources.', 403);
        }
        catch (error) {
            console.error('Owner check middleware error:', error);
            (0, response_1.sendError)(res, 'Authorization failed', 500);
        }
    };
}
exports.default = requireRole;
//# sourceMappingURL=roleMiddleware.js.map