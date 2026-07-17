import { Request, Response } from 'express';
import { billingService } from './billing.service';

export class BillingController {
  async createCheckoutSession(req: Request, res: Response): Promise<void> {
    const session = await billingService.createCheckoutSession(
      req.body.customerId,
      req.body.priceId,
    );
    res.status(201).json({ success: true, data: { url: session.url }, error: null });
  }
}

export const billingController = new BillingController();
