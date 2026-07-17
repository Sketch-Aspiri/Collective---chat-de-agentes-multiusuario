import { Request, Response } from 'express';
import Stripe from 'stripe';
import { stripeClient } from '../billing/stripe.integration';
import { env } from '../../config/env';
import { logger } from '../../utils/logger';
import { ValidationError } from '../../utils/errors';

export class WebhooksController {
  async stripe(req: Request, res: Response): Promise<void> {
    const signature = req.headers['stripe-signature'];
    if (typeof signature !== 'string') {
      throw new ValidationError('Missing stripe-signature header');
    }

    let event: Stripe.Event;
    try {
      event = stripeClient.webhooks.constructEvent(req.body, signature, env.stripeWebhookSecret);
    } catch (err) {
      throw new ValidationError(`Invalid Stripe signature: ${(err as Error).message}`);
    }

    logger.info('Stripe webhook received', { type: event.type });
    res.status(200).json({ success: true, data: { received: true }, error: null });
  }
}

export const webhooksController = new WebhooksController();
