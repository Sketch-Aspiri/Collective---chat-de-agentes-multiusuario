import { FormEvent, useState } from 'react';
import { Button } from '../Common/Button';

interface BillingFormProps {
  onSubmit: (priceId: string) => void;
}

export function BillingForm({ onSubmit }: BillingFormProps) {
  const [priceId, setPriceId] = useState('');

  function handleSubmit(event: FormEvent): void {
    event.preventDefault();
    onSubmit(priceId);
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        className="border rounded px-3 py-2 flex-1"
        placeholder="ID de plan"
        value={priceId}
        onChange={(e) => setPriceId(e.target.value)}
      />
      <Button type="submit">Suscribirse</Button>
    </form>
  );
}
