import { FormEvent, useState } from 'react';
import { Button } from '../Common/Button';

interface InviteMembersFormProps {
  onInvite: (userId: string) => void;
}

export function InviteMembersForm({ onInvite }: InviteMembersFormProps) {
  const [userId, setUserId] = useState('');

  function handleSubmit(event: FormEvent): void {
    event.preventDefault();
    if (!userId.trim()) return;
    onInvite(userId.trim());
    setUserId('');
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        className="border rounded px-3 py-2 flex-1"
        placeholder="ID de usuario a invitar"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
      />
      <Button type="submit">Invitar</Button>
    </form>
  );
}
