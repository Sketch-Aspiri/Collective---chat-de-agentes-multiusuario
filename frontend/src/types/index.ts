export type LLMProvider = 'openai' | 'anthropic' | 'google';

export type AuthorType = 'user' | 'agent' | 'system';

export type NotificationType = 'info' | 'success' | 'error';

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
}

export interface Chat {
  id: string;
  name: string;
  ownerId: string;
  createdAt: string;
  lastMessagePreview?: string;
}

export interface Agent {
  id: string;
  name: string;
  /** Handle usado en @menciones, sin el prefijo `@`. */
  mentionHandle: string;
  provider: LLMProvider;
  description?: string;
  /** Color HSL/hex para el avatar generado. */
  avatarColor?: string;
}

export interface Message {
  id: string;
  chatId: string;
  authorId: string;
  authorName: string;
  authorType: AuthorType;
  content: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
  meta?: {
    total: number;
    page: number;
    limit: number;
  };
}
