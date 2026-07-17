import { Queue, Worker, Job } from 'bullmq';
import { env } from '../../config/env';

const redisUrl = new URL(env.redisUrl);
const connection = {
  host: redisUrl.hostname,
  port: Number(redisUrl.port || 6379),
  password: redisUrl.password || undefined,
};

export const agentExecutionQueue = new Queue('agent-execution', { connection });

export function createAgentExecutionWorker(
  processor: (job: Job) => Promise<unknown>,
): Worker {
  return new Worker('agent-execution', processor, { connection });
}
