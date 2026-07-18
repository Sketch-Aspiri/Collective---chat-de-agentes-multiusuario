import ReactMarkdown from 'react-markdown';
import type { Message as MessageType } from '@/types';
import { Avatar } from '@/components/common/Avatar';
import { formatTime } from '@/utils/formatting';
import { cn } from '@/lib/utils';

interface MessageProps {
  message: MessageType;
  /** Color de avatar (por ejemplo, el del agente autor). */
  avatarColor?: string;
}

/**
 * Renderiza un mensaje: avatar, autor, timestamp y contenido en Markdown.
 * Diferencia visualmente mensajes de usuario y de agente.
 */
export function Message({ message, avatarColor }: MessageProps) {
  const isAgent = message.authorType === 'agent';

  return (
    <div className="flex gap-3 px-4 py-3">
      <Avatar name={message.authorName} color={avatarColor} />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-semibold">{message.authorName}</span>
          {isAgent && (
            <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-primary">
              agente
            </span>
          )}
          <time className="text-xs text-muted-foreground" dateTime={message.createdAt}>
            {formatTime(message.createdAt)}
          </time>
        </div>
        <div
          className={cn(
            'mt-1 break-words text-sm leading-relaxed text-foreground',
            // Estilos ligeros para el markdown (sin plugin de typography).
            '[&_p]:my-1 [&_ul]:my-1 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-1 [&_ol]:list-decimal [&_ol]:pl-5',
            '[&_pre]:my-2 [&_pre]:overflow-x-auto [&_pre]:rounded [&_pre]:bg-muted [&_pre]:p-2 [&_code]:text-xs',
            '[&_a]:text-primary [&_a]:underline',
          )}
        >
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
