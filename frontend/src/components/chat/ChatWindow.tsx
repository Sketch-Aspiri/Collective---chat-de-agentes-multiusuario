import { useChatStore, selectMessages } from '@/store/chatStore';
import { useChat } from '@/hooks/useChat';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';

interface ChatWindowProps {
  chatId: string;
}

/**
 * Ventana de chat: combina la lista de mensajes y el input de envío.
 * Delega el envío y los listeners en tiempo real al hook useChat
 * (Socket.io con fallback local en modo mock).
 */
export function ChatWindow({ chatId }: ChatWindowProps) {
  const messages = useChatStore(selectMessages(chatId));
  const isLoadingMessages = useChatStore((state) => state.isLoadingMessages);
  const { sendMessage } = useChat(chatId);

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto">
        <MessageList messages={messages} isLoading={isLoadingMessages} />
      </div>
      <MessageInput onSend={sendMessage} />
    </div>
  );
}
