export type LLMProvider = 'openai' | 'anthropic' | 'google';

export interface Agent {
  id: string;
  chatId: string;
  creatorId: string;
  name: string;
  mentionHandle: string;
  provider: LLMProvider;
  systemPrompt: string;
  createdAt: Date;
  updatedAt: Date;
}
