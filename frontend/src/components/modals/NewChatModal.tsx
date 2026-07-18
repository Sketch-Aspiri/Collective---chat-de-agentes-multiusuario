import { useState } from 'react';
import type { Chat } from '@/types';
import { Dialog } from '@/components/common/Dialog';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { useChatStore } from '@/store/chatStore';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { MOCK_USER } from '@/lib/mockData';

function createId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `chat-${Date.now()}`;
}

/**
 * Modal para crear un nuevo chat. Añade el chat al store y lo selecciona.
 */
export function NewChatModal() {
  const open = useUIStore((state) => state.modals.newChat);
  const closeModal = useUIStore((state) => state.closeModal);
  const addChat = useChatStore((state) => state.addChat);
  const setCurrentChat = useChatStore((state) => state.setCurrentChat);
  const user = useAuthStore((state) => state.user) ?? MOCK_USER;

  const [title, setTitle] = useState('');

  const handleClose = () => {
    setTitle('');
    closeModal('newChat');
  };

  const handleCreate = () => {
    const name = title.trim();
    if (!name) return;
    const chat: Chat = {
      id: createId(),
      name,
      ownerId: user.id,
      createdAt: new Date().toISOString(),
    };
    addChat(chat);
    setCurrentChat(chat.id);
    handleClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      title="Nuevo chat"
      description="Dale un nombre a tu conversación."
      footer={
        <>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button onClick={handleCreate} disabled={!title.trim()}>
            Crear
          </Button>
        </>
      }
    >
      <label htmlFor="new-chat-title" className="mb-1 block text-sm font-medium">
        Título
      </label>
      <Input
        id="new-chat-title"
        autoFocus
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') handleCreate();
        }}
        placeholder="p. ej. Equipo de diseño"
      />
    </Dialog>
  );
}
