import type { Agent, Chat, Message, User } from '@/types';

/**
 * Datos de ejemplo para desarrollo manual sin backend real.
 * Solo se usan mientras el sprint mantiene el modo "mock data".
 */

export const MOCK_USER: User = {
  id: 'user-1',
  email: 'demo@agentes-chat.dev',
  name: 'Tú',
};

/** Token ficticio; la autenticación real llega en una fase posterior. */
export const MOCK_TOKEN = 'mock-jwt-token';

export const MOCK_CHATS: Chat[] = [
  {
    id: 'chat-1',
    name: 'Equipo de producto',
    ownerId: MOCK_USER.id,
    createdAt: new Date('2026-07-17T09:00:00Z').toISOString(),
    lastMessagePreview: '@planner arranquemos el sprint',
  },
  {
    id: 'chat-2',
    name: 'Soporte técnico',
    ownerId: MOCK_USER.id,
    createdAt: new Date('2026-07-16T14:30:00Z').toISOString(),
    lastMessagePreview: 'Ticket #1043 resuelto',
  },
];

export const MOCK_AGENTS: Agent[] = [
  {
    id: 'agent-planner',
    name: 'Planner',
    mentionHandle: 'planner',
    provider: 'anthropic',
    description: 'Descompone objetivos en tareas accionables.',
    avatarColor: '#6366f1',
  },
  {
    id: 'agent-researcher',
    name: 'Researcher',
    mentionHandle: 'researcher',
    provider: 'openai',
    description: 'Busca y sintetiza información externa.',
    avatarColor: '#10b981',
  },
  {
    id: 'agent-reviewer',
    name: 'Reviewer',
    mentionHandle: 'reviewer',
    provider: 'google',
    description: 'Revisa código y sugiere mejoras.',
    avatarColor: '#f59e0b',
  },
];

export const MOCK_MESSAGES: Record<string, Message[]> = {
  'chat-1': [
    {
      id: 'msg-1',
      chatId: 'chat-1',
      authorId: MOCK_USER.id,
      authorName: MOCK_USER.name,
      authorType: 'user',
      content: '¡Hola equipo! **Arranquemos** el sprint. @planner ¿por dónde empezamos?',
      createdAt: new Date('2026-07-17T09:00:00Z').toISOString(),
    },
    {
      id: 'msg-2',
      chatId: 'chat-1',
      authorId: 'agent-planner',
      authorName: 'Planner',
      authorType: 'agent',
      content:
        'Propongo estos pasos:\n\n1. Definir el layout base\n2. Configurar los stores\n3. Integrar Socket.io',
      createdAt: new Date('2026-07-17T09:01:00Z').toISOString(),
    },
  ],
  'chat-2': [
    {
      id: 'msg-3',
      chatId: 'chat-2',
      authorId: MOCK_USER.id,
      authorName: MOCK_USER.name,
      authorType: 'user',
      content: 'El ticket #1043 sigue abierto.',
      createdAt: new Date('2026-07-16T14:30:00Z').toISOString(),
    },
  ],
};
