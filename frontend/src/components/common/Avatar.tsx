import { getInitials } from '@/utils/formatting';
import { cn } from '@/lib/utils';

interface AvatarProps {
  name: string;
  color?: string;
  className?: string;
}

/** Avatar circular con iniciales y color de fondo opcional. */
export function Avatar({ name, color, className }: AvatarProps) {
  return (
    <span
      className={cn(
        'inline-flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full text-xs font-semibold text-white',
        className,
      )}
      style={{ backgroundColor: color ?? 'hsl(var(--primary))' }}
      aria-hidden="true"
    >
      {getInitials(name)}
    </span>
  );
}
