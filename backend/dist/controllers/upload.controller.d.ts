import { Request, Response } from 'express';
/**
 * Upload Controller
 * Handles file upload operations via Supabase Storage
 */
export declare class UploadController {
    /**
     * Generate a signed upload URL
     * POST /api/upload/signed-url
     */
    static getSignedUploadUrl(req: Request, res: Response): Promise<void>;
    /**
     * Generate a signed download URL
     * POST /api/upload/download-url
     */
    static getSignedDownloadUrl(req: Request, res: Response): Promise<void>;
    /**
     * Get public URL for a file
     * GET /api/upload/public-url
     */
    static getPublicUrl(req: Request, res: Response): Promise<void>;
    /**
     * Delete a file
     * DELETE /api/upload/file
     */
    static deleteFile(req: Request, res: Response): Promise<void>;
    /**
     * List user's files in a bucket
     * GET /api/upload/my-files/:bucket
     */
    static listMyFiles(req: Request, res: Response): Promise<void>;
}
export default UploadController;
//# sourceMappingURL=upload.controller.d.ts.map