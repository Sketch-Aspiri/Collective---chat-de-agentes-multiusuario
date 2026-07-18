/* eslint-disable no-console */
/**
 * Logger centralizado del frontend. Único punto que toca `console`,
 * para evitar `console.log` disperso por la app. En producción solo
 * emite warnings y errores.
 */
const isDev = import.meta.env.DEV;

export const logger = {
  info: (...args: unknown[]): void => {
    if (isDev) console.info(...args);
  },
  warn: (...args: unknown[]): void => {
    console.warn(...args);
  },
  error: (...args: unknown[]): void => {
    console.error(...args);
  },
};
