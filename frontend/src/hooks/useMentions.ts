import { useMemo } from 'react';
import { parseMentions } from '@/utils/mentions';

/**
 * Devuelve los handles (@) mencionados en un texto, memoizados.
 */
export function useMentions(text: string): string[] {
  return useMemo(() => parseMentions(text), [text]);
}
