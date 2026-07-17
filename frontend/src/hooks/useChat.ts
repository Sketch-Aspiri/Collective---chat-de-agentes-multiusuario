import { useCallback } from 'react';
import { api } from '../services/api';
import { useChatStore } from '../store/chatStore';
import { ApiResponse, Chat } from '../types';

export function useChat() {
  const { chats, setChats } = useChatStore();

  const fetchChats = useCallback(async () => {
    const { data } = await api.get<ApiResponse<Chat[]>>('/chats');
    setChats(data.data ?? []);
  }, [setChats]);

  return { chats, fetchChats };
}
