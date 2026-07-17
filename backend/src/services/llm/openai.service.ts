import { ILLMProvider } from './llm.interface';

export class OpenAIService implements ILLMProvider {
  async sendMessage(): Promise<string> {
    throw new Error('OpenAIService.sendMessage not implemented');
  }

  async callTool(): Promise<unknown> {
    throw new Error('OpenAIService.callTool not implemented');
  }

  getTokenCount(text: string): number {
    return Math.ceil(text.length / 4);
  }
}
