import type { Chat, Message, Agent } from './index';

/** Payload emitido por el cliente al enviar un mensaje. */
export interface SendMessagePayload {
  chatId: string;
  content: string;
}

/** Eventos que el servidor Socket.io envía al cliente. */
export interface ServerToClientEvents {
  'message:new': (message: Message) => void;
  'user:joined': (payload: { chatId: string; userId: string; name: string }) => void;
  'user:left': (payload: { chatId: string; userId: string }) => void;
}

/** Eventos que el cliente emite hacia el servidor. */
export interface ClientToServerEvents {
  'send:message': (payload: SendMessagePayload) => void;
  'chat:join': (payload: { chatId: string }) => void;
  'chat:leave': (payload: { chatId: string }) => void;
}

export interface ChatListResponse {
  chats: Chat[];
}

export interface AgentListResponse {
  agents: Agent[];
}
