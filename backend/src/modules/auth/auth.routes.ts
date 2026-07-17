import { Router } from 'express';
import { authController } from './auth.controller';
import { publicAuthRateLimiter } from '../../middleware/rateLimiter';

export const authRoutes = Router();

authRoutes.use(publicAuthRateLimiter);

authRoutes.post('/register', (req, res, next) =>
  authController.register(req, res).catch(next),
);
authRoutes.post('/login', (req, res, next) => authController.login(req, res).catch(next));
