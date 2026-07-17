import { ILLMProvider, LLMContext } from './llm.interface';

export class OpenAIService implements ILLMProvider {
  async sendMessage(prompt: string, _context?: LLMContext): Promise<string> {
    throw new Error('OpenAIService.sendMessage not implemented');
  }

  async callTool(_toolName: string, _args: unknown): Promise<unknown> {
    throw new Error('OpenAIService.callTool not implemented');
  }

  getTokenCount(text: string): number {
    return Math.ceil(text.length / 4);
  }
}
