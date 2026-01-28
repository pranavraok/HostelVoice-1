"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSuccess = sendSuccess;
exports.sendError = sendError;
exports.sendCreated = sendCreated;
exports.sendNoContent = sendNoContent;
exports.sendPaginated = sendPaginated;
exports.parsePaginationParams = parsePaginationParams;
exports.getOffset = getOffset;
/**
 * Send a success response
 */
function sendSuccess(res, message, data, statusCode = 200, meta) {
    const response = {
        success: true,
        message,
        data,
        meta,
    };
    res.status(statusCode).json(response);
}
/**
 * Send an error response
 */
function sendError(res, message, statusCode = 400, error) {
    const response = {
        success: false,
        message,
        error,
    };
    res.status(statusCode).json(response);
}
/**
 * Send a created response (201)
 */
function sendCreated(res, message, data) {
    sendSuccess(res, message, data, 201);
}
/**
 * Send a no content response (204)
 */
function sendNoContent(res) {
    res.status(204).send();
}
/**
 * Send a paginated response
 */
function sendPaginated(res, message, data, pagination, total) {
    const totalPages = Math.ceil(total / pagination.limit);
    sendSuccess(res, message, data, 200, {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages,
    });
}
/**
 * Parse pagination params from query
 */
function parsePaginationParams(query) {
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10));
    const sortBy = query.sortBy || 'created_at';
    const sortOrder = query.sortOrder || 'desc';
    return { page, limit, sortBy, sortOrder };
}
/**
 * Calculate offset for pagination
 */
function getOffset(page, limit) {
    return (page - 1) * limit;
}
//# sourceMappingURL=response.js.map