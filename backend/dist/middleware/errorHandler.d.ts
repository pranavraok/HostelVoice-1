import { Request, Response, NextFunction } from 'express';
/**
 * Custom error class for API errors
 */
export declare class ApiError extends Error {
    statusCode: number;
    isOperational: boolean;
    constructor(message: string, statusCode?: number, isOperational?: boolean);
}
/**
 * Async handler wrapper to catch errors in async route handlers
 */
export declare function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<void>): (req: Request, res: Response, next: NextFunction) => void;
/**
 * Not Found Handler
 */
export declare function notFoundHandler(req: Request, res: Response): void;
/**
 * Global Error Handler
 */
export declare function errorHandler(err: Error | ApiError, req: Request, res: Response, next: NextFunction): void;
export default errorHandler;
//# sourceMappingURL=errorHandler.d.ts.map