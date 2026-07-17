import http from 'http';
import { createApp } from './app';
import { env } from './config/environment';
import { connectDatabase, disconnectDatabase } from './config/database';
import { connectRedis, disconnectRedis } from './config/redis';
import { logger } from './utils/logger';
import { createSocketServer } from './websocket/socket-server';

async function main(): Promise<void> {
  await connectDatabase();
  await connectRedis();

  const httpServer = http.createServer(createApp());
  const socketServer = createSocketServer(httpServer);
  httpServer.listen(env.port, () => logger.info('Backend started', { port: env.port }));

  const shutdown = async (signal: string): Promise<void> => {
    logger.info('Backend stopping', { signal });
    await new Promise<void>((resolve) => socketServer.close(() => resolve()));
    await Promise.all([disconnectRedis(), disconnectDatabase()]);
  };

  process.once('SIGINT', () => void shutdown('SIGINT'));
  process.once('SIGTERM', () => void shutdown('SIGTERM'));
}

void main().catch((error: unknown) => {
  logger.error('Fatal startup error', { error });
  process.exitCode = 1;
});
