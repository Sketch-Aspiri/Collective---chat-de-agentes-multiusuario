import { stripeClient } from './stripe.integration';

export class BillingService {
  async createCheckoutSession(customerId: string, priceId: string) {
    return stripeClient.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: 'https://app.example.com/billing/success',
      cancel_url: 'https://app.example.com/billing/cancel',
    });
  }
}

export const billingService = new BillingService();
