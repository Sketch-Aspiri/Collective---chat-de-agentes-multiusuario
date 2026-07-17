import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import { billingController } from './billing.controller';

export const billingRoutes = Router();

billingRoutes.use(authMiddleware);
billingRoutes.post('/checkout-session', (req, res, next) =>
  billingController.createCheckoutSession(req, res).catch(next),
);
