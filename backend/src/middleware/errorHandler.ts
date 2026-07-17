import { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    logger.warn(err.message, { statusCode: err.statusCode, path: req.path });
    res.status(err.statusCode).json({
      success: false,
      data: null,
      error: err.message,
      details: err.details,
    });
    return;
  }

  logger.error('Unhandled error', { err, path: req.path });
  res.status(500).json({
    success: false,
    data: null,
    error: 'Internal server error',
  });
}
