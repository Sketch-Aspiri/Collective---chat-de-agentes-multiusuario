import { LLMProvider } from '../../types/Agent';
import { OpenAIService } from './openai.service';
import { AnthropicService } from './anthropic.service';
import { GoogleService } from './google.service';

export interface LLMContext {
  systemPrompt?: string;
}

export interface ILLMProvider {
  sendMessage(prompt: string, context?: LLMContext): Promise<string>;
  callTool(toolName: string, args: unknown): Promise<unknown>;
  getTokenCount(text: string): number;
}

const providers: Record<LLMProvider, ILLMProvider> = {
  openai: new OpenAIService(),
  anthropic: new AnthropicService(),
  google: new GoogleService(),
};

export function getLLMProvider(provider: LLMProvider): ILLMProvider {
  return providers[provider];
}
