export interface IAgentMemory {
  get(agentId: string, key: string): Promise<string | null>;
  set(agentId: string, key: string, value: string, ttlSeconds?: number): Promise<void>;
  clear(agentId: string): Promise<void>;
}
