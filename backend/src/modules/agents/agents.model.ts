import { LLMProvider } from '../../types/Agent';

export interface CreateAgentInput {
  chatId: string;
  name: string;
  mentionHandle: string;
  provider: LLMProvider;
  systemPrompt: string;
}
