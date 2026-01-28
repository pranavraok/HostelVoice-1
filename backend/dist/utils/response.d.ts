import { Response } from 'express';
import { ApiResponse, PaginationParams } from '../types';
/**
 * Send a success response
 */
export declare function sendSuccess<T>(res: Response, message: string, data?: T, statusCode?: number, meta?: ApiResponse['meta']): void;
/**
 * Send an error response
 */
export declare function sendError(res: Response, message: string, statusCode?: number, error?: string): void;
/**
 * Send a created response (201)
 */
export declare function sendCreated<T>(res: Response, message: string, data?: T): void;
/**
 * Send a no content response (204)
 */
export declare function sendNoContent(res: Response): void;
/**
 * Send a paginated response
 */
export declare function sendPaginated<T>(res: Response, message: string, data: T[], pagination: PaginationParams, total: number): void;
/**
 * Parse pagination params from query
 */
export declare function parsePaginationParams(query: Record<string, unknown>): PaginationParams;
/**
 * Calculate offset for pagination
 */
export declare function getOffset(page: number, limit: number): number;
//# sourceMappingURL=response.d.ts.map