"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
const config_1 = require("../config");
const response_1 = require("../utils/response");
/**
 * Authentication Middleware
 * Extracts Bearer token from Authorization header
 * Verifies the token using Supabase
 * Attaches user object to the request
 */
async function authMiddleware(req, res, next) {
    try {
        // Extract token from Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            (0, response_1.sendError)(res, 'Authorization header is required', 401);
            return;
        }
        if (!authHeader.startsWith('Bearer ')) {
            (0, response_1.sendError)(res, 'Invalid authorization format. Use: Bearer <token>', 401);
            return;
        }
        const token = authHeader.substring(7); // Remove 'Bearer ' prefix
        if (!token) {
            (0, response_1.sendError)(res, 'Access token is required', 401);
            return;
        }
        // Verify the token with Supabase
        const { data: { user: authUser }, error: authError, } = await config_1.supabaseAdmin.auth.getUser(token);
        if (authError || !authUser) {
            (0, response_1.sendError)(res, 'Invalid or expired access token', 401);
            return;
        }
        // Fetch user profile from users table
        const { data: userProfile, error: profileError } = await config_1.supabaseAdmin
            .from('users')
            .select('*')
            .eq('id', authUser.id)
            .single();
        if (profileError || !userProfile) {
            (0, response_1.sendError)(res, 'User profile not found. Please complete registration.', 404);
            return;
        }
        // Check if user is approved
        if (userProfile.approval_status !== 'approved') {
            if (userProfile.approval_status === 'pending') {
                (0, response_1.sendError)(res, 'Your account is pending approval', 403);
                return;
            }
            if (userProfile.approval_status === 'rejected') {
                (0, response_1.sendError)(res, `Your account has been rejected. Reason: ${userProfile.rejection_reason || 'Not specified'}`, 403);
                return;
            }
        }
        // Attach user to request
        req.user = userProfile;
        req.accessToken = token;
        next();
    }
    catch (error) {
        console.error('Auth middleware error:', error);
        (0, response_1.sendError)(res, 'Authentication failed', 500);
    }
}
exports.default = authMiddleware;
//# sourceMappingURL=authMiddleware.js.map