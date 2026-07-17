import { decrypt, encrypt, ENCRYPTION_ALGORITHM } from '../../src/utils/encryption';

describe('encryption utilities', () => {
  it('encrypts and decrypts UTF-8 values with AES-256-GCM', () => {
    const plaintext = 'api-key-secreta-🔐';
    const encrypted = encrypt(plaintext);

    expect(ENCRYPTION_ALGORITHM).toBe('aes-256-gcm');
    expect(encrypted).not.toContain(plaintext);
    expect(decrypt(encrypted)).toBe(plaintext);
    expect(encrypt(plaintext)).not.toBe(encrypted);
  });

  it('rejects truncated or tampered ciphertext', () => {
    expect(() => decrypt('invalid')).toThrow('Invalid encrypted payload');

    const encrypted = encrypt('sensitive');
    const packed = Buffer.from(encrypted, 'base64url');
    packed[packed.length - 1] ^= 1;
    expect(() => decrypt(packed.toString('base64url'))).toThrow();
  });
});
