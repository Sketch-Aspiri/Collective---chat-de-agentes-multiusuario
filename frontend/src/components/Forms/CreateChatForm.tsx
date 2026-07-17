import { FormEvent, useState } from 'react';
import { Button } from '../Common/Button';

interface CreateChatFormProps {
  onSubmit: (name: string) => void;
}

export function CreateChatForm({ onSubmit }: CreateChatFormProps) {
  const [name, setName] = useState('');

  function handleSubmit(event: FormEvent): void {
    event.preventDefault();
    if (!name.trim()) return;
    onSubmit(name.trim());
    setName('');
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        className="border rounded px-3 py-2 flex-1"
        placeholder="Nombre del chat"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <Button type="submit">Crear</Button>
    </form>
  );
}
