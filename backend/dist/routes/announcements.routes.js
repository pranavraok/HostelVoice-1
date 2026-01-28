"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const announcements_controller_1 = require("../controllers/announcements.controller");
const middleware_1 = require("../middleware");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(middleware_1.authMiddleware);
/**
 * @route   GET /api/announcements
 * @desc    Get announcements targeted to the current user
 * @access  All authenticated users
 */
router.get('/', (0, middleware_1.asyncHandler)(announcements_controller_1.AnnouncementsController.getTargeted));
/**
 * @route   GET /api/announcements/all
 * @desc    Get all announcements (for staff management)
 * @access  Staff only
 */
router.get('/all', middleware_1.staffOnly, (0, middleware_1.asyncHandler)(announcements_controller_1.AnnouncementsController.getAll));
/**
 * @route   GET /api/announcements/:id
 * @desc    Get a single announcement by ID
 * @access  All authenticated users
 */
router.get('/:id', (0, middleware_1.asyncHandler)(announcements_controller_1.AnnouncementsController.getById));
/**
 * @route   POST /api/announcements
 * @desc    Create a new announcement
 * @access  Staff only (caretakers and admins)
 */
router.post('/', middleware_1.staffOnly, (0, middleware_1.asyncHandler)(announcements_controller_1.AnnouncementsController.create));
/**
 * @route   PATCH /api/announcements/:id
 * @desc    Update an announcement
 * @access  Creator or admin
 */
router.patch('/:id', middleware_1.staffOnly, (0, middleware_1.asyncHandler)(announcements_controller_1.AnnouncementsController.update));
/**
 * @route   PATCH /api/announcements/:id/toggle
 * @desc    Toggle announcement active status
 * @access  Staff only
 */
router.patch('/:id/toggle', middleware_1.staffOnly, (0, middleware_1.asyncHandler)(announcements_controller_1.AnnouncementsController.toggleActive));
/**
 * @route   DELETE /api/announcements/:id
 * @desc    Delete an announcement
 * @access  Creator or admin
 */
router.delete('/:id', middleware_1.staffOnly, (0, middleware_1.asyncHandler)(announcements_controller_1.AnnouncementsController.delete));
exports.default = router;
//# sourceMappingURL=announcements.routes.js.map