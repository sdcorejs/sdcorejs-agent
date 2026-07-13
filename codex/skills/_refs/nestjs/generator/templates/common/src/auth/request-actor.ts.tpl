export interface RequestActor {
  verified: true;
  id: string;
  permissions: readonly string[];
  tenantCode?: string;
  departmentCode?: string;
}

export function requireActor(value: unknown): RequestActor {
  const actor = value as Partial<RequestActor> | undefined;
  if (!actor || actor.verified !== true || typeof actor.id !== 'string'
    || !Array.isArray(actor.permissions) || !actor.permissions.every((permission) => typeof permission === 'string')
    || (actor.tenantCode !== undefined && typeof actor.tenantCode !== 'string')
    || (actor.departmentCode !== undefined && typeof actor.departmentCode !== 'string')) {
    throw new Error('Authenticated actor is required.');
  }
  return actor as RequestActor;
}
