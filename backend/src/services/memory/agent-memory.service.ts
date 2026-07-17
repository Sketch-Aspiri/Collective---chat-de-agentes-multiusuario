import { redisClient } from '../../config/redis';
import { IAgentMemory } from './memory.interface';

function memoryKey(agentId: string, key: string): string {
  return `agent:${agentId}:memory:${key}`;
}

export class AgentMemoryService implements IAgentMemory {
  async get(agentId: string, key: string): Promise<string | null> {
    return redisClient.get(memoryKey(agentId, key));
  }

  async set(agentId: string, key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await redisClient.set(memoryKey(agentId, key), value, { EX: ttlSeconds });
    } else {
      await redisClient.set(memoryKey(agentId, key), value);
    }
  }

  async clear(agentId: string): Promise<void> {
    const keys = await redisClient.keys(`agent:${agentId}:memory:*`);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  }
}

export const agentMemoryService = new AgentMemoryService();
