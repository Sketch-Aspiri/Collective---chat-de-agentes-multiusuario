import { cn } from '@/lib/utils';
import { CloseIcon } from './icons';

interface ErrorBannerProps {
  message: string;
  onDismiss?: () => void;
  className?: string;
}

/** Banner de error accesible con botón opcional de cierre. */
export function ErrorBanner({ message, onDismiss, className }: ErrorBannerProps) {
  return (
    <div
      role="alert"
      className={cn(
        'flex items-start justify-between gap-3 rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive',
        className,
      )}
    >
      <span>{message}</span>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Descartar error"
          className="shrink-0 rounded p-0.5 hover:bg-destructive/20"
        >
          <CloseIcon width={16} height={16} />
        </button>
      )}
    </div>
  );
}
