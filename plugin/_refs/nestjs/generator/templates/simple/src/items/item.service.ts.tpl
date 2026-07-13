import { Injectable } from '@nestjs/common';
import { AppError } from '../errors/app-error';
import { RequestActor } from '../auth/request-actor';
import { scopeFromActor } from '../scope/scope-contract';
import { ItemCreateRequest } from './item-create.schema';
import { ItemRepository } from './item.repository';
import { ItemResponseDto } from './item-response.dto';
import { ItemUpdateRequest } from './item-update.schema';

@Injectable()
export class ItemService {
  constructor(private readonly repository: ItemRepository) {}

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

  private toDto(item: ReturnType<ItemRepository['search']>[number], actor: RequestActor): ItemResponseDto {
    return {
      ...item,
      editable: actor.permissions.includes('items:write')
        && (item.ownerId === actor.id || actor.permissions.includes('items:admin')),
    };
  }
}
