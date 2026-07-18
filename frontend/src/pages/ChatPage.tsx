import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useChatStore } from '@/store/chatStore';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { Button } from '@/components/common/Button';

/**
 * Página de un chat concreto. Carga el chat por el id de la URL y sincroniza
 * el chat activo en el store. Si el id no existe, muestra un error.
 */
export function ChatPage() {
  const { chatId } = useParams<{ chatId: string }>();
  const navigate = useNavigate();
  const chats = useChatStore((state) => state.chats);
  const setCurrentChat = useChatStore((state) => state.setCurrentChat);

  const exists = Boolean(chatId) && chats.some((chat) => chat.id === chatId);

  useEffect(() => {
    if (chatId && exists) {
      setCurrentChat(chatId);
    }
  }, [chatId, exists, setCurrentChat]);

  if (!chatId || !exists) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 px-4 text-center">
        <h2 className="text-xl font-semibold">Chat no encontrado</h2>
        <p className="max-w-sm text-sm text-muted-foreground">
          El chat que buscas no existe o fue eliminado.
        </p>
        <Button onClick={() => navigate('/')}>Volver al inicio</Button>
      </div>
    );
  }

  return <ChatWindow chatId={chatId} />;
}
