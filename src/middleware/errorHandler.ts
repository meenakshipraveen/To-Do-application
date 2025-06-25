import { Request, Response, NextFunction } from 'express';
import { Logger } from '../utils/logger';

/**
 * Error handling middleware for Express application
 * Provides centralized error handling with proper logging and user-friendly responses
 */

/**
 * Custom error class for application-specific errors
 */
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error response interface
 */
interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code?: string;
    details?: any;
  };
  timestamp: string;
  path: string;
}

/**
 * Creates a standardized error response
 * @param message - Error message
 * @param statusCode - HTTP status code
 * @param path - Request path where error occurred
 * @param details - Additional error details
 * @returns Formatted error response object
 */
function createErrorResponse(
  message: string,
  statusCode: number,
  path: string,
  details?: any
): ErrorResponse {
  return {
    success: false,
    error: {
      message,
      code: getErrorCode(statusCode),
      ...(details && { details })
    },
    timestamp: new Date().toISOString(),
    path
  };
}

/**
 * Maps HTTP status codes to error codes
 * @param statusCode - HTTP status code
 * @returns String error code
 */
function getErrorCode(statusCode: number): string {
  const errorCodes: { [key: number]: string } = {
    400: 'BAD_REQUEST',
    401: 'UNAUTHORIZED',
    403: 'FORBIDDEN',
    404: 'NOT_FOUND',
    409: 'CONFLICT',
    422: 'VALIDATION_ERROR',
    500: 'INTERNAL_SERVER_ERROR'
  };

  return errorCodes[statusCode] || 'UNKNOWN_ERROR';
}

/**
 * Determines if error details should be exposed to client
 * @param error - The error object
 * @param isDevelopment - Whether app is in development mode
 * @returns Boolean indicating if details should be shown
 */
function shouldExposeErrorDetails(error: any, isDevelopment: boolean): boolean {
  // Always expose details for operational errors
  if (error instanceof AppError && error.isOperational) {
    return true;
  }

  // Expose details in development mode
  return isDevelopment;
}

/**
 * Main error handling middleware
 * Catches all errors and formats them into consistent responses
 */
export function errorHandler(
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Default error values
  let statusCode = 500;
  let message = 'Internal Server Error';
  let details: any = undefined;

  // Handle different error types
  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
  } else if (error.name === 'ValidationError') {
    statusCode = 422;
    message = 'Validation Error';
    details = error.details || error.message;
  } else if (error.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  } else if (error.code === 'ENOENT') {
    statusCode = 404;
    message = 'Resource not found';
  } else if (error.code === 'EACCES') {
    statusCode = 403;
    message = 'Access denied';
  } else if (isDevelopment) {
    // In development, expose the actual error message
    message = error.message || message;
    details = {
      stack: error.stack,
      name: error.name
    };
  }

  // Log the error
  Logger.error(`Error ${statusCode}: ${message}`, {
    path: req.path,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack
    }
  });

  // Create error response
  const errorResponse = createErrorResponse(
    message,
    statusCode,
    req.path,
    shouldExposeErrorDetails(error, isDevelopment) ? details : undefined
  );

  // Send error response
  res.status(statusCode).json(errorResponse);
}

/**
 * Middleware to handle 404 errors for unmatched routes
 */
export function notFoundHandler(req: Request, res: Response, next: NextFunction): void {
  const error = new AppError(`Route ${req.originalUrl} not found`, 404);
  next(error);
}

/**
 * Async error wrapper for route handlers
 * Automatically catches async errors and passes them to error middleware
 */
export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Request logging middleware
 * Logs incoming requests for debugging and monitoring
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const startTime = Date.now();
  
  // Log request
  Logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    contentType: req.get('Content-Type')
  });

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    Logger.request(req.method, req.path, res.statusCode, duration);
  });

  next();
}
