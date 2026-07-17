import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import { rateLimiter } from '../../middleware/rateLimiter';
import { messagesController } from './messages.controller';

export const messagesRoutes = Router();

messagesRoutes.use(authMiddleware, rateLimiter);
messagesRoutes.post('/', (req, res, next) => messagesController.create(req, res).catch(next));
messagesRoutes.get('/chat/:chatId', (req, res, next) =>
  messagesController.listForChat(req, res).catch(next),
);
