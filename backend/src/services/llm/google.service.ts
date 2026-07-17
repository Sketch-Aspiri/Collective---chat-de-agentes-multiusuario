import { ILLMProvider, LLMContext } from './llm.interface';

export class GoogleService implements ILLMProvider {
  async sendMessage(prompt: string, _context?: LLMContext): Promise<string> {
    throw new Error('GoogleService.sendMessage not implemented');
  }

  async callTool(_toolName: string, _args: unknown): Promise<unknown> {
    throw new Error('GoogleService.callTool not implemented');
  }

  getTokenCount(text: string): number {
    return Math.ceil(text.length / 4);
  }
}
