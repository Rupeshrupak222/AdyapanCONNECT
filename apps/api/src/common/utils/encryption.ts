import * as crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';

function getKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error(
      'ENCRYPTION_KEY is not set. Refusing to encrypt/decrypt with an insecure default.',
    );
  }
  // Accept a 64-char hex key (32 bytes) or a raw 32-byte utf8 key.
  if (/^[0-9a-fA-F]{64}$/.test(key)) {
    return Buffer.from(key, 'hex');
  }
  const buf = Buffer.from(key, 'utf8');
  if (buf.length < 32) {
    throw new Error('ENCRYPTION_KEY must be at least 32 bytes (or a 64-char hex string).');
  }
  return buf.subarray(0, 32);
}

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const key = getKey();
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

export function decrypt(encryptedText: string): string {
  const parts = encryptedText.split(':');
  if (parts.length !== 3) throw new Error('Invalid encrypted text format');
  const [ivHex, authTagHex, encrypted] = parts;
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const key = getKey();
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

export function hashApiKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}

export function generateApiKey(): { key: string; prefix: string } {
  const prefix = 'ac_';
  const randomBytes = crypto.randomBytes(32).toString('hex');
  const key = `${prefix}${randomBytes}`;
  return { key, prefix: key.substring(0, 8) };
}

export function generateSigningSecret(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function createHmacSignature(payload: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

export function verifyHmacSignature(payload: string, secret: string, signature: string): boolean {
  const expected = createHmacSignature(payload, secret);
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}
