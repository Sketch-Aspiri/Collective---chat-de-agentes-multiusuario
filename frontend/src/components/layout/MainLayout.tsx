import { useState, type ReactNode } from 'react';
import type { Chat } from '@/types';
import { cn } from '@/lib/utils';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

/**
 * Datos de ejemplo temporales. En la Tarea 3 se reemplazan por los
 * stores de Zustand (chatStore) y en la Tarea 6 por el router.
 */
const MOCK_CHATS: Chat[] = [
  {
    id: 'chat-1',
    name: 'Equipo de producto',
    ownerId: 'user-1',
    createdAt: new Date().toISOString(),
    lastMessagePreview: '@planner arranquemos el sprint',
  },
  {
    id: 'chat-2',
    name: 'Soporte técnico',
    ownerId: 'user-1',
    createdAt: new Date().toISOString(),
    lastMessagePreview: 'Ticket #1043 resuelto',
  },
];

interface MainLayoutProps {
  children?: ReactNode;
}

/**
 * Layout principal responsivo: sidebar fija en desktop y drawer en mobile,
 * cabecera superior y área de contenido scrollable.
 */
export function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(MOCK_CHATS[0]?.id ?? null);

  const currentChat = MOCK_CHATS.find((chat) => chat.id === currentChatId) ?? null;

  const handleSelectChat = (chatId: string) => {
    setCurrentChatId(chatId);
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      {/* Overlay para cerrar el drawer en mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar: drawer en mobile, columna fija en desktop */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-30 w-64 transform transition-transform duration-200 md:static md:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <Sidebar
          chats={MOCK_CHATS}
          currentChatId={currentChatId}
          onSelectChat={handleSelectChat}
          onNewChat={() => undefined}
        />
      </div>

      {/* Columna principal */}
      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          title={currentChat?.name ?? 'agentes-chat'}
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          onInviteAgent={() => undefined}
        />
        <main className="flex-1 overflow-y-auto">
          {children ?? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Selecciona un chat para empezar
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
