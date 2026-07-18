import { create } from 'zustand';
import type { Chat, Message } from '@/types';
import { MOCK_CHATS, MOCK_MESSAGES } from '@/lib/mockData';

interface ChatState {
  chats: Chat[];
  currentChatId: string | null;
  /** Mensajes indexados por chatId para aislar el historial entre chats. */
  messagesByChat: Record<string, Message[]>;
  isLoadingMessages: boolean;

  setChats: (chats: Chat[]) => void;
  setCurrentChat: (chatId: string | null) => void;
  addChat: (chat: Chat) => void;
  addMessage: (message: Message) => void;
  setLoadingMessages: (isLoading: boolean) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  chats: MOCK_CHATS,
  currentChatId: MOCK_CHATS[0]?.id ?? null,
  messagesByChat: MOCK_MESSAGES,
  isLoadingMessages: false,

  setChats: (chats) => set({ chats }),
  setCurrentChat: (chatId) => set({ currentChatId: chatId }),
  addChat: (chat) =>
    set((state) => ({
      chats: [...state.chats, chat],
      messagesByChat: { ...state.messagesByChat, [chat.id]: state.messagesByChat[chat.id] ?? [] },
    })),
  addMessage: (message) =>
    set((state) => ({
      messagesByChat: {
        ...state.messagesByChat,
        [message.chatId]: [...(state.messagesByChat[message.chatId] ?? []), message],
      },
    })),
  setLoadingMessages: (isLoading) => set({ isLoadingMessages: isLoading }),
}));

/** Selector: mensajes del chat indicado (array estable vacío por defecto). */
const EMPTY_MESSAGES: Message[] = [];
export function selectMessages(chatId: string | null) {
  return (state: ChatState): Message[] =>
    chatId ? (state.messagesByChat[chatId] ?? EMPTY_MESSAGES) : EMPTY_MESSAGES;
}
