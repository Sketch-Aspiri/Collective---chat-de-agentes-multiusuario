import { ILLMProvider } from './llm.interface';

export class GoogleService implements ILLMProvider {
  async sendMessage(): Promise<string> {
    throw new Error('GoogleService.sendMessage not implemented');
  }

  async callTool(): Promise<unknown> {
    throw new Error('GoogleService.callTool not implemented');
  }

  getTokenCount(text: string): number {
    return Math.ceil(text.length / 4);
  }
}
