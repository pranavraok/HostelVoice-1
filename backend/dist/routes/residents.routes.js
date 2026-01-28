"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const residents_controller_1 = require("../controllers/residents.controller");
const middleware_1 = require("../middleware");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(middleware_1.authMiddleware);
/**
 * @route   GET /api/residents/me
 * @desc    Get current user's resident profile
 * @access  All authenticated users
 */
router.get('/me', (0, middleware_1.asyncHandler)(residents_controller_1.ResidentsController.getMe));
/**
 * @route   PATCH /api/residents/me
 * @desc    Update current user's resident profile
 * @access  All authenticated users
 */
router.patch('/me', (0, middleware_1.asyncHandler)(residents_controller_1.ResidentsController.updateMe));
/**
 * @route   POST /api/residents
 * @desc    Add or update resident profile for current user
 * @access  All authenticated users
 */
router.post('/', (0, middleware_1.asyncHandler)(residents_controller_1.ResidentsController.add));
/**
 * @route   GET /api/residents
 * @desc    Get residents (role-based: admin=all students, caretaker=hostel students, student=self)
 * @access  All authenticated users
 */
router.get('/', (0, middleware_1.asyncHandler)(residents_controller_1.ResidentsController.getResidents));
/**
 * @route   GET /api/residents/hostel/:hostelName
 * @desc    Get residents by hostel
 * @access  Staff only
 */
router.get('/hostel/:hostelName', middleware_1.staffOnly, (0, middleware_1.asyncHandler)(residents_controller_1.ResidentsController.getByHostel));
/**
 * @route   GET /api/residents/user/:userId
 * @desc    Get resident by user ID
 * @access  Staff only
 */
router.get('/user/:userId', middleware_1.staffOnly, (0, middleware_1.asyncHandler)(residents_controller_1.ResidentsController.getByUserId));
/**
 * @route   GET /api/residents/:id
 * @desc    Get a specific resident by ID
 * @access  Staff only
 */
router.get('/:id', middleware_1.staffOnly, (0, middleware_1.asyncHandler)(residents_controller_1.ResidentsController.getById));
/**
 * @route   PATCH /api/residents/:id
 * @desc    Update a resident
 * @access  Staff only
 */
router.patch('/:id', middleware_1.staffOnly, (0, middleware_1.asyncHandler)(residents_controller_1.ResidentsController.update));
exports.default = router;
//# sourceMappingURL=residents.routes.js.map