import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { requestLogger } from './middleware/logger';
import { errorHandler } from './middleware/errorHandler';
import { authRoutes } from './modules/auth/auth.routes';
import { usersRoutes } from './modules/users/users.routes';
import { chatsRoutes } from './modules/chats/chats.routes';
import { agentsRoutes } from './modules/agents/agents.routes';
import { messagesRoutes } from './modules/messages/messages.routes';
import { billingRoutes } from './modules/billing/billing.routes';
import { webhooksRoutes } from './modules/webhooks/webhooks.routes';

export function createApp(): Express {
  const app = express();

  app.disable('x-powered-by');
  app.use(helmet());
  app.use(cors());
  app.use(requestLogger);

  // Stripe webhooks need the raw body for signature verification.
  app.use('/webhooks', express.raw({ type: 'application/json' }), webhooksRoutes);

  app.use(express.json());
  app.get('/health', (_req, res) => res.status(200).json({ success: true, data: { status: 'ok' } }));
  app.use('/auth', authRoutes);
  app.use('/users', usersRoutes);
  app.use('/chats', chatsRoutes);
  app.use('/agents', agentsRoutes);
  app.use('/messages', messagesRoutes);
  app.use('/billing', billingRoutes);

  app.use(errorHandler);

  return app;
}
