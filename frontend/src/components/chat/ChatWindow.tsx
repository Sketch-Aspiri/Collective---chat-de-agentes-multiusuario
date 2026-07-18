import { useChatStore, selectMessages } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';
import { MOCK_USER } from '@/lib/mockData';
import type { Message } from '@/types';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';

interface ChatWindowProps {
  chatId: string;
}

function createId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `msg-${Date.now()}`;
}

/**
 * Ventana de chat: combina la lista de mensajes y el input de envío.
 * En esta tarea el envío es local (mock); la integración Socket.io llega
 * en la Tarea 5 mediante el hook useChat.
 */
export function ChatWindow({ chatId }: ChatWindowProps) {
  const messages = useChatStore(selectMessages(chatId));
  const isLoadingMessages = useChatStore((state) => state.isLoadingMessages);
  const addMessage = useChatStore((state) => state.addMessage);
  const user = useAuthStore((state) => state.user) ?? MOCK_USER;

  const handleSend = (content: string) => {
    const message: Message = {
      id: createId(),
      chatId,
      authorId: user.id,
      authorName: user.name,
      authorType: 'user',
      content,
      createdAt: new Date().toISOString(),
    };
    addMessage(message);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto">
        <MessageList messages={messages} isLoading={isLoadingMessages} />
      </div>
      <MessageInput onSend={handleSend} />
    </div>
  );
}
