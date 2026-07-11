import { RequestActor } from '../auth/request-actor';
import { AppError } from '../errors/app-error';
import { Scope, scopeFromActor } from '../scope/scope-contract';
import { Item } from './item.entity';
import { assertCanMutate } from './item-policy';

export interface ItemWorkflowStore {
  detail(id: string, scope: Scope): Promise<Item | undefined> | Item | undefined;
  compareAndSwap(id: string, scope: Scope, expectedVersion: number, patch: Partial<Item>): Promise<boolean> | boolean;
}

export async function transitionItem(
  store: ItemWorkflowStore,
  actor: RequestActor,
  id: string,
  expectedVersion: number,
  name: string,
): Promise<void> {
  const scope = scopeFromActor(actor);
  const current = await store.detail(id, scope);
  if (!current) throw new AppError('item.not-found');
  assertCanMutate(actor, current);
  if (current.version !== expectedVersion) throw new AppError('item.version-conflict');
  const committed = await store.compareAndSwap(id, scope, expectedVersion, {
    name,
    version: expectedVersion + 1,
  });
  if (!committed) throw new AppError('item.version-conflict');
}
