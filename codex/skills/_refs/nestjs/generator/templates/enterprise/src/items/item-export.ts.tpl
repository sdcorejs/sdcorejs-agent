import { Item } from './item.entity';
import { Scope } from '../scope/scope-contract';
import { AppError } from '../errors/app-error';

export interface ExportSource {
  page(scope: Scope, cursor: string | undefined, limit: number): Promise<{ rows: Item[]; next?: string }> | { rows: Item[]; next?: string };
}

export interface ExportOptions {
  scope: Scope;
  maxRows: number;
  pageSize: number;
}

export async function* streamItems(source: ExportSource, options: ExportOptions): AsyncGenerator<string> {
  if (!options.scope.tenantCode) throw new AppError('export.tenant-required');
  if (options.maxRows < 1 || options.pageSize < 1) throw new AppError('export.invalid-limit');
  let emitted = 0;
  let cursor: string | undefined;
  yield 'id,name\n';
  do {
    const page = await source.page(options.scope, cursor, Math.min(options.pageSize, options.maxRows - emitted));
    for (const row of page.rows) {
      if (row.tenantCode !== options.scope.tenantCode) throw new AppError('export.scope-violation');
      if (options.scope.departmentCode && row.departmentCode !== options.scope.departmentCode) throw new AppError('export.department-scope-violation');
      if (emitted >= options.maxRows) throw new AppError('export.max-rows');
      yield `${row.id},${JSON.stringify(row.name)}\n`;
      emitted += 1;
    }
    cursor = page.next;
  } while (cursor && emitted < options.maxRows);
}
