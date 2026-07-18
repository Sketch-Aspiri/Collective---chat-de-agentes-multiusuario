import { Outlet, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useChatStore } from '@/store/chatStore';
import { useUIStore } from '@/store/uiStore';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { NewChatModal } from '@/components/modals/NewChatModal';
import { InviteAgentModal } from '@/components/modals/InviteAgentModal';
import { ConnectionBadge } from '@/components/common/ConnectionBadge';
import { useSocket } from '@/hooks/useSocket';

/**
 * Layout principal responsivo: sidebar fija en desktop y drawer en mobile,
 * cabecera superior y área de contenido (Outlet del router). El estado vive
 * en los stores de Zustand (chatStore + uiStore).
 */
export function MainLayout() {
  const navigate = useNavigate();
  const chats = useChatStore((state) => state.chats);
  const currentChatId = useChatStore((state) => state.currentChatId);
  const setCurrentChat = useChatStore((state) => state.setCurrentChat);

  const sidebarOpen = useUIStore((state) => state.sidebarOpen);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
  const setSidebarOpen = useUIStore((state) => state.setSidebarOpen);
  const openModal = useUIStore((state) => state.openModal);

  const { isConnected } = useSocket();

  const currentChat = chats.find((chat) => chat.id === currentChatId) ?? null;

  const handleSelectChat = (chatId: string) => {
    setCurrentChat(chatId);
    setSidebarOpen(false);
    navigate(`/chat/${chatId}`);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <div
        className={cn(
          'fixed inset-y-0 left-0 z-30 w-64 transform transition-transform duration-200 md:static md:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <Sidebar
          chats={chats}
          currentChatId={currentChatId}
          onSelectChat={handleSelectChat}
          onNewChat={() => openModal('newChat')}
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          title={currentChat?.name ?? 'agentes-chat'}
          onToggleSidebar={toggleSidebar}
          onInviteAgent={() => openModal('inviteAgent')}
          connectionSlot={<ConnectionBadge isConnected={isConnected} />}
        />
        <main className="flex-1 overflow-hidden">
          <Outlet />
        </main>
      </div>

      <NewChatModal />
      <InviteAgentModal />
    </div>
  );
}
