export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Chat {
  id: string;
  name: string;
  ownerId: string;
}

export type LLMProvider = 'openai' | 'anthropic' | 'google';

export interface Agent {
  id: string;
  chatId: string;
  name: string;
  mentionHandle: string;
  provider: LLMProvider;
}

export interface Message {
  id: string;
  chatId: string;
  authorId: string;
  authorType: 'user' | 'agent';
  content: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
}
