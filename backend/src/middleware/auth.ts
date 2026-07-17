import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { UnauthorizedError } from '../utils/errors';
import { logger } from '../utils/logger';

export interface AuthenticatedRequest extends Request {
  userId?: string;
  user?: JwtPayload;
}

export interface JwtPayload {
  userId: string;
  email?: string;
}

export function authMiddleware(req: AuthenticatedRequest, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  const match = header?.match(/^Bearer\s+(\S+)$/i);

  if (!match) {
    logger.warn('Authentication rejected', { reason: 'missing_bearer_token', path: req.path });
    throw new UnauthorizedError('Missing bearer token');
  }

  try {
    const decoded = jwt.verify(match[1], env.jwtSecret, { algorithms: ['HS256'] });
    if (typeof decoded === 'string' || typeof decoded.userId !== 'string' || !decoded.userId) {
      throw new UnauthorizedError('Invalid token payload');
    }

    const payload: JwtPayload = {
      userId: decoded.userId,
      ...(typeof decoded.email === 'string' ? { email: decoded.email } : {}),
    };

    req.user = payload;
    req.userId = payload.userId;
    next();
  } catch (error: unknown) {
    logger.warn('Authentication rejected', {
      reason: error instanceof jwt.TokenExpiredError ? 'token_expired' : 'invalid_token',
      path: req.path,
    });
    throw new UnauthorizedError('Invalid or expired token');
  }
}
