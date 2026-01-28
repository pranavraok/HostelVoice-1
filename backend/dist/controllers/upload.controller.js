"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadController = void 0;
const services_1 = require("../services");
const response_1 = require("../utils/response");
const validators_1 = require("../utils/validators");
/**
 * Upload Controller
 * Handles file upload operations via Supabase Storage
 */
class UploadController {
    /**
     * Generate a signed upload URL
     * POST /api/upload/signed-url
     */
    static async getSignedUploadUrl(req, res) {
        const user = req.user;
        const data = (0, validators_1.validate)(validators_1.signedUrlSchema, req.body);
        // Validate file type before generating URL
        if (!services_1.FileUploadService.validateFileType(data.contentType)) {
            (0, response_1.sendError)(res, `Invalid file type: ${data.contentType}. Allowed types: image/jpeg, image/png, image/webp, application/pdf`, 400);
            return;
        }
        const result = await services_1.FileUploadService.generateSignedUploadUrl(data.bucket, user.id, data.filename, data.contentType);
        (0, response_1.sendSuccess)(res, 'Signed upload URL generated', {
            ...result,
            bucket: data.bucket,
            contentType: data.contentType,
        });
    }
    /**
     * Generate a signed download URL
     * POST /api/upload/download-url
     */
    static async getSignedDownloadUrl(req, res) {
        const { bucket, path } = req.body;
        if (!bucket || !path) {
            (0, response_1.sendError)(res, 'Bucket and path are required', 400);
            return;
        }
        const validBuckets = ['issue-images', 'lost-found-images', 'announcement-attachments', 'resident-documents'];
        if (!validBuckets.includes(bucket)) {
            (0, response_1.sendError)(res, 'Invalid bucket', 400);
            return;
        }
        const signedUrl = await services_1.FileUploadService.generateSignedDownloadUrl(bucket, path, 3600 // 1 hour expiry
        );
        (0, response_1.sendSuccess)(res, 'Signed download URL generated', { signedUrl, expiresIn: 3600 });
    }
    /**
     * Get public URL for a file
     * GET /api/upload/public-url
     */
    static async getPublicUrl(req, res) {
        const { bucket, path } = req.query;
        if (!bucket || !path) {
            (0, response_1.sendError)(res, 'Bucket and path are required', 400);
            return;
        }
        const validBuckets = ['issue-images', 'lost-found-images', 'announcement-attachments'];
        if (!validBuckets.includes(bucket)) {
            (0, response_1.sendError)(res, 'Invalid bucket or bucket is not public', 400);
            return;
        }
        const publicUrl = services_1.FileUploadService.getPublicUrl(bucket, path);
        (0, response_1.sendSuccess)(res, 'Public URL retrieved', { publicUrl });
    }
    /**
     * Delete a file
     * DELETE /api/upload/file
     */
    static async deleteFile(req, res) {
        const user = req.user;
        const { bucket, path } = req.body;
        if (!bucket || !path) {
            (0, response_1.sendError)(res, 'Bucket and path are required', 400);
            return;
        }
        const validBuckets = ['issue-images', 'lost-found-images', 'announcement-attachments', 'resident-documents'];
        if (!validBuckets.includes(bucket)) {
            (0, response_1.sendError)(res, 'Invalid bucket', 400);
            return;
        }
        // Verify user owns the file (path starts with user ID) or is staff
        if (!path.startsWith(user.id) && user.role === 'student') {
            (0, response_1.sendError)(res, 'Access denied. You can only delete your own files.', 403);
            return;
        }
        await services_1.FileUploadService.deleteFile(bucket, path);
        (0, response_1.sendSuccess)(res, 'File deleted successfully');
    }
    /**
     * List user's files in a bucket
     * GET /api/upload/my-files/:bucket
     */
    static async listMyFiles(req, res) {
        const user = req.user;
        const { bucket } = req.params;
        const validBuckets = ['issue-images', 'lost-found-images', 'announcement-attachments', 'resident-documents'];
        if (!validBuckets.includes(bucket)) {
            (0, response_1.sendError)(res, 'Invalid bucket', 400);
            return;
        }
        const files = await services_1.FileUploadService.listUserFiles(bucket, user.id);
        (0, response_1.sendSuccess)(res, 'Files retrieved', files);
    }
}
exports.UploadController = UploadController;
exports.default = UploadController;
//# sourceMappingURL=upload.controller.js.map