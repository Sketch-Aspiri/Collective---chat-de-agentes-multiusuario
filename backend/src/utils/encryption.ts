import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';
import { env } from '../config/env';

export const ENCRYPTION_ALGORITHM = 'aes-256-gcm' as const;

const IV_LENGTH = 12;
const SALT_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const KEY_LENGTH = 32;

function deriveKey(salt: Buffer): Buffer {
  return scryptSync(env.encryptionKey, salt, KEY_LENGTH);
}

export function encrypt(plaintext: string): string {
  const salt = randomBytes(SALT_LENGTH);
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ENCRYPTION_ALGORITHM, deriveKey(salt), iv);
  const ciphertext = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return Buffer.concat([salt, iv, authTag, ciphertext]).toString('base64url');
}

export function decrypt(payload: string): string {
  const packed = Buffer.from(payload, 'base64url');
  const minimumLength = SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH;
  if (packed.length < minimumLength) throw new Error('Invalid encrypted payload');

  const salt = packed.subarray(0, SALT_LENGTH);
  const iv = packed.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const authTag = packed.subarray(SALT_LENGTH + IV_LENGTH, minimumLength);
  const ciphertext = packed.subarray(minimumLength);
  const decipher = createDecipheriv(ENCRYPTION_ALGORITHM, deriveKey(salt), iv);
  decipher.setAuthTag(authTag);

  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
}
