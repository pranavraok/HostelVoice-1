"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiError = void 0;
exports.asyncHandler = asyncHandler;
exports.notFoundHandler = notFoundHandler;
exports.errorHandler = errorHandler;
const config_1 = require("../config");
/**
 * Custom error class for API errors
 */
class ApiError extends Error {
    statusCode;
    isOperational;
    constructor(message, statusCode = 500, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.ApiError = ApiError;
/**
 * Async handler wrapper to catch errors in async route handlers
 */
function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}
/**
 * Not Found Handler
 */
function notFoundHandler(req, res) {
    const response = {
        success: false,
        message: `Cannot ${req.method} ${req.originalUrl}`,
        error: 'Route not found',
    };
    res.status(404).json(response);
}
/**
 * Global Error Handler
 */
function errorHandler(err, req, res, 
// eslint-disable-next-line @typescript-eslint/no-unused-vars
next) {
    let statusCode = 500;
    let message = 'Internal server error';
    let error;
    if (err instanceof ApiError) {
        statusCode = err.statusCode;
        message = err.message;
    }
    else if (err instanceof Error) {
        message = err.message;
        error = config_1.env.NODE_ENV === 'development' ? err.stack : undefined;
    }
    // Log error
    console.error(`[ERROR] ${new Date().toISOString()}:`, {
        message: err.message,
        stack: config_1.env.NODE_ENV === 'development' ? err.stack : undefined,
        path: req.path,
        method: req.method,
        userId: req.user?.id,
    });
    const response = {
        success: false,
        message,
        error,
    };
    res.status(statusCode).json(response);
}
exports.default = errorHandler;
//# sourceMappingURL=errorHandler.js.map