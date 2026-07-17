import { BillingForm } from '../components/Forms/BillingForm';
import { api } from '../services/api';

export function SettingsPage() {
  async function handleBilling(priceId: string): Promise<void> {
    const { data } = await api.post('/billing/checkout-session', { priceId });
    if (data?.data?.url) {
      window.location.href = data.data.url;
    }
  }

  return (
    <div className="max-w-md mx-auto mt-16">
      <h1 className="text-2xl font-bold mb-4">Configuración</h1>
      <BillingForm onSubmit={handleBilling} />
    </div>
  );
}
