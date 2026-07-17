import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import { rateLimiter } from '../../middleware/rateLimiter';
import { billingController } from './billing.controller';

export const billingRoutes = Router();

billingRoutes.use(authMiddleware, rateLimiter);
billingRoutes.post('/checkout-session', (req, res, next) =>
  billingController.createCheckoutSession(req, res).catch(next),
);
