import { FormEvent, useState } from 'react';
import { Button } from '../Common/Button';
import { MAX_MESSAGE_LENGTH } from '../../constants/config';

interface MessageInputProps {
  onSend: (content: string) => void;
}

export function MessageInput({ onSend }: MessageInputProps) {
  const [value, setValue] = useState('');

  function handleSubmit(event: FormEvent): void {
    event.preventDefault();
    if (!value.trim()) return;
    onSend(value.trim());
    setValue('');
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 p-4 border-t">
      <input
        className="flex-1 border rounded px-3 py-2"
        value={value}
        maxLength={MAX_MESSAGE_LENGTH}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Escribe un mensaje o @menciona a un agente..."
      />
      <Button type="submit">Enviar</Button>
    </form>
  );
}
