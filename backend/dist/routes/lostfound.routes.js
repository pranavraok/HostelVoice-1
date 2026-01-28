"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const lostfound_controller_1 = require("../controllers/lostfound.controller");
const middleware_1 = require("../middleware");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(middleware_1.authMiddleware);
/**
 * @route   GET /api/lostfound
 * @desc    Get open lost and found items
 * @access  All authenticated users
 */
router.get('/', (0, middleware_1.asyncHandler)(lostfound_controller_1.LostFoundController.getOpen));
/**
 * @route   GET /api/lostfound/my
 * @desc    Get user's own lost and found reports
 * @access  All authenticated users
 */
router.get('/my', (0, middleware_1.asyncHandler)(lostfound_controller_1.LostFoundController.getMyItems));
/**
 * @route   GET /api/lostfound/all
 * @desc    Get all items (staff view)
 * @access  Staff only
 */
router.get('/all', middleware_1.staffOnly, (0, middleware_1.asyncHandler)(lostfound_controller_1.LostFoundController.getAll));
/**
 * @route   GET /api/lostfound/:id
 * @desc    Get a single item by ID
 * @access  All authenticated users
 */
router.get('/:id', (0, middleware_1.asyncHandler)(lostfound_controller_1.LostFoundController.getById));
/**
 * @route   POST /api/lostfound
 * @desc    Report a lost or found item
 * @access  All authenticated users
 */
router.post('/', (0, middleware_1.asyncHandler)(lostfound_controller_1.LostFoundController.report));
/**
 * @route   PATCH /api/lostfound/:id/claim
 * @desc    Claim an item
 * @access  All authenticated users
 */
router.patch('/:id/claim', (0, middleware_1.asyncHandler)(lostfound_controller_1.LostFoundController.claim));
/**
 * @route   PATCH /api/lostfound/:id/close
 * @desc    Close an item (mark as returned or resolved)
 * @access  Reporter or staff
 */
router.patch('/:id/close', (0, middleware_1.asyncHandler)(lostfound_controller_1.LostFoundController.close));
exports.default = router;
//# sourceMappingURL=lostfound.routes.js.map