import { Router } from 'express';
import { IssuesController } from '../controllers/issues.controller';
import { authMiddleware, staffOnly, asyncHandler } from '../middleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

/**
 * @route   POST /api/issues
 * @desc    Create a new issue
 * @access  All authenticated users
 */
router.post('/', asyncHandler(IssuesController.create));

/**
 * @route   GET /api/issues/my
 * @desc    Get current user's issues
 * @access  All authenticated users
 */
router.get('/my', asyncHandler(IssuesController.getMyIssues));

/**
 * @route   GET /api/issues
 * @desc    Get all issues (with filters)
 * @access  Staff only (caretakers and admins)
 */
router.get('/', staffOnly, asyncHandler(IssuesController.getAllIssues));

/**
 * @route   GET /api/issues/:id
 * @desc    Get a single issue by ID
 * @access  Owner or staff
 */
router.get('/:id', asyncHandler(IssuesController.getById));

/**
 * @route   GET /api/issues/:id/duplicates
 * @desc    Find potential duplicate issues
 * @access  Staff only
 */
router.get('/:id/duplicates', staffOnly, asyncHandler(IssuesController.findDuplicates));

/**
 * @route   PATCH /api/issues/:id/assign
 * @desc    Assign an issue to a caretaker
 * @access  Staff only
 */
router.patch('/:id/assign', staffOnly, asyncHandler(IssuesController.assign));

/**
 * @route   PATCH /api/issues/:id/status
 * @desc    Update issue status
 * @access  Staff only
 */
router.patch('/:id/status', staffOnly, asyncHandler(IssuesController.updateStatus));

/**
 * @route   POST /api/issues/merge
 * @desc    Merge duplicate issues
 * @access  Staff only
 */
router.post('/merge', staffOnly, asyncHandler(IssuesController.merge));

export default router;
