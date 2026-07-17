import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ChatWindow } from '../components/Chat/ChatWindow';
import { useChat } from '../hooks/useChat';
import { useChatStore } from '../store/chatStore';
import { useWebSocket } from '../hooks/useWebSocket';

export function ChatPage() {
  const { chatId } = useParams<{ chatId: string }>();
  const { chats, fetchChats } = useChat();
  const messages = useChatStore((state) => (chatId ? state.messagesByChat[chatId] ?? [] : []));
  const addMessage = useChatStore((state) => state.addMessage);
  useWebSocket();

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  const chat = chats.find((c) => c.id === chatId);
  if (!chat || !chatId) return null;

  return (
    <ChatWindow
      chat={chat}
      messages={messages}
      onSend={(content) =>
        addMessage(chatId, {
          id: crypto.randomUUID(),
          chatId,
          authorId: 'me',
          authorType: 'user',
          content,
          createdAt: new Date().toISOString(),
        })
      }
    />
  );
}
