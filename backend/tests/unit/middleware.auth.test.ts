import jwt from 'jsonwebtoken';
import { NextFunction, Response } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../../src/middleware/auth';
import { env } from '../../src/config/env';
import { UnauthorizedError } from '../../src/utils/errors';

jest.mock('../../src/utils/logger', () => ({
  logger: { warn: jest.fn(), error: jest.fn(), info: jest.fn() },
}));

describe('authMiddleware', () => {
  const response = {} as Response;
  let next: jest.MockedFunction<NextFunction>;

  beforeEach(() => {
    next = jest.fn();
  });

  it('verifies an HS256 token and attaches its user context', () => {
    const token = jwt.sign({ userId: 'user-1', email: 'user@example.test' }, env.jwtSecret, {
      algorithm: 'HS256',
      expiresIn: '5m',
    });
    const request = {
      headers: { authorization: `Bearer ${token}` },
      path: '/protected',
    } as AuthenticatedRequest;

    authMiddleware(request, response, next);

    expect(request.user).toEqual({ userId: 'user-1', email: 'user@example.test' });
    expect(request.userId).toBe('user-1');
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('rejects a token signed with an unapproved algorithm', () => {
    const token = jwt.sign({ userId: 'user-1' }, env.jwtSecret, { algorithm: 'HS384' });
    const request = {
      headers: { authorization: `Bearer ${token}` },
      path: '/protected',
    } as AuthenticatedRequest;

    expect(() => authMiddleware(request, response, next)).toThrow(UnauthorizedError);
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects tokens without a userId', () => {
    const token = jwt.sign({ email: 'user@example.test' }, env.jwtSecret, { algorithm: 'HS256' });
    const request = {
      headers: { authorization: `Bearer ${token}` },
      path: '/protected',
    } as AuthenticatedRequest;

    expect(() => authMiddleware(request, response, next)).toThrow(UnauthorizedError);
  });

  it('rejects requests without a bearer token', () => {
    const request = { headers: {}, path: '/protected' } as AuthenticatedRequest;

    expect(() => authMiddleware(request, response, next)).toThrow('Missing bearer token');
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects expired tokens', () => {
    const token = jwt.sign({ userId: 'user-1' }, env.jwtSecret, {
      algorithm: 'HS256',
      expiresIn: -1,
    });
    const request = {
      headers: { authorization: `Bearer ${token}` },
      path: '/protected',
    } as AuthenticatedRequest;

    expect(() => authMiddleware(request, response, next)).toThrow('Invalid or expired token');
  });
});
