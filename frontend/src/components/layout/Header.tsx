import { useEffect, useState } from 'react';
import { Button } from '@/components/common/Button';
import { MenuIcon, MoonIcon, SunIcon, UsersIcon } from '@/components/common/icons';

interface HeaderProps {
  title: string;
  onToggleSidebar: () => void;
  onInviteAgent: () => void;
  /** Badge opcional de estado de conexión (Socket.io), se usa en tareas posteriores. */
  connectionSlot?: React.ReactNode;
}

/**
 * Cabecera con título del chat, toggle de sidebar (mobile),
 * botón de invitar agente y conmutador de tema claro/oscuro.
 */
export function Header({ title, onToggleSidebar, onInviteAgent, connectionSlot }: HeaderProps) {
  const [isDark, setIsDark] = useState<boolean>(
    () => document.documentElement.classList.contains('dark'),
  );

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  return (
    <header className="flex h-14 items-center justify-between gap-2 border-b border-border bg-card px-4">
      <div className="flex min-w-0 items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onToggleSidebar}
          aria-label="Abrir menú lateral"
        >
          <MenuIcon />
        </Button>
        <h1 className="truncate text-base font-semibold">{title}</h1>
      </div>

      <div className="flex items-center gap-1">
        {connectionSlot}
        <Button variant="outline" size="sm" onClick={onInviteAgent}>
          <UsersIcon width={16} height={16} />
          <span className="hidden sm:inline">Invite Agent</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsDark((prev) => !prev)}
          aria-label={isDark ? 'Activar tema claro' : 'Activar tema oscuro'}
        >
          {isDark ? <SunIcon /> : <MoonIcon />}
        </Button>
      </div>
    </header>
  );
}
