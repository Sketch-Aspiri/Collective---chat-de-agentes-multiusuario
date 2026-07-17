import { prisma } from '../../config/database';
import { redisClient } from '../../config/redis';
import { logger } from '../../utils/logger';

export type DependencyStatus = 'ok' | 'error';
export type OverallStatus = 'ok' | 'degraded';

export interface ReadinessReport {
  status: OverallStatus;
  timestamp: string;
  uptime: number;
  database: DependencyStatus;
  redis: DependencyStatus;
}

async function checkDatabase(): Promise<DependencyStatus> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return 'ok';
  } catch (error: unknown) {
    logger.error('Health check: database unreachable', { error });
    return 'error';
  }
}

async function checkRedis(): Promise<DependencyStatus> {
  try {
    await redisClient.ping();
    return 'ok';
  } catch (error: unknown) {
    logger.error('Health check: redis unreachable', { error });
    return 'error';
  }
}

/**
 * Comprueba las dependencias críticas (BD y Redis) en paralelo y agrega un
 * estado global. `degraded` si cualquiera falla.
 */
export async function getReadiness(): Promise<ReadinessReport> {
  const [database, redis] = await Promise.all([checkDatabase(), checkRedis()]);
  const status: OverallStatus = database === 'ok' && redis === 'ok' ? 'ok' : 'degraded';

  return {
    status,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database,
    redis,
  };
}
