import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import { rateLimiter } from '../../middleware/rateLimiter';
import { usersController } from './users.controller';

export const usersRoutes = Router();

usersRoutes.use(authMiddleware, rateLimiter);
usersRoutes.get('/me', (req, res, next) => usersController.me(req, res).catch(next));
usersRoutes.patch('/me', (req, res, next) => usersController.updateMe(req, res).catch(next));
