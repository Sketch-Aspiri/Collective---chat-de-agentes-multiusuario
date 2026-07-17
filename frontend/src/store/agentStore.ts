import { create } from 'zustand';
import { Agent } from '../types';

interface AgentState {
  agentsByChat: Record<string, Agent[]>;
  setAgentsForChat: (chatId: string, agents: Agent[]) => void;
}

export const useAgentStore = create<AgentState>((set) => ({
  agentsByChat: {},
  setAgentsForChat: (chatId, agents) =>
    set((state) => ({ agentsByChat: { ...state.agentsByChat, [chatId]: agents } })),
}));
