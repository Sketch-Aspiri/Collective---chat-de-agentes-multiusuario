import request from 'supertest';
import { createApp } from '../../src/app';

jest.mock('../../src/utils/logger', () => ({
  logger: { warn: jest.fn(), error: jest.fn(), info: jest.fn() },
}));

describe('GET /health', () => {
  it('returns a successful health response with security headers', async () => {
    const response = await request(createApp()).get('/health').expect(200);

    expect(response.body).toEqual({ success: true, data: { status: 'ok' } });
    expect(response.headers['x-powered-by']).toBeUndefined();
    expect(response.headers['x-content-type-options']).toBe('nosniff');
  });
});
