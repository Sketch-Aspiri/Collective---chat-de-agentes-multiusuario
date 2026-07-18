/** Detecta @menciones de la forma `@handle` (letras, dígitos y `_`). */
export const MENTION_REGEX = /@(\w+)/g;

/**
 * Extrae los handles mencionados (sin el `@`), sin duplicados y en orden.
 */
export function parseMentions(text: string): string[] {
  const matches = text.matchAll(MENTION_REGEX);
  const handles: string[] = [];
  for (const match of matches) {
    const handle = match[1];
    if (!handles.includes(handle)) {
      handles.push(handle);
    }
  }
  return handles;
}

export interface TextSegment {
  text: string;
  isMention: boolean;
}

/**
 * Divide un texto en segmentos alternando texto plano y menciones,
 * para poder resaltar visualmente las @menciones.
 */
export function splitByMentions(text: string): TextSegment[] {
  const segments: TextSegment[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(MENTION_REGEX)) {
    const start = match.index ?? 0;
    if (start > lastIndex) {
      segments.push({ text: text.slice(lastIndex, start), isMention: false });
    }
    segments.push({ text: match[0], isMention: true });
    lastIndex = start + match[0].length;
  }

  if (lastIndex < text.length) {
    segments.push({ text: text.slice(lastIndex), isMention: false });
  }

  return segments;
}
