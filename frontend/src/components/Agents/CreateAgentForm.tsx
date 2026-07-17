import { FormEvent, useState } from 'react';
import { Button } from '../Common/Button';
import { LLMProvider } from '../../types';

interface CreateAgentFormProps {
  onSubmit: (input: { name: string; mentionHandle: string; provider: LLMProvider }) => void;
}

export function CreateAgentForm({ onSubmit }: CreateAgentFormProps) {
  const [name, setName] = useState('');
  const [mentionHandle, setMentionHandle] = useState('');
  const [provider, setProvider] = useState<LLMProvider>('anthropic');

  function handleSubmit(event: FormEvent): void {
    event.preventDefault();
    onSubmit({ name, mentionHandle, provider });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        className="border rounded px-3 py-2 w-full"
        placeholder="Nombre del agente"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        className="border rounded px-3 py-2 w-full"
        placeholder="Handle (@mención)"
        value={mentionHandle}
        onChange={(e) => setMentionHandle(e.target.value)}
      />
      <select
        className="border rounded px-3 py-2 w-full"
        value={provider}
        onChange={(e) => setProvider(e.target.value as LLMProvider)}
      >
        <option value="anthropic">Anthropic</option>
        <option value="openai">OpenAI</option>
        <option value="google">Google</option>
      </select>
      <Button type="submit">Crear agente</Button>
    </form>
  );
}
