const MINUTE = 60;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/**
 * Formatea una fecha ISO como tiempo relativo en español
 * ("ahora", "hace 2 min", "hace 3 h", "hace 4 d").
 */
export function formatRelativeTime(iso: string, now: Date = new Date()): string {
  const date = new Date(iso);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (Number.isNaN(seconds)) return '';
  if (seconds < MINUTE) return 'ahora';
  if (seconds < HOUR) return `hace ${Math.floor(seconds / MINUTE)} min`;
  if (seconds < DAY) return `hace ${Math.floor(seconds / HOUR)} h`;
  return `hace ${Math.floor(seconds / DAY)} d`;
}

/** Formatea la hora local como HH:mm. */
export function formatTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/** Iniciales (1-2 letras) a partir de un nombre, para avatares. */
export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
