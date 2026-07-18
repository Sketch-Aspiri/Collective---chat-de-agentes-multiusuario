import type { Chat } from '@/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/common/Button';
import { MessageIcon, PlusIcon } from '@/components/common/icons';

interface SidebarProps {
  chats: Chat[];
  currentChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
}

/**
 * Barra lateral con la lista de chats y el botón "New Chat".
 * Presentacional: recibe datos y callbacks por props.
 */
export function Sidebar({ chats, currentChatId, onSelectChat, onNewChat }: SidebarProps) {
  return (
    <aside className="flex h-full w-full flex-col border-r border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border px-4 py-4">
        <MessageIcon className="text-primary" />
        <span className="text-lg font-semibold">agentes-chat</span>
      </div>

      <nav className="flex-1 overflow-y-auto p-2" aria-label="Lista de chats">
        {chats.length === 0 ? (
          <p className="px-3 py-6 text-center text-sm text-muted-foreground">
            No hay chats todavía
          </p>
        ) : (
          <ul className="space-y-1">
            {chats.map((chat) => {
              const isActive = chat.id === currentChatId;
              return (
                <li key={chat.id}>
                  <button
                    type="button"
                    onClick={() => onSelectChat(chat.id)}
                    aria-current={isActive ? 'page' : undefined}
                    className={cn(
                      'flex w-full flex-col items-start gap-0.5 rounded-md px-3 py-2 text-left transition-colors',
                      isActive
                        ? 'bg-primary/10 text-primary'
                        : 'hover:bg-muted text-foreground',
                    )}
                  >
                    <span className="w-full truncate text-sm font-medium">{chat.name}</span>
                    {chat.lastMessagePreview && (
                      <span className="w-full truncate text-xs text-muted-foreground">
                        {chat.lastMessagePreview}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </nav>

      <div className="border-t border-border p-3">
        <Button onClick={onNewChat} className="w-full" size="md">
          <PlusIcon width={16} height={16} />
          New Chat
        </Button>
      </div>
    </aside>
  );
}
