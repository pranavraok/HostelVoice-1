import { Request, Response } from 'express';
import { FileUploadService } from '../services';
import { sendSuccess, sendError } from '../utils/response';
import { validate, signedUrlSchema } from '../utils/validators';

/**
 * Upload Controller
 * Handles file upload operations via Supabase Storage
 */
export class UploadController {
  /**
   * Generate a signed upload URL
   * POST /api/upload/signed-url
   */
  static async getSignedUploadUrl(req: Request, res: Response): Promise<void> {
    const user = req.user!;
    const data = validate(signedUrlSchema, req.body);

    // Validate file type before generating URL
    if (!FileUploadService.validateFileType(data.contentType)) {
      sendError(
        res,
        `Invalid file type: ${data.contentType}. Allowed types: image/jpeg, image/png, image/webp, application/pdf`,
        400
      );
      return;
    }

    const result = await FileUploadService.generateSignedUploadUrl(
      data.bucket,
      user.id,
      data.filename,
      data.contentType
    );

    sendSuccess(res, 'Signed upload URL generated', {
      ...result,
      bucket: data.bucket,
      contentType: data.contentType,
    });
  }

  /**
   * Generate a signed download URL
   * POST /api/upload/download-url
   */
  static async getSignedDownloadUrl(req: Request, res: Response): Promise<void> {
    const { bucket, path } = req.body;

    if (!bucket || !path) {
      sendError(res, 'Bucket and path are required', 400);
      return;
    }

    const validBuckets = ['issue-images', 'lost-found-images', 'announcement-attachments', 'resident-documents'];
    if (!validBuckets.includes(bucket)) {
      sendError(res, 'Invalid bucket', 400);
      return;
    }

    const signedUrl = await FileUploadService.generateSignedDownloadUrl(
      bucket as Parameters<typeof FileUploadService.generateSignedDownloadUrl>[0],
      path,
      3600 // 1 hour expiry
    );

    sendSuccess(res, 'Signed download URL generated', { signedUrl, expiresIn: 3600 });
  }

  /**
   * Get public URL for a file
   * GET /api/upload/public-url
   */
  static async getPublicUrl(req: Request, res: Response): Promise<void> {
    const { bucket, path } = req.query;

    if (!bucket || !path) {
      sendError(res, 'Bucket and path are required', 400);
      return;
    }

    const validBuckets = ['issue-images', 'lost-found-images', 'announcement-attachments'];
    if (!validBuckets.includes(bucket as string)) {
      sendError(res, 'Invalid bucket or bucket is not public', 400);
      return;
    }

    const publicUrl = FileUploadService.getPublicUrl(
      bucket as Parameters<typeof FileUploadService.getPublicUrl>[0],
      path as string
    );

    sendSuccess(res, 'Public URL retrieved', { publicUrl });
  }

  /**
   * Delete a file
   * DELETE /api/upload/file
   */
  static async deleteFile(req: Request, res: Response): Promise<void> {
    const user = req.user!;
    const { bucket, path } = req.body;

    if (!bucket || !path) {
      sendError(res, 'Bucket and path are required', 400);
      return;
    }

    const validBuckets = ['issue-images', 'lost-found-images', 'announcement-attachments', 'resident-documents'];
    if (!validBuckets.includes(bucket)) {
      sendError(res, 'Invalid bucket', 400);
      return;
    }

    // Verify user owns the file (path starts with user ID) or is staff
    if (!path.startsWith(user.id) && user.role === 'student') {
      sendError(res, 'Access denied. You can only delete your own files.', 403);
      return;
    }

    await FileUploadService.deleteFile(
      bucket as Parameters<typeof FileUploadService.deleteFile>[0],
      path
    );

    sendSuccess(res, 'File deleted successfully');
  }

  /**
   * List user's files in a bucket
   * GET /api/upload/my-files/:bucket
   */
  static async listMyFiles(req: Request, res: Response): Promise<void> {
    const user = req.user!;
    const { bucket } = req.params;

    const validBuckets = ['issue-images', 'lost-found-images', 'announcement-attachments', 'resident-documents'];
    if (!validBuckets.includes(bucket)) {
      sendError(res, 'Invalid bucket', 400);
      return;
    }

    const files = await FileUploadService.listUserFiles(
      bucket as Parameters<typeof FileUploadService.listUserFiles>[0],
      user.id
    );

    sendSuccess(res, 'Files retrieved', files);
  }
}

export default UploadController;
