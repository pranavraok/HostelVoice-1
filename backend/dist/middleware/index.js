"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiError = exports.asyncHandler = exports.notFoundHandler = exports.errorHandler = exports.requireOwnerOrStaff = exports.anyRole = exports.staffOnly = exports.adminOnly = exports.caretakerOnly = exports.studentOnly = exports.requireRole = exports.authMiddleware = void 0;
var authMiddleware_1 = require("./authMiddleware");
Object.defineProperty(exports, "authMiddleware", { enumerable: true, get: function () { return authMiddleware_1.authMiddleware; } });
var roleMiddleware_1 = require("./roleMiddleware");
Object.defineProperty(exports, "requireRole", { enumerable: true, get: function () { return roleMiddleware_1.requireRole; } });
Object.defineProperty(exports, "studentOnly", { enumerable: true, get: function () { return roleMiddleware_1.studentOnly; } });
Object.defineProperty(exports, "caretakerOnly", { enumerable: true, get: function () { return roleMiddleware_1.caretakerOnly; } });
Object.defineProperty(exports, "adminOnly", { enumerable: true, get: function () { return roleMiddleware_1.adminOnly; } });
Object.defineProperty(exports, "staffOnly", { enumerable: true, get: function () { return roleMiddleware_1.staffOnly; } });
Object.defineProperty(exports, "anyRole", { enumerable: true, get: function () { return roleMiddleware_1.anyRole; } });
Object.defineProperty(exports, "requireOwnerOrStaff", { enumerable: true, get: function () { return roleMiddleware_1.requireOwnerOrStaff; } });
var errorHandler_1 = require("./errorHandler");
Object.defineProperty(exports, "errorHandler", { enumerable: true, get: function () { return errorHandler_1.errorHandler; } });
Object.defineProperty(exports, "notFoundHandler", { enumerable: true, get: function () { return errorHandler_1.notFoundHandler; } });
Object.defineProperty(exports, "asyncHandler", { enumerable: true, get: function () { return errorHandler_1.asyncHandler; } });
Object.defineProperty(exports, "ApiError", { enumerable: true, get: function () { return errorHandler_1.ApiError; } });
//# sourceMappingURL=index.js.map