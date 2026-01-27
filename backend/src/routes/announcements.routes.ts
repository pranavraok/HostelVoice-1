import { Router } from 'express';
import { AnnouncementsController } from '../controllers/announcements.controller';
import { authMiddleware, staffOnly, asyncHandler } from '../middleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

/**
 * @route   GET /api/announcements
 * @desc    Get announcements targeted to the current user
 * @access  All authenticated users
 */
router.get('/', asyncHandler(AnnouncementsController.getTargeted));

/**
 * @route   GET /api/announcements/all
 * @desc    Get all announcements (for staff management)
 * @access  Staff only
 */
router.get('/all', staffOnly, asyncHandler(AnnouncementsController.getAll));

/**
 * @route   GET /api/announcements/:id
 * @desc    Get a single announcement by ID
 * @access  All authenticated users
 */
router.get('/:id', asyncHandler(AnnouncementsController.getById));

/**
 * @route   POST /api/announcements
 * @desc    Create a new announcement
 * @access  Staff only (caretakers and admins)
 */
router.post('/', staffOnly, asyncHandler(AnnouncementsController.create));

/**
 * @route   PATCH /api/announcements/:id
 * @desc    Update an announcement
 * @access  Creator or admin
 */
router.patch('/:id', staffOnly, asyncHandler(AnnouncementsController.update));

/**
 * @route   PATCH /api/announcements/:id/toggle
 * @desc    Toggle announcement active status
 * @access  Staff only
 */
router.patch('/:id/toggle', staffOnly, asyncHandler(AnnouncementsController.toggleActive));

/**
 * @route   DELETE /api/announcements/:id
 * @desc    Delete an announcement
 * @access  Creator or admin
 */
router.delete('/:id', staffOnly, asyncHandler(AnnouncementsController.delete));

export default router;
