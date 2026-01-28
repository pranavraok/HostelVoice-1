"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const upload_controller_1 = require("../controllers/upload.controller");
const middleware_1 = require("../middleware");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(middleware_1.authMiddleware);
/**
 * @route   POST /api/upload/signed-url
 * @desc    Generate a signed upload URL
 * @access  All authenticated users
 */
router.post('/signed-url', (0, middleware_1.asyncHandler)(upload_controller_1.UploadController.getSignedUploadUrl));
/**
 * @route   POST /api/upload/download-url
 * @desc    Generate a signed download URL
 * @access  All authenticated users
 */
router.post('/download-url', (0, middleware_1.asyncHandler)(upload_controller_1.UploadController.getSignedDownloadUrl));
/**
 * @route   GET /api/upload/public-url
 * @desc    Get public URL for a file
 * @access  All authenticated users
 */
router.get('/public-url', (0, middleware_1.asyncHandler)(upload_controller_1.UploadController.getPublicUrl));
/**
 * @route   DELETE /api/upload/file
 * @desc    Delete a file
 * @access  Owner or staff
 */
router.delete('/file', (0, middleware_1.asyncHandler)(upload_controller_1.UploadController.deleteFile));
/**
 * @route   GET /api/upload/my-files/:bucket
 * @desc    List user's files in a bucket
 * @access  All authenticated users
 */
router.get('/my-files/:bucket', (0, middleware_1.asyncHandler)(upload_controller_1.UploadController.listMyFiles));
exports.default = router;
//# sourceMappingURL=upload.routes.js.map