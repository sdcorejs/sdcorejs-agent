import { RequestMethod } from '@nestjs/common';
import { GUARDS_METADATA, METHOD_METADATA, PATH_METADATA, ROUTE_ARGS_METADATA } from '@nestjs/common/constants';
import { AuthenticationGuard } from '../auth/authentication';
import { PERMISSION, PolicyGuard, PROTECTED_ROUTE } from '../auth/policy';
import { ItemController } from './item.controller';

export interface RouteAuditRecord {
  method: 'GET' | 'POST' | 'PUT';
  path: string;
  protected: boolean;
  permission: string;
  validators: readonly string[];
  mutation: boolean;
}

export const ITEM_ROUTES: readonly RouteAuditRecord[] = [
  { method: 'GET', path: '/items', protected: true, permission: 'items:read', validators: [], mutation: false },
  { method: 'GET', path: '/items/export', protected: true, permission: 'items:export', validators: [], mutation: false },
  { method: 'GET', path: '/items/:id', protected: true, permission: 'items:read', validators: ['uuid:id'], mutation: false },
{{#MUTATIONS}}
  { method: 'POST', path: '/items', protected: true, permission: 'items:write', validators: ['ItemCreateSchema'], mutation: true },
  { method: 'PUT', path: '/items/:id', protected: true, permission: 'items:write', validators: ['uuid:id', 'ItemUpdateSchema'], mutation: true },
  { method: 'PUT', path: '/items/:id/approve', protected: true, permission: 'items:approve', validators: ['uuid:id', 'ItemApproveSchema'], mutation: true },
  { method: 'POST', path: '/items/import', protected: true, permission: 'items:import', validators: ['ItemImportSchema', 'maxBytes:1048576'], mutation: true },
{{/MUTATIONS}}
];

const methodNames: Record<number, RouteAuditRecord['method'] | undefined> = {
  [RequestMethod.GET]: 'GET',
  [RequestMethod.POST]: 'POST',
  [RequestMethod.PUT]: 'PUT',
};

export function auditItemControllerRoutes(): RouteAuditRecord[] {
  const prototype = ItemController.prototype as unknown as Record<string, unknown>;
  return Object.getOwnPropertyNames(prototype).flatMap((name) => {
    if (name === 'constructor') return [];
    const handler = prototype[name];
    if (typeof handler !== 'function') return [];
    const requestMethod = Reflect.getMetadata(METHOD_METADATA, handler) as number | undefined;
    const method = requestMethod === undefined ? undefined : methodNames[requestMethod];
    if (!method) return [];
    const routePath = Reflect.getMetadata(PATH_METADATA, handler) as string | undefined;
    const suffix = !routePath || routePath === '/' ? '' : `/${routePath.replace(/^\/+|\/+$/gu, '')}`;
    const guards = (Reflect.getMetadata(GUARDS_METADATA, handler) ?? []) as unknown[];
    const args = (Reflect.getMetadata(ROUTE_ARGS_METADATA, ItemController, name) ?? {}) as Record<string, { pipes?: unknown[] }>;
    return [{
      method,
      path: `/items${suffix}`,
      protected: Reflect.getMetadata(PROTECTED_ROUTE, handler) === true
        && guards.includes(AuthenticationGuard) && guards.includes(PolicyGuard),
      permission: Reflect.getMetadata(PERMISSION, handler) ?? '',
      validators: Object.values(args).flatMap((argument) => argument.pipes ?? [])
        .map((pipe) => (pipe as { constructor?: { name?: string } }).constructor?.name ?? 'unknown'),
      mutation: method !== 'GET',
    }];
  });
}
