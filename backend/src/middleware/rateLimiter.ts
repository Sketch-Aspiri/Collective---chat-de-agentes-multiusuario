import { NextFunction, Request, Response } from 'express';
import { redisClient } from '../config/redis';
import { AuthenticatedRequest } from './auth';
import { ServiceUnavailableError, TooManyRequestsError, UnauthorizedError } from '../utils/errors';
import { logger } from '../utils/logger';

export const RATE_LIMIT_WINDOW_MS = 60_000;
export const RATE_LIMIT_MAX_REQUESTS = 100;
export const AUTH_RATE_LIMIT_MAX_REQUESTS = 10;

const INCREMENT_SCRIPT = `
local count = redis.call('INCR', KEYS[1])
if count == 1 then
  redis.call('PEXPIRE', KEYS[1], ARGV[1])
end
local ttl = redis.call('PTTL', KEYS[1])
return {count, ttl}
`;

export function rateLimiter(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void {
  void enforceRateLimit(req, res, next).catch(next);
}

export async function enforceRateLimit(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  if (!req.userId) {
    throw new UnauthorizedError();
  }

  await enforceRedisLimit(
    `rate-limit:user:${req.userId}`,
    RATE_LIMIT_MAX_REQUESTS,
    req.path,
    res,
    next,
  );
}

export function publicAuthRateLimiter(req: Request, res: Response, next: NextFunction): void {
  void enforcePublicAuthRateLimit(req, res, next).catch(next);
}

export async function enforcePublicAuthRateLimit(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
  await enforceRedisLimit(
    `rate-limit:auth:${clientIp}`,
    AUTH_RATE_LIMIT_MAX_REQUESTS,
    req.path,
    res,
    next,
  );
}

async function enforceRedisLimit(
  key: string,
  maxRequests: number,
  path: string,
  res: Response,
  next: NextFunction,
): Promise<void> {
  if (!redisClient.isReady) {
    logger.error('Rate limiter unavailable', { reason: 'redis_not_ready', path });
    throw new ServiceUnavailableError('Rate limiter unavailable');
  }

  try {
    const result = await redisClient.eval(INCREMENT_SCRIPT, {
      keys: [key],
      arguments: [String(RATE_LIMIT_WINDOW_MS)],
    });
    const [count, ttl] = result as [number, number];
    const remaining = Math.max(0, maxRequests - count);
    const resetSeconds = Math.max(1, Math.ceil(ttl / 1000));

    res.setHeader('RateLimit-Limit', maxRequests);
    res.setHeader('RateLimit-Remaining', remaining);
    res.setHeader('RateLimit-Reset', resetSeconds);

    if (count > maxRequests) {
      res.setHeader('Retry-After', resetSeconds);
      logger.warn('Rate limit exceeded', { key, path });
      throw new TooManyRequestsError(resetSeconds);
    }

    next();
  } catch (error: unknown) {
    if (error instanceof TooManyRequestsError) {
      throw error;
    }
    logger.error('Rate limiter Redis error', { error });
    throw new ServiceUnavailableError('Rate limiter unavailable');
  }
}
