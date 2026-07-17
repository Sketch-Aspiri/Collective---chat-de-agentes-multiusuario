import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const environmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().max(65535).default(4000),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  JWT_SECRET: z.string().min(8),
  JWT_EXPIRES_IN: z.string().default('1d'),
  ENCRYPTION_KEY: z.string().min(16),
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),
  SENDGRID_API_KEY: z.string().default(''),
  STRIPE_SECRET_KEY: z.string().default(''),
  STRIPE_WEBHOOK_SECRET: z.string().default(''),
});

const parsedEnvironment = environmentSchema.safeParse(process.env);

if (!parsedEnvironment.success) {
  const details = parsedEnvironment.error.issues
    .map(({ path, message }) => `${path.join('.')}: ${message}`)
    .join(', ');
  throw new Error(`Invalid environment configuration: ${details}`);
}

const environment = parsedEnvironment.data;

export const env = {
  nodeEnv: environment.NODE_ENV,
  port: environment.PORT,
  databaseUrl: environment.DATABASE_URL,
  redisUrl: environment.REDIS_URL,
  jwtSecret: environment.JWT_SECRET,
  jwtExpiresIn: environment.JWT_EXPIRES_IN,
  encryptionKey: environment.ENCRYPTION_KEY,
  frontendUrl: environment.FRONTEND_URL,
  sendgridApiKey: environment.SENDGRID_API_KEY,
  stripeSecretKey: environment.STRIPE_SECRET_KEY,
  stripeWebhookSecret: environment.STRIPE_WEBHOOK_SECRET,
};
