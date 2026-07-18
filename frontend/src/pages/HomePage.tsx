import { Navigate } from 'react-router-dom';
import { useChatStore } from '@/store/chatStore';
import { useUIStore } from '@/store/uiStore';
import { Button } from '@/components/common/Button';
import { PlusIcon } from '@/components/common/icons';

/**
 * Página de inicio. Si hay chats, redirige al primero; si no, muestra un
 * estado vacío con CTA para crear el primer chat.
 */
export function HomePage() {
  const chats = useChatStore((state) => state.chats);
  const openModal = useUIStore((state) => state.openModal);

  if (chats.length > 0) {
    return <Navigate to={`/chat/${chats[0].id}`} replace />;
  }

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 px-4 text-center">
      <h2 className="text-xl font-semibold">Todavía no tienes chats</h2>
      <p className="max-w-sm text-sm text-muted-foreground">
        Crea tu primer chat para empezar a conversar con agentes de IA.
      </p>
      <Button onClick={() => openModal('newChat')}>
        <PlusIcon width={16} height={16} />
        Crear chat
      </Button>
    </div>
  );
}
