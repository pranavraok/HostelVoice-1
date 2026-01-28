"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileUploadService = void 0;
const config_1 = require("../config");
const config_2 = require("../config");
const middleware_1 = require("../middleware");
/**
 * File Upload Service
 * Handles Supabase Storage operations including signed URL generation
 */
class FileUploadService {
    static ALLOWED_MIME_TYPES = config_2.env.ALLOWED_FILE_TYPES;
    static MAX_FILE_SIZE_BYTES = config_2.env.MAX_FILE_SIZE_MB * 1024 * 1024;
    /**
     * Validate file type
     */
    static validateFileType(contentType) {
        return this.ALLOWED_MIME_TYPES.includes(contentType);
    }
    /**
     * Validate file size (in bytes)
     */
    static validateFileSize(size) {
        return size <= this.MAX_FILE_SIZE_BYTES;
    }
    /**
     * Generate a unique file path
     */
    static generateFilePath(userId, originalFilename) {
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 8);
        const extension = originalFilename.split('.').pop() || 'file';
        const sanitizedFilename = originalFilename
            .replace(/[^a-zA-Z0-9.-]/g, '_')
            .substring(0, 50);
        return `${userId}/${timestamp}-${randomString}-${sanitizedFilename}`;
    }
    /**
     * Generate a signed upload URL for a file
     * This allows the frontend to upload directly to Supabase Storage
     */
    static async generateSignedUploadUrl(bucket, userId, filename, contentType, expiresIn = 3600 // 1 hour default
    ) {
        // Validate file type
        if (!this.validateFileType(contentType)) {
            throw new middleware_1.ApiError(`Invalid file type. Allowed types: ${this.ALLOWED_MIME_TYPES.join(', ')}`, 400);
        }
        const path = this.generateFilePath(userId, filename);
        const { data, error } = await config_1.supabaseAdmin.storage
            .from(bucket)
            .createSignedUploadUrl(path, {
            upsert: false,
        });
        if (error) {
            throw new middleware_1.ApiError(`Failed to generate upload URL: ${error.message}`, 500);
        }
        return {
            signedUrl: data.signedUrl,
            path: data.path,
            expiresIn,
        };
    }
    /**
     * Generate a signed download URL for a file
     */
    static async generateSignedDownloadUrl(bucket, path, expiresIn = 3600 // 1 hour default
    ) {
        const { data, error } = await config_1.supabaseAdmin.storage
            .from(bucket)
            .createSignedUrl(path, expiresIn);
        if (error) {
            throw new middleware_1.ApiError(`Failed to generate download URL: ${error.message}`, 500);
        }
        return data.signedUrl;
    }
    /**
     * Get public URL for a file (for public buckets)
     */
    static getPublicUrl(bucket, path) {
        const { data } = config_1.supabaseAdmin.storage.from(bucket).getPublicUrl(path);
        return data.publicUrl;
    }
    /**
     * Delete a file from storage
     */
    static async deleteFile(bucket, path) {
        const { error } = await config_1.supabaseAdmin.storage.from(bucket).remove([path]);
        if (error) {
            throw new middleware_1.ApiError(`Failed to delete file: ${error.message}`, 500);
        }
    }
    /**
     * Delete multiple files from storage
     */
    static async deleteFiles(bucket, paths) {
        if (paths.length === 0)
            return;
        const { error } = await config_1.supabaseAdmin.storage.from(bucket).remove(paths);
        if (error) {
            throw new middleware_1.ApiError(`Failed to delete files: ${error.message}`, 500);
        }
    }
    /**
     * List files in a user's folder
     */
    static async listUserFiles(bucket, userId) {
        const { data, error } = await config_1.supabaseAdmin.storage.from(bucket).list(userId, {
            limit: 100,
            sortBy: { column: 'created_at', order: 'desc' },
        });
        if (error) {
            throw new middleware_1.ApiError(`Failed to list files: ${error.message}`, 500);
        }
        return (data || []).map((file) => ({
            name: file.name,
            size: file.metadata?.size || 0,
            createdAt: file.created_at,
        }));
    }
    /**
     * Get file metadata
     */
    static async getFileMetadata(bucket, path) {
        const { data, error } = await config_1.supabaseAdmin.storage.from(bucket).list(path.substring(0, path.lastIndexOf('/')), {
            search: path.substring(path.lastIndexOf('/') + 1),
        });
        if (error || !data || data.length === 0) {
            return null;
        }
        const file = data[0];
        return {
            size: file.metadata?.size || 0,
            contentType: file.metadata?.mimetype || 'application/octet-stream',
            createdAt: file.created_at,
        };
    }
    /**
     * Move/rename a file
     */
    static async moveFile(bucket, fromPath, toPath) {
        const { error } = await config_1.supabaseAdmin.storage.from(bucket).move(fromPath, toPath);
        if (error) {
            throw new middleware_1.ApiError(`Failed to move file: ${error.message}`, 500);
        }
    }
    /**
     * Copy a file
     */
    static async copyFile(bucket, fromPath, toPath) {
        const { error } = await config_1.supabaseAdmin.storage.from(bucket).copy(fromPath, toPath);
        if (error) {
            throw new middleware_1.ApiError(`Failed to copy file: ${error.message}`, 500);
        }
    }
}
exports.FileUploadService = FileUploadService;
exports.default = FileUploadService;
//# sourceMappingURL=fileUpload.service.js.map