import { createClient, RedisClientType } from 'redis';
import { env } from './env';
import { logger } from '../utils/logger';

export const redisClient: RedisClientType = createClient({ url: env.redisUrl });

redisClient.on('error', (err) => logger.error('Redis client error', { err }));

export async function connectRedis(): Promise<void> {
  await redisClient.connect();
}

export async function disconnectRedis(): Promise<void> {
  await redisClient.disconnect();
}
