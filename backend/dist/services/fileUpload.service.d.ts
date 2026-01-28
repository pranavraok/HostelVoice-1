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
export declare class FileUploadService {
    private static readonly ALLOWED_MIME_TYPES;
    private static readonly MAX_FILE_SIZE_BYTES;
    /**
     * Validate file type
     */
    static validateFileType(contentType: string): boolean;
    /**
     * Validate file size (in bytes)
     */
    static validateFileSize(size: number): boolean;
    /**
     * Generate a unique file path
     */
    static generateFilePath(userId: string, originalFilename: string): string;
    /**
     * Generate a signed upload URL for a file
     * This allows the frontend to upload directly to Supabase Storage
     */
    static generateSignedUploadUrl(bucket: StorageBucket, userId: string, filename: string, contentType: string, expiresIn?: number): Promise<SignedUrlResult>;
    /**
     * Generate a signed download URL for a file
     */
    static generateSignedDownloadUrl(bucket: StorageBucket, path: string, expiresIn?: number): Promise<string>;
    /**
     * Get public URL for a file (for public buckets)
     */
    static getPublicUrl(bucket: StorageBucket, path: string): string;
    /**
     * Delete a file from storage
     */
    static deleteFile(bucket: StorageBucket, path: string): Promise<void>;
    /**
     * Delete multiple files from storage
     */
    static deleteFiles(bucket: StorageBucket, paths: string[]): Promise<void>;
    /**
     * List files in a user's folder
     */
    static listUserFiles(bucket: StorageBucket, userId: string): Promise<{
        name: string;
        size: number;
        createdAt: string;
    }[]>;
    /**
     * Get file metadata
     */
    static getFileMetadata(bucket: StorageBucket, path: string): Promise<{
        size: number;
        contentType: string;
        createdAt: string;
    } | null>;
    /**
     * Move/rename a file
     */
    static moveFile(bucket: StorageBucket, fromPath: string, toPath: string): Promise<void>;
    /**
     * Copy a file
     */
    static copyFile(bucket: StorageBucket, fromPath: string, toPath: string): Promise<void>;
}
export default FileUploadService;
//# sourceMappingURL=fileUpload.service.d.ts.map