import { Router, Request, Response } from 'express';
import { getReadiness } from './health.service';

export const healthRoutes = Router();

/**
 * Liveness probe: responde 200 mientras el proceso esté vivo. No toca
 * dependencias externas (uso: Docker healthcheck, load balancer).
 */
healthRoutes.get('/', (_req: Request, res: Response) => {
  res.status(200).json({ success: true, data: { status: 'ok' } });
});

/**
 * Readiness probe: verifica BD y Redis. 200 si todo ok, 503 si degradado.
 */
healthRoutes.get('/ready', async (_req: Request, res: Response) => {
  const report = await getReadiness();
  const statusCode = report.status === 'ok' ? 200 : 503;
  res.status(statusCode).json({ success: report.status === 'ok', data: report });
});
