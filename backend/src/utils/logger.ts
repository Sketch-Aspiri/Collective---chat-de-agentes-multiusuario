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

// Redacta in-place las claves sensibles. Mutar (en vez de reconstruir con
// Object.fromEntries) preserva las props con clave Symbol que winston usa
// internamente (LEVEL/MESSAGE/SPLAT) y no descarta message/stack de los Error.
function redactInPlace(value: unknown, seen: WeakSet<object>): void {
  if (value === null || typeof value !== 'object') {
    return;
  }
  if (seen.has(value)) {
    return; // evita ciclos
  }
  seen.add(value);

  if (Array.isArray(value)) {
    value.forEach((item) => redactInPlace(item, seen));
    return;
  }

  const record = value as Record<string, unknown>;
  for (const key of Object.keys(record)) {
    if (SENSITIVE_KEYS.includes(key.toLowerCase())) {
      record[key] = REDACTED;
    } else {
      redactInPlace(record[key], seen);
    }
  }
}

// Formato que redacta claves sensibles en la metadata de cada log.
const redactFormat = winston.format((info) => {
  redactInPlace(info, new WeakSet<object>());
  return info;
});

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
