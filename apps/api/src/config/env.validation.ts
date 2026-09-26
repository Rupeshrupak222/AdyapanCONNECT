/**
 * Startup environment validation.
 *
 * Fails fast (throws) if required secrets are missing, use a known insecure
 * default, or are too weak. This runs before the Nest app boots so an
 * unsafe configuration can never reach production traffic.
 */

/** Placeholder / example values that must never be used as real secrets. */
const KNOWN_INSECURE_VALUES = new Set([
  'cookie-secret',
  'default-32-char-encryption-key!!',
  'your-super-secret-jwt-key-change-this-in-production',
  'your-super-secret-refresh-key-change-this-in-production',
  'your-32-character-encryption-key-here',
  'changeme',
  'secret',
  'password',
  'admin@123456',
  'changethispassword!123',
]);

interface SecretRule {
  /** Env var name. */
  name: string;
  /** Minimum character length for the value. */
  minLength: number;
  /** Whether the secret is required in all environments (else only in prod). */
  requiredAlways?: boolean;
}

const SECRET_RULES: SecretRule[] = [
  { name: 'JWT_SECRET', minLength: 32, requiredAlways: true },
  { name: 'JWT_REFRESH_SECRET', minLength: 32, requiredAlways: true },
  { name: 'ENCRYPTION_KEY', minLength: 32, requiredAlways: true },
  { name: 'COOKIE_SECRET', minLength: 16, requiredAlways: false },
];

export function validateEnv(env: NodeJS.ProcessEnv = process.env): void {
  const isProd = env.NODE_ENV === 'production';
  const errors: string[] = [];

  for (const rule of SECRET_RULES) {
    const value = env[rule.name];
    const required = rule.requiredAlways || isProd;

    if (!value) {
      if (required) {
        errors.push(`${rule.name} is required but not set.`);
      }
      continue;
    }

    if (KNOWN_INSECURE_VALUES.has(value.trim().toLowerCase())) {
      errors.push(`${rule.name} uses a known insecure/example value. Set a strong unique secret.`);
    }

    if (value.length < rule.minLength) {
      errors.push(`${rule.name} must be at least ${rule.minLength} characters (got ${value.length}).`);
    }
  }

  // JWT_SECRET and JWT_REFRESH_SECRET must differ so a leak of one does not
  // compromise the other token class.
  if (env.JWT_SECRET && env.JWT_REFRESH_SECRET && env.JWT_SECRET === env.JWT_REFRESH_SECRET) {
    errors.push('JWT_SECRET and JWT_REFRESH_SECRET must be different values.');
  }

  // The super admin password must not be a known-weak default in production.
  if (isProd && env.SUPER_ADMIN_PASSWORD) {
    const pw = env.SUPER_ADMIN_PASSWORD.trim().toLowerCase();
    if (KNOWN_INSECURE_VALUES.has(pw) || env.SUPER_ADMIN_PASSWORD.length < 12) {
      errors.push('SUPER_ADMIN_PASSWORD is weak or a known default. Use a strong (>=12 char) password in production.');
    }
  }

  if (errors.length > 0) {
    throw new Error(
      `Environment validation failed:\n  - ${errors.join('\n  - ')}\n` +
        'Refusing to start with an insecure configuration.',
    );
  }
}
