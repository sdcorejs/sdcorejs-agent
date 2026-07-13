import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { Item } from './item.entity';
import { ItemCreateRequest } from './item-create.schema';
import { ItemUpdateRequest } from './item-update.schema';
import { Scope } from '../scope/scope-contract';

@Injectable()
export class ItemRepository {
  private readonly rows: Item[] = [];

  private inScope(row: Item, scope: Scope): boolean {
    return row.tenantCode === scope.tenantCode
      && (!scope.departmentCode || row.departmentCode === scope.departmentCode);
  }

  search(scope: Scope): Item[] {
    return this.rows.filter((row) => this.inScope(row, scope)).map((row) => ({ ...row }));
  }

  detail(id: string, scope: Scope): Item | undefined {
    const row = this.rows.find((candidate) => candidate.id === id && this.inScope(candidate, scope));
    return row ? { ...row } : undefined;
  }

  create(input: ItemCreateRequest, ownerId: string, scope: Scope): Item {
    const row: Item = {
      id: randomUUID(),
      tenantCode: scope.tenantCode,
      ...(scope.departmentCode ? { departmentCode: scope.departmentCode } : {}),
      name: input.name,
      ownerId,
      version: 1,
    };
    this.rows.push(row);
    return { ...row };
  }

  update(id: string, input: ItemUpdateRequest, scope: Scope): Item | undefined {
    const row = this.rows.find((candidate) => candidate.id === id && this.inScope(candidate, scope));
    if (!row || row.version !== input.expectedVersion) return undefined;
    row.name = input.name ?? row.name;
    row.version += 1;
    return { ...row };
  }

  compareAndSwap(id: string, scope: Scope, expectedVersion: number, patch: Partial<Item>): boolean {
    const row = this.rows.find((candidate) => candidate.id === id && this.inScope(candidate, scope));
    if (!row || row.version !== expectedVersion) return false;
    Object.assign(row, patch);
    return true;
  }

  page(scope: Scope, cursor: string | undefined, limit: number): { rows: Item[]; next?: string } {
    const scoped = this.rows.filter((row) => this.inScope(row, scope)).sort((left, right) => left.id.localeCompare(right.id));
    const start = cursor ? Math.max(0, scoped.findIndex((row) => row.id === cursor) + 1) : 0;
    const rows = scoped.slice(start, start + limit).map((row) => ({ ...row }));
    const last = rows.at(-1);
    return { rows, ...(last && start + rows.length < scoped.length ? { next: last.id } : {}) };
  }

  existsByName(name: string, scope: Scope): boolean {
    return this.rows.some((row) => this.inScope(row, scope) && row.name === name);
  }

  claimBackground(id: string, scope: Scope): Item | undefined {
    return this.detail(id, scope);
  }
}
