import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Textarea } from '@/components/common/Textarea';
import { Button } from '@/components/common/Button';
import { MentionText } from '@/components/common/MentionText';
import { SendIcon } from '@/components/common/icons';
import { parseMentions } from '@/utils/mentions';

const MAX_LENGTH = 2000;

interface MessageInputProps {
  onSend: (content: string) => void;
  /** Se dispara al escribir; preparado para el indicador de typing vía Socket. */
  onTyping?: () => void;
  disabled?: boolean;
}

/**
 * Input de mensaje: textarea auto-expandible, límite de 2000 caracteres,
 * detección de @menciones (con previsualización resaltada) y envío con Enter.
 */
export function MessageInput({ onSend, onTyping, disabled = false }: MessageInputProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-expansión de la altura según el contenido.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [value]);

  const trimmed = value.trim();
  const canSend = trimmed.length > 0 && !disabled;
  const hasMentions = parseMentions(value).length > 0;

  const handleSend = () => {
    if (!canSend) return;
    onSend(trimmed);
    setValue('');
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-border bg-card p-3">
      {hasMentions && (
        <div className="mb-2 rounded-md bg-muted/50 px-3 py-1.5 text-sm">
          <MentionText text={value} />
        </div>
      )}
      <div className="flex items-end gap-2">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(event) => {
            setValue(event.target.value.slice(0, MAX_LENGTH));
            onTyping?.();
          }}
          onKeyDown={handleKeyDown}
          rows={1}
          maxLength={MAX_LENGTH}
          disabled={disabled}
          placeholder="Escribe un mensaje…  (usa @ para mencionar a un agente)"
          aria-label="Mensaje"
        />
        <Button
          onClick={handleSend}
          disabled={!canSend}
          size="icon"
          aria-label="Enviar mensaje"
        >
          <SendIcon width={18} height={18} />
        </Button>
      </div>
      <div className="mt-1 flex justify-end">
        <span className="text-xs text-muted-foreground">
          {value.length}/{MAX_LENGTH}
        </span>
      </div>
    </div>
  );
}
