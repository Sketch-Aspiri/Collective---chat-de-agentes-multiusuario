import { NextFunction, Request, Response } from 'express';

interface MetricsState {
  totalRequests: number;
  totalErrors: number;
  totalDurationMs: number;
  byStatusClass: Record<string, number>;
}

const state: MetricsState = {
  totalRequests: 0,
  totalErrors: 0,
  totalDurationMs: 0,
  byStatusClass: {},
};

/**
 * Middleware que acumula métricas básicas en memoria: conteo de requests,
 * errores (>=500), latencia agregada y desglose por clase de status (2xx/4xx/5xx).
 */
export function metricsMiddleware(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  res.on('finish', () => {
    const statusClass = `${Math.floor(res.statusCode / 100)}xx`;
    state.totalRequests += 1;
    state.totalDurationMs += Date.now() - start;
    state.byStatusClass[statusClass] = (state.byStatusClass[statusClass] ?? 0) + 1;
    if (res.statusCode >= 500) {
      state.totalErrors += 1;
    }
  });
  next();
}

export interface MetricsSnapshot {
  totalRequests: number;
  totalErrors: number;
  avgDurationMs: number;
  byStatusClass: Record<string, number>;
}

export function getMetrics(): MetricsSnapshot {
  const avgDurationMs =
    state.totalRequests === 0 ? 0 : Math.round(state.totalDurationMs / state.totalRequests);

  return {
    totalRequests: state.totalRequests,
    totalErrors: state.totalErrors,
    avgDurationMs,
    byStatusClass: { ...state.byStatusClass },
  };
}
