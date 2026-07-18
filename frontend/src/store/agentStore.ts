import { create } from 'zustand';
import type { Agent } from '@/types';
import { MOCK_AGENTS } from '@/lib/mockData';

interface AgentState {
  /** Agentes disponibles para invitar. */
  availableAgents: Agent[];
  /** Agentes ya presentes en el chat actual. */
  chatAgents: Agent[];

  setAvailableAgents: (agents: Agent[]) => void;
  setChatAgents: (agents: Agent[]) => void;
  addAgentToChat: (agent: Agent) => void;
  removeAgentFromChat: (agentId: string) => void;
}

export const useAgentStore = create<AgentState>((set) => ({
  availableAgents: MOCK_AGENTS,
  chatAgents: [MOCK_AGENTS[0]],

  setAvailableAgents: (agents) => set({ availableAgents: agents }),
  setChatAgents: (agents) => set({ chatAgents: agents }),
  addAgentToChat: (agent) =>
    set((state) => {
      // Evita duplicados: no re-añade un agente ya presente en el chat.
      if (state.chatAgents.some((existing) => existing.id === agent.id)) {
        return state;
      }
      return { chatAgents: [...state.chatAgents, agent] };
    }),
  removeAgentFromChat: (agentId) =>
    set((state) => ({
      chatAgents: state.chatAgents.filter((agent) => agent.id !== agentId),
    })),
}));
