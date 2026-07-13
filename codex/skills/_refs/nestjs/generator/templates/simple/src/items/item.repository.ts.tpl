import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { Item } from './item.entity';
import { ItemCreateRequest } from './item-create.schema';
import { ItemUpdateRequest } from './item-update.schema';
import { Scope } from '../scope/scope-contract';

@Injectable()
export class ItemRepository {
  private readonly rows: Item[] = [];

  search(_scope: Scope): Item[] {
    return this.rows.map((row) => ({ ...row }));
  }

  detail(id: string, _scope: Scope): Item | undefined {
    const row = this.rows.find((candidate) => candidate.id === id);
    return row ? { ...row } : undefined;
  }

  create(input: ItemCreateRequest, ownerId: string, _scope: Scope): Item {
    const row: Item = { id: randomUUID(), name: input.name, ownerId, version: 1 };
    this.rows.push(row);
    return { ...row };
  }

  update(id: string, input: ItemUpdateRequest, _scope: Scope): Item | undefined {
    const row = this.rows.find((candidate) => candidate.id === id);
    if (!row || row.version !== input.expectedVersion) return undefined;
    row.name = input.name ?? row.name;
    row.version += 1;
    return { ...row };
  }
}
