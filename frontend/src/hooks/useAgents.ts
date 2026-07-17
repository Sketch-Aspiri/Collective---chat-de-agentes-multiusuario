import { useCallback } from 'react';
import { api } from '../services/api';
import { useAgentStore } from '../store/agentStore';
import { ApiResponse, Agent } from '../types';

export function useAgents(chatId: string) {
  const agents = useAgentStore((state) => state.agentsByChat[chatId] ?? []);
  const setAgentsForChat = useAgentStore((state) => state.setAgentsForChat);

  const fetchAgents = useCallback(async () => {
    const { data } = await api.get<ApiResponse<Agent[]>>(`/agents/chat/${chatId}`);
    setAgentsForChat(chatId, data.data ?? []);
  }, [chatId, setAgentsForChat]);

  return { agents, fetchAgents };
}
