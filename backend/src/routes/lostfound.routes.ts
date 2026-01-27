import { Router } from 'express';
import { LostFoundController } from '../controllers/lostfound.controller';
import { authMiddleware, staffOnly, asyncHandler } from '../middleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

/**
 * @route   GET /api/lostfound
 * @desc    Get open lost and found items
 * @access  All authenticated users
 */
router.get('/', asyncHandler(LostFoundController.getOpen));

/**
 * @route   GET /api/lostfound/my
 * @desc    Get user's own lost and found reports
 * @access  All authenticated users
 */
router.get('/my', asyncHandler(LostFoundController.getMyItems));

/**
 * @route   GET /api/lostfound/all
 * @desc    Get all items (staff view)
 * @access  Staff only
 */
router.get('/all', staffOnly, asyncHandler(LostFoundController.getAll));

/**
 * @route   GET /api/lostfound/:id
 * @desc    Get a single item by ID
 * @access  All authenticated users
 */
router.get('/:id', asyncHandler(LostFoundController.getById));

/**
 * @route   POST /api/lostfound
 * @desc    Report a lost or found item
 * @access  All authenticated users
 */
router.post('/', asyncHandler(LostFoundController.report));

/**
 * @route   PATCH /api/lostfound/:id/claim
 * @desc    Claim an item
 * @access  All authenticated users
 */
router.patch('/:id/claim', asyncHandler(LostFoundController.claim));

/**
 * @route   PATCH /api/lostfound/:id/close
 * @desc    Close an item (mark as returned or resolved)
 * @access  Reporter or staff
 */
router.patch('/:id/close', asyncHandler(LostFoundController.close));

export default router;
