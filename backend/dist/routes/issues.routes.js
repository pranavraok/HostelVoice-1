"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const issues_controller_1 = require("../controllers/issues.controller");
const middleware_1 = require("../middleware");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(middleware_1.authMiddleware);
/**
 * @route   POST /api/issues
 * @desc    Create a new issue
 * @access  All authenticated users
 */
router.post('/', (0, middleware_1.asyncHandler)(issues_controller_1.IssuesController.create));
/**
 * @route   GET /api/issues/my
 * @desc    Get current user's issues
 * @access  All authenticated users
 */
router.get('/my', (0, middleware_1.asyncHandler)(issues_controller_1.IssuesController.getMyIssues));
/**
 * @route   GET /api/issues
 * @desc    Get all issues (with filters)
 * @access  Staff only (caretakers and admins)
 */
router.get('/', middleware_1.staffOnly, (0, middleware_1.asyncHandler)(issues_controller_1.IssuesController.getAllIssues));
/**
 * @route   GET /api/issues/:id
 * @desc    Get a single issue by ID
 * @access  Owner or staff
 */
router.get('/:id', (0, middleware_1.asyncHandler)(issues_controller_1.IssuesController.getById));
/**
 * @route   GET /api/issues/:id/duplicates
 * @desc    Find potential duplicate issues
 * @access  Staff only
 */
router.get('/:id/duplicates', middleware_1.staffOnly, (0, middleware_1.asyncHandler)(issues_controller_1.IssuesController.findDuplicates));
/**
 * @route   PATCH /api/issues/:id/assign
 * @desc    Assign an issue to a caretaker
 * @access  Staff only
 */
router.patch('/:id/assign', middleware_1.staffOnly, (0, middleware_1.asyncHandler)(issues_controller_1.IssuesController.assign));
/**
 * @route   PATCH /api/issues/:id/status
 * @desc    Update issue status
 * @access  Staff only
 */
router.patch('/:id/status', middleware_1.staffOnly, (0, middleware_1.asyncHandler)(issues_controller_1.IssuesController.updateStatus));
/**
 * @route   POST /api/issues/merge
 * @desc    Merge duplicate issues
 * @access  Staff only
 */
router.post('/merge', middleware_1.staffOnly, (0, middleware_1.asyncHandler)(issues_controller_1.IssuesController.merge));
exports.default = router;
//# sourceMappingURL=issues.routes.js.map