export interface AppEnv {
  nodeEnv: 'development' | 'test' | 'production';
  port: number;
  corsOrigins: string[];
  corsCredentials: boolean;
  globalBodyLimit: string;
  oidcIssuer: string;
  oidcAudience: string[];
  oidcJwksUri: string;
  oidcAllowedAlgorithms: string[];
  oidcPermissionsClaim: string;
  oidcTenantClaim: string;
  oidcDepartmentClaim: string;
  oidcClockToleranceSeconds: number;
  oidcMaxTokenAge: string;
  oidcJwksCooldownMs: number;
}

export const APP_ENV = Symbol('APP_ENV');

const ASYMMETRIC_JWT_ALGORITHMS = new Set([
  'RS256', 'RS384', 'RS512',
  'PS256', 'PS384', 'PS512',
  'ES256', 'ES384', 'ES512',
  'EdDSA',
]);

export function loadEnv(source: NodeJS.ProcessEnv): AppEnv {
  const nodeEnv = source.NODE_ENV === 'production' ? 'production' : source.NODE_ENV === 'test' ? 'test' : 'development';
  const port = Number(source.PORT ?? 3000);
  const corsCredentials = source.CORS_CREDENTIALS !== 'false';
  const corsOrigins = (source.CORS_ORIGINS ?? (nodeEnv === 'production' ? '' : 'http://localhost:4200')).split(',').map((value) => value.trim()).filter(Boolean);
  const globalBodyLimit = source.GLOBAL_BODY_LIMIT ?? '1mb';
  const oidcIssuer = source.OIDC_ISSUER?.trim() ?? '';
  const oidcAudience = (source.OIDC_AUDIENCE ?? '').split(',').map((value) => value.trim()).filter(Boolean);
  const oidcJwksUri = source.OIDC_JWKS_URI?.trim() ?? '';
  const oidcAllowedAlgorithms = (source.OIDC_ALLOWED_ALGORITHMS ?? 'RS256').split(',').map((value) => value.trim()).filter(Boolean);
  const oidcPermissionsClaim = source.OIDC_PERMISSIONS_CLAIM?.trim() || 'permissions';
  const oidcTenantClaim = source.OIDC_TENANT_CLAIM?.trim() || 'tenant_code';
  const oidcDepartmentClaim = source.OIDC_DEPARTMENT_CLAIM?.trim() || 'department_code';
  const oidcClockToleranceSeconds = Number(source.OIDC_CLOCK_TOLERANCE_SECONDS ?? 5);
  const oidcMaxTokenAge = source.OIDC_MAX_TOKEN_AGE?.trim() || '15m';
  const oidcJwksCooldownMs = Number(source.OIDC_JWKS_COOLDOWN_MS ?? 30_000);
  const errors: string[] = [];
  if (!Number.isInteger(port) || port < 1 || port > 65535) errors.push('PORT');
  const bodyMatch = globalBodyLimit.match(/^(\d+)(kb|mb)$/iu);
  const bodyBytes = bodyMatch ? Number(bodyMatch[1]) * (bodyMatch[2]!.toLowerCase() === 'mb' ? 1_048_576 : 1_024) : 0;
  if (!bodyMatch || bodyBytes < 1 || bodyBytes > 10_485_760) errors.push('GLOBAL_BODY_LIMIT');
  if (corsCredentials && corsOrigins.includes('*')) errors.push('CORS_ORIGINS');
  if (nodeEnv === 'production' && corsOrigins.length === 0) errors.push('CORS_ORIGINS');
  if (nodeEnv === 'production' && !source.DATABASE_URL) errors.push('DATABASE_URL');
  if (!oidcIssuer) errors.push('OIDC_ISSUER');
  if (oidcAudience.length === 0) errors.push('OIDC_AUDIENCE');
  if (!oidcJwksUri) errors.push('OIDC_JWKS_URI');
  if (
    oidcAllowedAlgorithms.length === 0 ||
    oidcAllowedAlgorithms.some((algorithm) => !ASYMMETRIC_JWT_ALGORITHMS.has(algorithm))
  ) errors.push('OIDC_ALLOWED_ALGORITHMS');
  if (!Number.isFinite(oidcClockToleranceSeconds) || oidcClockToleranceSeconds < 0 || oidcClockToleranceSeconds > 60) {
    errors.push('OIDC_CLOCK_TOLERANCE_SECONDS');
  }
  if (!/^\d+(?:s|m|h)$/u.test(oidcMaxTokenAge)) errors.push('OIDC_MAX_TOKEN_AGE');
  if (!Number.isInteger(oidcJwksCooldownMs) || oidcJwksCooldownMs < 0 || oidcJwksCooldownMs > 300_000) {
    errors.push('OIDC_JWKS_COOLDOWN_MS');
  }
  try {
    const issuer = new URL(oidcIssuer);
    const jwks = new URL(oidcJwksUri);
    if (nodeEnv === 'production' && (issuer.protocol !== 'https:' || jwks.protocol !== 'https:')) {
      errors.push('OIDC_HTTPS');
    }
  } catch {
    if (oidcIssuer || oidcJwksUri) errors.push('OIDC_URL');
  }
  if (errors.length > 0) throw new Error(`Invalid environment keys: ${errors.join(', ')}`);
  return {
    nodeEnv,
    port,
    corsOrigins,
    corsCredentials,
    globalBodyLimit,
    oidcIssuer,
    oidcAudience,
    oidcJwksUri,
    oidcAllowedAlgorithms,
    oidcPermissionsClaim,
    oidcTenantClaim,
    oidcDepartmentClaim,
    oidcClockToleranceSeconds,
    oidcMaxTokenAge,
    oidcJwksCooldownMs,
  };
}
