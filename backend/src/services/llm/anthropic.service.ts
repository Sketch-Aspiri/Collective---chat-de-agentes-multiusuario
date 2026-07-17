import { ILLMProvider } from './llm.interface';

export class AnthropicService implements ILLMProvider {
  async sendMessage(): Promise<string> {
    throw new Error('AnthropicService.sendMessage not implemented');
  }

  async callTool(): Promise<unknown> {
    throw new Error('AnthropicService.callTool not implemented');
  }

  getTokenCount(text: string): number {
    return Math.ceil(text.length / 4);
  }
}
