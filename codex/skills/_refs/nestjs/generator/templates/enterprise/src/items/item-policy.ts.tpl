import { RequestActor } from '../auth/request-actor';
import { AppError } from '../errors/app-error';
import { Item } from './item.entity';

export function assertCanMutate(actor: RequestActor, item: Item): void {
  if (!actor.tenantCode || actor.tenantCode !== item.tenantCode) {
    throw new AppError('item.forbidden.tenant');
  }
  if (actor.departmentCode && actor.departmentCode !== item.departmentCode) {
    throw new AppError('item.forbidden.department');
  }
  const ownsItem = actor.id === item.ownerId;
  const hasAdminPermission = actor.permissions.includes('items:admin');
  if (!ownsItem && !hasAdminPermission) {
    throw new AppError('item.forbidden.actor');
  }
}
