import { cn } from '@/lib/utils';

interface ConnectionBadgeProps {
  isConnected: boolean;
}

/** Badge que muestra el estado de la conexión Socket.io. */
export function ConnectionBadge({ isConnected }: ConnectionBadgeProps) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border border-border px-2 py-1 text-xs"
      title={isConnected ? 'Conectado en tiempo real' : 'Sin conexión en tiempo real'}
    >
      <span
        className={cn(
          'h-2 w-2 rounded-full',
          isConnected ? 'bg-green-500' : 'bg-muted-foreground',
        )}
        aria-hidden="true"
      />
      <span className="hidden sm:inline text-muted-foreground">
        {isConnected ? 'En línea' : 'Offline'}
      </span>
    </span>
  );
}
