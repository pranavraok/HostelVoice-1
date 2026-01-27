import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../config';
import { AuthenticatedUser } from '../types';
import { sendError } from '../utils/response';

/**
 * Authentication Middleware
 * Extracts Bearer token from Authorization header
 * Verifies the token using Supabase
 * Attaches user object to the request
 */
export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      sendError(res, 'Authorization header is required', 401);
      return;
    }

    if (!authHeader.startsWith('Bearer ')) {
      sendError(res, 'Invalid authorization format. Use: Bearer <token>', 401);
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    if (!token) {
      sendError(res, 'Access token is required', 401);
      return;
    }

    // Verify the token with Supabase
    const {
      data: { user: authUser },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !authUser) {
      sendError(res, 'Invalid or expired access token', 401);
      return;
    }

    // Fetch user profile from users table
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (profileError || !userProfile) {
      sendError(res, 'User profile not found. Please complete registration.', 404);
      return;
    }

    // Check if user is approved
    if (userProfile.approval_status !== 'approved') {
      if (userProfile.approval_status === 'pending') {
        sendError(res, 'Your account is pending approval', 403);
        return;
      }
      if (userProfile.approval_status === 'rejected') {
        sendError(
          res,
          `Your account has been rejected. Reason: ${userProfile.rejection_reason || 'Not specified'}`,
          403
        );
        return;
      }
    }

    // Attach user to request
    req.user = userProfile as AuthenticatedUser;
    req.accessToken = token;

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    sendError(res, 'Authentication failed', 500);
  }
}

export default authMiddleware;
