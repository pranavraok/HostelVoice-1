import { Router } from 'express';
import { ResidentsController } from '../controllers/residents.controller';
import { authMiddleware, staffOnly, asyncHandler } from '../middleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

/**
 * @route   GET /api/residents/me
 * @desc    Get current user's resident profile
 * @access  All authenticated users
 */
router.get('/me', asyncHandler(ResidentsController.getMe));

/**
 * @route   PATCH /api/residents/me
 * @desc    Update current user's resident profile
 * @access  All authenticated users
 */
router.patch('/me', asyncHandler(ResidentsController.updateMe));

/**
 * @route   POST /api/residents
 * @desc    Add or update resident profile for current user
 * @access  All authenticated users
 */
router.post('/', asyncHandler(ResidentsController.add));

/**
 * @route   GET /api/residents
 * @desc    Get all residents
 * @access  Staff only
 */
router.get('/', staffOnly, asyncHandler(ResidentsController.getAll));

/**
 * @route   GET /api/residents/hostel/:hostelName
 * @desc    Get residents by hostel
 * @access  Staff only
 */
router.get('/hostel/:hostelName', staffOnly, asyncHandler(ResidentsController.getByHostel));

/**
 * @route   GET /api/residents/user/:userId
 * @desc    Get resident by user ID
 * @access  Staff only
 */
router.get('/user/:userId', staffOnly, asyncHandler(ResidentsController.getByUserId));

/**
 * @route   GET /api/residents/:id
 * @desc    Get a specific resident by ID
 * @access  Staff only
 */
router.get('/:id', staffOnly, asyncHandler(ResidentsController.getById));

/**
 * @route   PATCH /api/residents/:id
 * @desc    Update a resident
 * @access  Staff only
 */
router.patch('/:id', staffOnly, asyncHandler(ResidentsController.update));

export default router;
