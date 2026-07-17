import { Router } from 'express';
import { webhooksController } from './webhooks.controller';

export const webhooksRoutes = Router();

webhooksRoutes.post('/stripe', (req, res, next) =>
  webhooksController.stripe(req, res).catch(next),
);
