import { ILLMProvider, LLMContext } from './llm.interface';

export class AnthropicService implements ILLMProvider {
  async sendMessage(prompt: string, _context?: LLMContext): Promise<string> {
    throw new Error('AnthropicService.sendMessage not implemented');
  }

  async callTool(_toolName: string, _args: unknown): Promise<unknown> {
    throw new Error('AnthropicService.callTool not implemented');
  }

  getTokenCount(text: string): number {
    return Math.ceil(text.length / 4);
  }
}
