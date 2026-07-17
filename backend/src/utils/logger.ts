import winston from 'winston';
import { env } from '../config/env';

// Claves cuyo valor NUNCA debe aparecer en los logs (API keys, tokens, etc.).
const SENSITIVE_KEYS = [
  'password',
  'token',
  'authorization',
  'jwt',
  'secret',
  'apikey',
  'api_key',
  'encryptionkey',
  'encryption_key',
];

const REDACTED = '[REDACTED]';

function redact(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(redact);
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, val]) => {
        if (SENSITIVE_KEYS.includes(key.toLowerCase())) {
          return [key, REDACTED];
        }
        return [key, redact(val)];
      }),
    );
  }
  return value;
}

// Formato que redacta claves sensibles en la metadata de cada log.
const redactFormat = winston.format((info) => redact(info) as winston.Logform.TransformableInfo);

const transports: winston.transport[] = [new winston.transports.Console()];

// En dev/prod (no en test) persistimos logs a archivo para debugging centralizado.
if (env.nodeEnv !== 'test') {
  transports.push(
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  );
}

export const logger = winston.createLogger({
  level: env.nodeEnv === 'production' ? 'info' : 'debug',
  defaultMeta: { service: 'agentes-chat-backend' },
  format: winston.format.combine(
    redactFormat(),
    winston.format.timestamp(),
    winston.format.json(),
  ),
  transports,
});
