import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import { requestLogger } from './middleware/logger';
import { metricsMiddleware, getMetrics } from './middleware/metrics';
import { errorHandler } from './middleware/errorHandler';
import { healthRoutes } from './modules/health/health.routes';
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
  // CORS restringido al frontend configurado (no reflejar cualquier origen).
  app.use(cors({ origin: env.frontendUrl, credentials: true }));
  app.use(requestLogger);
  app.use(metricsMiddleware);

  // Stripe webhooks need the raw body for signature verification.
  app.use('/webhooks', express.raw({ type: 'application/json' }), webhooksRoutes);

  app.use(express.json());
  // Health: liveness en /health, readiness (BD + Redis) en /health/ready.
  app.use('/health', healthRoutes);
  app.get('/metrics', (_req, res) => res.status(200).json({ success: true, data: getMetrics() }));
  app.use('/auth', authRoutes);
  app.use('/users', usersRoutes);
  app.use('/chats', chatsRoutes);
  app.use('/agents', agentsRoutes);
  app.use('/messages', messagesRoutes);
  app.use('/billing', billingRoutes);

  app.use(errorHandler);

  return app;
}
