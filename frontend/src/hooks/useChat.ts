import { useCallback, useEffect } from 'react';
import type { Message } from '@/types';
import { useSocket } from './useSocket';
import { useChatStore } from '@/store/chatStore';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { MOCK_USER } from '@/lib/mockData';

function createId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `msg-${Date.now()}`;
}

export interface UseChatResult {
  sendMessage: (content: string) => void;
  isConnected: boolean;
}

/**
 * Combina Socket.io con el chatStore para un chat concreto:
 * - Escucha message:new / user:joined / user:left y actualiza store/notificaciones.
 * - Se une/sale de la sala del chat.
 * - sendMessage emite al servidor si hay conexión; en modo offline (mock)
 *   añade el mensaje localmente de forma optimista.
 */
export function useChat(chatId: string): UseChatResult {
  const { socket, isConnected } = useSocket();
  const addMessage = useChatStore((state) => state.addMessage);
  const addNotification = useUIStore((state) => state.addNotification);
  const user = useAuthStore((state) => state.user) ?? MOCK_USER;

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message: Message) => {
      if (message.chatId === chatId) {
        addMessage(message);
      }
    };
    const handleUserJoined = (payload: { chatId: string; name: string }) => {
      if (payload.chatId === chatId) {
        addNotification({ type: 'info', message: `${payload.name} se unió al chat` });
      }
    };
    const handleUserLeft = (payload: { chatId: string }) => {
      if (payload.chatId === chatId) {
        addNotification({ type: 'info', message: 'Un usuario salió del chat' });
      }
    };

    socket.on('message:new', handleNewMessage);
    socket.on('user:joined', handleUserJoined);
    socket.on('user:left', handleUserLeft);
    socket.emit('chat:join', { chatId });

    return () => {
      socket.emit('chat:leave', { chatId });
      socket.off('message:new', handleNewMessage);
      socket.off('user:joined', handleUserJoined);
      socket.off('user:left', handleUserLeft);
    };
  }, [socket, chatId, addMessage, addNotification]);

  const sendMessage = useCallback(
    (content: string) => {
      const trimmed = content.trim();
      if (!trimmed) return;

      if (isConnected && socket) {
        // Con backend: emitimos y esperamos el eco. El servidor DEBE reenviar
        // message:new a toda la sala incluyendo al emisor (io.to(room).emit),
        // no socket.broadcast, o el emisor no vería su propio mensaje.
        socket.emit('send:message', { chatId, content: trimmed });
        return;
      }

      // Modo offline / mock: eco local optimista.
      const message: Message = {
        id: createId(),
        chatId,
        authorId: user.id,
        authorName: user.name,
        authorType: 'user',
        content: trimmed,
        createdAt: new Date().toISOString(),
      };
      addMessage(message);
    },
    [socket, isConnected, chatId, user.id, user.name, addMessage],
  );

  return { sendMessage, isConnected };
}
