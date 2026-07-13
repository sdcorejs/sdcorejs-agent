import { RequestActor } from '../auth/request-actor';

export const profile = 'enterprise' as const;

export interface Scope {
  tenantCode: string;
  departmentCode?: string;
}

export function scopeFromActor(actor: RequestActor): Scope {
  if (!actor.tenantCode) throw new Error('Trusted tenant context is required.');
  return {
    tenantCode: actor.tenantCode,
    ...(actor.departmentCode ? { departmentCode: actor.departmentCode } : {}),
  };
}
