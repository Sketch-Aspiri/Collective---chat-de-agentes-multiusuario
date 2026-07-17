import { Router } from 'express';
import { authController } from './auth.controller';

export const authRoutes = Router();

authRoutes.post('/register', (req, res, next) =>
  authController.register(req, res).catch(next),
);
authRoutes.post('/login', (req, res, next) => authController.login(req, res).catch(next));
