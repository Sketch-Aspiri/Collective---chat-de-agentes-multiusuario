import { describe, it, expect, beforeEach } from 'vitest';
import { useUIStore } from '@/store/uiStore';
import { useChatStore } from '@/store/chatStore';
import { useAgentStore } from '@/store/agentStore';
import { useAuthStore } from '@/store/authStore';
import type { Agent, Chat, Message } from '@/types';

describe('uiStore', () => {
  beforeEach(() => {
    useUIStore.setState({
      sidebarOpen: false,
      modals: { newChat: false, inviteAgent: false },
      notifications: [],
    });
  });

  it('abre y cierra modales por nombre', () => {
    useUIStore.getState().openModal('newChat');
    expect(useUIStore.getState().modals.newChat).toBe(true);
    useUIStore.getState().closeModal('newChat');
    expect(useUIStore.getState().modals.newChat).toBe(false);
  });

  it('añade notificaciones con id y timestamp generados', () => {
    useUIStore.getState().addNotification({ type: 'success', message: 'hecho' });
    const [notif] = useUIStore.getState().notifications;
    expect(notif.message).toBe('hecho');
    expect(notif.id).toBeTruthy();
    expect(notif.createdAt).toBeTruthy();
  });
});

describe('chatStore', () => {
  it('addMessage aísla los mensajes por chatId', () => {
    useChatStore.setState({ messagesByChat: {} });
    const message: Message = {
      id: 'm1',
      chatId: 'c1',
      authorId: 'u1',
      authorName: 'Tú',
      authorType: 'user',
      content: 'hola',
      createdAt: new Date().toISOString(),
    };
    useChatStore.getState().addMessage(message);
    expect(useChatStore.getState().messagesByChat['c1']).toHaveLength(1);
    expect(useChatStore.getState().messagesByChat['c2']).toBeUndefined();
  });

  it('addChat agrega el chat a la lista', () => {
    const before = useChatStore.getState().chats.length;
    const chat: Chat = {
      id: 'c-new',
      name: 'Nuevo',
      ownerId: 'u1',
      createdAt: new Date().toISOString(),
    };
    useChatStore.getState().addChat(chat);
    expect(useChatStore.getState().chats).toHaveLength(before + 1);
  });
});

describe('agentStore', () => {
  const agent: Agent = {
    id: 'a-x',
    name: 'X',
    mentionHandle: 'x',
    provider: 'openai',
  };

  beforeEach(() => {
    useAgentStore.setState({ chatAgents: [] });
  });

  it('addAgentToChat evita duplicados', () => {
    useAgentStore.getState().addAgentToChat(agent);
    useAgentStore.getState().addAgentToChat(agent);
    expect(useAgentStore.getState().chatAgents).toHaveLength(1);
  });
});

describe('authStore', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, token: null, error: null });
  });

  it('setToken y logout gestionan la sesión', () => {
    useAuthStore.getState().setToken('t-123');
    expect(useAuthStore.getState().token).toBe('t-123');
    useAuthStore.getState().logout();
    expect(useAuthStore.getState().token).toBeNull();
  });
});
