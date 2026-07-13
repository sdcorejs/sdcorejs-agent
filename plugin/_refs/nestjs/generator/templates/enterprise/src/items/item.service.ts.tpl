import { Readable } from 'node:stream';
import { Injectable } from '@nestjs/common';
import { AppError } from '../errors/app-error';
import { RequestActor } from '../auth/request-actor';
import { scopeFromActor } from '../scope/scope-contract';
import { ItemApproveRequest, ItemImportRequest } from './item-action.schema';
import { ItemCreateRequest } from './item-create.schema';
import { streamItems } from './item-export';
import { executeImport } from './item-import';
import { ImportOperationStore } from './item-import-store';
import { ItemRepository } from './item.repository';
import { ItemResponseDto } from './item-response.dto';
import { ItemUpdateRequest } from './item-update.schema';
import { transitionItem } from './item-workflow';

@Injectable()
export class ItemService {
  constructor(
    private readonly repository: ItemRepository,
    private readonly importOperations: ImportOperationStore,
  ) {}

  search(actor: RequestActor): ItemResponseDto[] {
    return this.repository.search(scopeFromActor(actor)).map((item) => this.toDto(item, actor));
  }

  detail(id: string, actor: RequestActor): ItemResponseDto {
    const item = this.repository.detail(id, scopeFromActor(actor));
    if (!item) throw new AppError('item.not-found');
    return this.toDto(item, actor);
  }

  create(input: ItemCreateRequest, actor: RequestActor): ItemResponseDto {
    const item = this.repository.create(input, actor.id, scopeFromActor(actor));
    return this.toDto(item, actor);
  }

  update(id: string, input: ItemUpdateRequest, actor: RequestActor): ItemResponseDto {
    const current = this.repository.detail(id, scopeFromActor(actor));
    if (!current) throw new AppError('item.not-found');
    if (current.ownerId !== actor.id && !actor.permissions.includes('items:admin')) {
      throw new AppError('item.forbidden');
    }
    const updated = this.repository.update(id, input, scopeFromActor(actor));
    if (!updated) throw new AppError('item.version-conflict');
    return this.toDto(updated, actor);
  }

  async approve(id: string, input: ItemApproveRequest, actor: RequestActor): Promise<ItemResponseDto> {
    await transitionItem(this.repository, actor, id, input.expectedVersion, 'Approved');
    return this.detail(id, actor);
  }

  async importRows(input: ItemImportRequest, actor: RequestActor) {
    const scope = scopeFromActor(actor);
    const payloadBytes = Buffer.byteLength(JSON.stringify(input.rows), 'utf8');
    return executeImport(this.importOperations, input.rows, {
      maxRows: 1000,
      maxBytes: 1_048_576,
      payloadBytes,
      idempotencyKey: input.idempotencyKey,
      scope,
    });
  }

  exportStream(actor: RequestActor): Readable {
    const scope = scopeFromActor(actor);
    return Readable.from(streamItems(this.repository, { scope, maxRows: 10_000, pageSize: 250 }));
  }

  private toDto(item: ReturnType<ItemRepository['search']>[number], actor: RequestActor): ItemResponseDto {
    return {
      ...item,
      editable: actor.permissions.includes('items:write')
        && (item.ownerId === actor.id || actor.permissions.includes('items:admin')),
    };
  }
}
