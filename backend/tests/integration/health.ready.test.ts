import request from 'supertest';
import { createApp } from '../../src/app';

jest.mock('../../src/utils/logger', () => ({
  logger: { warn: jest.fn(), error: jest.fn(), info: jest.fn() },
}));

jest.mock('../../src/config/database', () => ({
  prisma: { $queryRaw: jest.fn() },
}));

jest.mock('../../src/config/redis', () => ({
  redisClient: { ping: jest.fn(), on: jest.fn() },
}));

import { prisma } from '../../src/config/database';
import { redisClient } from '../../src/config/redis';

describe('GET /health/ready', () => {
  it('returns 200 and ok when database and redis are reachable', async () => {
    (prisma.$queryRaw as jest.Mock).mockResolvedValue([{ '?column?': 1 }]);
    (redisClient.ping as jest.Mock).mockResolvedValue('PONG');

    const response = await request(createApp()).get('/health/ready').expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe('ok');
    expect(response.body.data.database).toBe('ok');
    expect(response.body.data.redis).toBe('ok');
  });

  it('returns 503 and degraded when redis is unreachable', async () => {
    (prisma.$queryRaw as jest.Mock).mockResolvedValue([{ '?column?': 1 }]);
    (redisClient.ping as jest.Mock).mockRejectedValue(new Error('connection refused'));

    const response = await request(createApp()).get('/health/ready').expect(503);

    expect(response.body.success).toBe(false);
    expect(response.body.data.status).toBe('degraded');
    expect(response.body.data.redis).toBe('error');
  });
});
