import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';
import { chatsController } from './chats.controller';

export const chatsRoutes = Router();

chatsRoutes.use(authMiddleware);
chatsRoutes.post('/', (req, res, next) => chatsController.create(req, res).catch(next));
chatsRoutes.get('/', (req, res, next) => chatsController.list(req, res).catch(next));
chatsRoutes.get('/:id', (req, res, next) => chatsController.getById(req, res).catch(next));
chatsRoutes.post('/:id/members', (req, res, next) =>
  chatsController.inviteMember(req, res).catch(next),
);
