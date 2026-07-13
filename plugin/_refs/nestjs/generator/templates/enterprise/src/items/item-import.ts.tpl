import { createHash } from 'node:crypto';
import { AppError } from '../errors/app-error';
import { ImportOperationStore } from './item-import-store';

export interface ImportRow {
  name: string;
}

export interface ImportOptions {
  maxRows: number;
  maxBytes: number;
  payloadBytes: number;
  idempotencyKey: string;
  scope: {
    tenantCode: string;
    departmentCode?: string;
  };
}

export interface ImportResult {
  row: number;
  code: 'accepted' | 'duplicate' | 'invalid';
  name?: string;
}

export function sanitizeSpreadsheetValue(value: string): string {
  const normalized = value.trim();
  return /^[=+@-]/u.test(normalized) ? `'${normalized}` : normalized;
}

export function validateImport(rows: readonly ImportRow[], options: ImportOptions): ImportResult[] {
  if (!options.idempotencyKey.trim()) throw new AppError('import.idempotency-key.required');
  if (options.payloadBytes > options.maxBytes) throw new AppError('import.max-bytes');
  if (rows.length > options.maxRows) throw new AppError('import.max-rows');
  const seen = new Set<string>();
  return rows.map((row, index) => {
    const name = sanitizeSpreadsheetValue(row.name);
    const key = name.toLocaleLowerCase('en-US');
    if (!name) return { row: index + 1, code: 'invalid' };
    if (seen.has(key)) return { row: index + 1, code: 'duplicate' };
    seen.add(key);
    return { row: index + 1, code: 'accepted', name };
  });
}

export async function executeImport(
  store: ImportOperationStore,
  rows: readonly ImportRow[],
  options: ImportOptions,
): Promise<readonly ImportResult[]> {
  const requestDigest = createHash('sha256').update(JSON.stringify(rows)).digest('hex');
  return store.executeOnce({
    tenantCode: options.scope.tenantCode,
    ...(options.scope.departmentCode ? { departmentCode: options.scope.departmentCode } : {}),
    operationKey: options.idempotencyKey,
    requestDigest,
  }, () => validateImport(rows, options));
}
