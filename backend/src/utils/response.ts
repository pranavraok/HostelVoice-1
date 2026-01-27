import { Response } from 'express';
import { ApiResponse, PaginationParams } from '../types';

/**
 * Send a success response
 */
export function sendSuccess<T>(
  res: Response,
  message: string,
  data?: T,
  statusCode: number = 200,
  meta?: ApiResponse['meta']
): void {
  const response: ApiResponse<T> = {
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
export function sendError(
  res: Response,
  message: string,
  statusCode: number = 400,
  error?: string
): void {
  const response: ApiResponse = {
    success: false,
    message,
    error,
  };
  res.status(statusCode).json(response);
}

/**
 * Send a created response (201)
 */
export function sendCreated<T>(res: Response, message: string, data?: T): void {
  sendSuccess(res, message, data, 201);
}

/**
 * Send a no content response (204)
 */
export function sendNoContent(res: Response): void {
  res.status(204).send();
}

/**
 * Send a paginated response
 */
export function sendPaginated<T>(
  res: Response,
  message: string,
  data: T[],
  pagination: PaginationParams,
  total: number
): void {
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
export function parsePaginationParams(query: Record<string, unknown>): PaginationParams {
  const page = Math.max(1, parseInt(query.page as string) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit as string) || 10));
  const sortBy = (query.sortBy as string) || 'created_at';
  const sortOrder = (query.sortOrder as 'asc' | 'desc') || 'desc';

  return { page, limit, sortBy, sortOrder };
}

/**
 * Calculate offset for pagination
 */
export function getOffset(page: number, limit: number): number {
  return (page - 1) * limit;
}
