import { NextFunction, Request, Response } from 'express';
import { AuthenticatedRequest } from '../../src/middleware/auth';
import {
  RATE_LIMIT_MAX_REQUESTS,
  AUTH_RATE_LIMIT_MAX_REQUESTS,
  enforceRateLimit,
  enforcePublicAuthRateLimit,
} from '../../src/middleware/rateLimiter';
import { ServiceUnavailableError, TooManyRequestsError } from '../../src/utils/errors';
import { redisClient } from '../../src/config/redis';

jest.mock('../../src/config/redis', () => ({
  redisClient: { isReady: true, eval: jest.fn() },
}));

jest.mock('../../src/utils/logger', () => ({
  logger: { warn: jest.fn(), error: jest.fn(), info: jest.fn() },
}));

describe('rateLimiter', () => {
  const request = { userId: 'user-1', path: '/protected' } as AuthenticatedRequest;
  let response: Response;
  let next: jest.MockedFunction<NextFunction>;
  let setHeader: jest.Mock;
  const evalMock = redisClient.eval as jest.Mock;

  beforeEach(() => {
    setHeader = jest.fn();
    response = { setHeader } as unknown as Response;
    next = jest.fn();
    Object.defineProperty(redisClient, 'isReady', { value: true, configurable: true });
    evalMock.mockReset();
  });

  it('allows requests within the quota and emits rate limit headers', async () => {
    evalMock.mockResolvedValue([1, 60_000]);

    await enforceRateLimit(request, response, next);

    expect(evalMock).toHaveBeenCalledWith(expect.any(String), {
      keys: ['rate-limit:user:user-1'],
      arguments: ['60000'],
    });
    expect(setHeader).toHaveBeenCalledWith('RateLimit-Limit', RATE_LIMIT_MAX_REQUESTS);
    expect(setHeader).toHaveBeenCalledWith('RateLimit-Remaining', 99);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('rejects requests over 100 per minute', async () => {
    evalMock.mockResolvedValue([RATE_LIMIT_MAX_REQUESTS + 1, 30_000]);

    await expect(enforceRateLimit(request, response, next)).rejects.toBeInstanceOf(
      TooManyRequestsError,
    );
    expect(setHeader).toHaveBeenCalledWith('Retry-After', 30);
    expect(next).not.toHaveBeenCalled();
  });

  it('returns service unavailable when Redis is not ready', async () => {
    Object.defineProperty(redisClient, 'isReady', { value: false, configurable: true });

    await expect(enforceRateLimit(request, response, next)).rejects.toBeInstanceOf(
      ServiceUnavailableError,
    );
    expect(evalMock).not.toHaveBeenCalled();
  });

  it('limits public authentication attempts by IP address', async () => {
    evalMock.mockResolvedValue([AUTH_RATE_LIMIT_MAX_REQUESTS + 1, 20_000]);
    const publicRequest = {
      ip: '203.0.113.10',
      path: '/login',
      socket: {},
    } as Request;

    await expect(
      enforcePublicAuthRateLimit(publicRequest, response, next),
    ).rejects.toBeInstanceOf(TooManyRequestsError);

    expect(evalMock).toHaveBeenCalledWith(expect.any(String), {
      keys: ['rate-limit:auth:203.0.113.10'],
      arguments: ['60000'],
    });
    expect(setHeader).toHaveBeenCalledWith('RateLimit-Limit', 10);
    expect(next).not.toHaveBeenCalled();
  });
});
