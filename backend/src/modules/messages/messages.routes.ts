import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import { messagesController } from './messages.controller';

export const messagesRoutes = Router();

messagesRoutes.use(authMiddleware);
messagesRoutes.post('/', (req, res, next) => messagesController.create(req, res).catch(next));
messagesRoutes.get('/chat/:chatId', (req, res, next) =>
  messagesController.listForChat(req, res).catch(next),
);
