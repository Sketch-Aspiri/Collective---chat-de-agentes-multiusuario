import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import { usersController } from './users.controller';

export const usersRoutes = Router();

usersRoutes.use(authMiddleware);
usersRoutes.get('/me', (req, res, next) => usersController.me(req, res).catch(next));
usersRoutes.patch('/me', (req, res, next) => usersController.updateMe(req, res).catch(next));
