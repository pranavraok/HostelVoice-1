import { Router } from 'express';
import { UploadController } from '../controllers/upload.controller';
import { authMiddleware, asyncHandler } from '../middleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

/**
 * @route   POST /api/upload/signed-url
 * @desc    Generate a signed upload URL
 * @access  All authenticated users
 */
router.post('/signed-url', asyncHandler(UploadController.getSignedUploadUrl));

/**
 * @route   POST /api/upload/download-url
 * @desc    Generate a signed download URL
 * @access  All authenticated users
 */
router.post('/download-url', asyncHandler(UploadController.getSignedDownloadUrl));

/**
 * @route   GET /api/upload/public-url
 * @desc    Get public URL for a file
 * @access  All authenticated users
 */
router.get('/public-url', asyncHandler(UploadController.getPublicUrl));

/**
 * @route   DELETE /api/upload/file
 * @desc    Delete a file
 * @access  Owner or staff
 */
router.delete('/file', asyncHandler(UploadController.deleteFile));

/**
 * @route   GET /api/upload/my-files/:bucket
 * @desc    List user's files in a bucket
 * @access  All authenticated users
 */
router.get('/my-files/:bucket', asyncHandler(UploadController.listMyFiles));

export default router;
