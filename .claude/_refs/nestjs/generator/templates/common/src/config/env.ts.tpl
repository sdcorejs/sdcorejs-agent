export interface AppEnv {
  nodeEnv: 'development' | 'test' | 'production';
  port: number;
  corsOrigins: string[];
  corsCredentials: boolean;
  globalBodyLimit: string;
}

export function loadEnv(source: NodeJS.ProcessEnv): AppEnv {
  const nodeEnv = source.NODE_ENV === 'production' ? 'production' : source.NODE_ENV === 'test' ? 'test' : 'development';
  const port = Number(source.PORT ?? 3000);
  const corsCredentials = source.CORS_CREDENTIALS !== 'false';
  const corsOrigins = (source.CORS_ORIGINS ?? (nodeEnv === 'production' ? '' : 'http://localhost:4200')).split(',').map((value) => value.trim()).filter(Boolean);
  const globalBodyLimit = source.GLOBAL_BODY_LIMIT ?? '1mb';
  const errors: string[] = [];
  if (!Number.isInteger(port) || port < 1 || port > 65535) errors.push('PORT');
  const bodyMatch = globalBodyLimit.match(/^(\d+)(kb|mb)$/iu);
  const bodyBytes = bodyMatch ? Number(bodyMatch[1]) * (bodyMatch[2]!.toLowerCase() === 'mb' ? 1_048_576 : 1_024) : 0;
  if (!bodyMatch || bodyBytes < 1 || bodyBytes > 10_485_760) errors.push('GLOBAL_BODY_LIMIT');
  if (corsCredentials && corsOrigins.includes('*')) errors.push('CORS_ORIGINS');
  if (nodeEnv === 'production' && corsOrigins.length === 0) errors.push('CORS_ORIGINS');
  if (nodeEnv === 'production' && !source.DATABASE_URL) errors.push('DATABASE_URL');
  if (errors.length > 0) throw new Error(`Invalid environment keys: ${errors.join(', ')}`);
  return { nodeEnv, port, corsOrigins, corsCredentials, globalBodyLimit };
}
