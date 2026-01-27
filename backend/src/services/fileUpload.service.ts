import { supabaseAdmin } from '../config';
import { env } from '../config';
import { ApiError } from '../middleware';

interface SignedUrlResult {
  signedUrl: string;
  path: string;
  expiresIn: number;
}

type StorageBucket = 'issue-images' | 'lost-found-images' | 'announcement-attachments' | 'resident-documents';

/**
 * File Upload Service
 * Handles Supabase Storage operations including signed URL generation
 */
export class FileUploadService {
  private static readonly ALLOWED_MIME_TYPES = env.ALLOWED_FILE_TYPES;
  private static readonly MAX_FILE_SIZE_BYTES = env.MAX_FILE_SIZE_MB * 1024 * 1024;

  /**
   * Validate file type
   */
  static validateFileType(contentType: string): boolean {
    return this.ALLOWED_MIME_TYPES.includes(contentType);
  }

  /**
   * Validate file size (in bytes)
   */
  static validateFileSize(size: number): boolean {
    return size <= this.MAX_FILE_SIZE_BYTES;
  }

  /**
   * Generate a unique file path
   */
  static generateFilePath(userId: string, originalFilename: string): string {
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
  static async generateSignedUploadUrl(
    bucket: StorageBucket,
    userId: string,
    filename: string,
    contentType: string,
    expiresIn: number = 3600 // 1 hour default
  ): Promise<SignedUrlResult> {
    // Validate file type
    if (!this.validateFileType(contentType)) {
      throw new ApiError(
        `Invalid file type. Allowed types: ${this.ALLOWED_MIME_TYPES.join(', ')}`,
        400
      );
    }

    const path = this.generateFilePath(userId, filename);

    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .createSignedUploadUrl(path, {
        upsert: false,
      });

    if (error) {
      throw new ApiError(`Failed to generate upload URL: ${error.message}`, 500);
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
  static async generateSignedDownloadUrl(
    bucket: StorageBucket,
    path: string,
    expiresIn: number = 3600 // 1 hour default
  ): Promise<string> {
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);

    if (error) {
      throw new ApiError(`Failed to generate download URL: ${error.message}`, 500);
    }

    return data.signedUrl;
  }

  /**
   * Get public URL for a file (for public buckets)
   */
  static getPublicUrl(bucket: StorageBucket, path: string): string {
    const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }

  /**
   * Delete a file from storage
   */
  static async deleteFile(bucket: StorageBucket, path: string): Promise<void> {
    const { error } = await supabaseAdmin.storage.from(bucket).remove([path]);

    if (error) {
      throw new ApiError(`Failed to delete file: ${error.message}`, 500);
    }
  }

  /**
   * Delete multiple files from storage
   */
  static async deleteFiles(bucket: StorageBucket, paths: string[]): Promise<void> {
    if (paths.length === 0) return;

    const { error } = await supabaseAdmin.storage.from(bucket).remove(paths);

    if (error) {
      throw new ApiError(`Failed to delete files: ${error.message}`, 500);
    }
  }

  /**
   * List files in a user's folder
   */
  static async listUserFiles(
    bucket: StorageBucket,
    userId: string
  ): Promise<{ name: string; size: number; createdAt: string }[]> {
    const { data, error } = await supabaseAdmin.storage.from(bucket).list(userId, {
      limit: 100,
      sortBy: { column: 'created_at', order: 'desc' },
    });

    if (error) {
      throw new ApiError(`Failed to list files: ${error.message}`, 500);
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
  static async getFileMetadata(
    bucket: StorageBucket,
    path: string
  ): Promise<{ size: number; contentType: string; createdAt: string } | null> {
    const { data, error } = await supabaseAdmin.storage.from(bucket).list(
      path.substring(0, path.lastIndexOf('/')),
      {
        search: path.substring(path.lastIndexOf('/') + 1),
      }
    );

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
  static async moveFile(
    bucket: StorageBucket,
    fromPath: string,
    toPath: string
  ): Promise<void> {
    const { error } = await supabaseAdmin.storage.from(bucket).move(fromPath, toPath);

    if (error) {
      throw new ApiError(`Failed to move file: ${error.message}`, 500);
    }
  }

  /**
   * Copy a file
   */
  static async copyFile(
    bucket: StorageBucket,
    fromPath: string,
    toPath: string
  ): Promise<void> {
    const { error } = await supabaseAdmin.storage.from(bucket).copy(fromPath, toPath);

    if (error) {
      throw new ApiError(`Failed to copy file: ${error.message}`, 500);
    }
  }
}

export default FileUploadService;
