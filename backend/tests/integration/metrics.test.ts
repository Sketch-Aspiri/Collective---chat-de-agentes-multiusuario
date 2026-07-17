import request from 'supertest';
import { createApp } from '../../src/app';

jest.mock('../../src/utils/logger', () => ({
  logger: { warn: jest.fn(), error: jest.fn(), info: jest.fn() },
}));

describe('GET /metrics', () => {
  it('exposes basic request metrics and counts the health hit', async () => {
    const app = createApp();

    await request(app).get('/health').expect(200);
    const response = await request(app).get('/metrics').expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.totalRequests).toBeGreaterThan(0);
    expect(typeof response.body.data.avgDurationMs).toBe('number');
    expect(response.body.data.byStatusClass['2xx']).toBeGreaterThan(0);
  });
});
