import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import { rateLimiter } from '../../middleware/rateLimiter';
import { agentsController } from './agents.controller';

export const agentsRoutes = Router();

agentsRoutes.use(authMiddleware, rateLimiter);
agentsRoutes.post('/', (req, res, next) => agentsController.create(req, res).catch(next));
agentsRoutes.get('/chat/:chatId', (req, res, next) =>
  agentsController.listForChat(req, res).catch(next),
);
agentsRoutes.post('/:id/execute', (req, res, next) =>
  agentsController.execute(req, res).catch(next),
);
