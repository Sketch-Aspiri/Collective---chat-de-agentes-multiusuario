/**
 * Encryption utilities are intentionally deferred to the security task.
 * This module reserves the stable import path without introducing insecure crypto.
 */
export const ENCRYPTION_ALGORITHM = 'aes-256-gcm' as const;
