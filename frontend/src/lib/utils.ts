import clsx, { type ClassValue } from 'clsx';

/**
 * Combina class names condicionales en un único string.
 * Envuelve `clsx` para mantener un único punto de import en la app
 * (estilo shadcn/ui, sin depender de tailwind-merge).
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}
