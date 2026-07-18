import { splitByMentions } from '@/utils/mentions';
import { cn } from '@/lib/utils';

interface MentionTextProps {
  text: string;
  className?: string;
}

/**
 * Renderiza texto plano resaltando las @menciones.
 * Se usa en la previsualización del input de mensaje.
 */
export function MentionText({ text, className }: MentionTextProps) {
  const segments = splitByMentions(text);
  return (
    <span className={className}>
      {segments.map((segment, index) =>
        segment.isMention ? (
          <span
            key={index}
            className={cn('rounded bg-primary/15 px-1 font-medium text-primary')}
          >
            {segment.text}
          </span>
        ) : (
          <span key={index}>{segment.text}</span>
        ),
      )}
    </span>
  );
}
