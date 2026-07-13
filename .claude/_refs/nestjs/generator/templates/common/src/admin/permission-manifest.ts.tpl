export interface PermissionDefinition {
  code: string;
  descriptionKey: string;
  owner: string;
  profiles: readonly ('simple' | 'enterprise')[];
}

export const PERMISSIONS = [
  { code: 'items:read', descriptionKey: 'items.permission.read', owner: 'items', profiles: ['simple', 'enterprise'] },
  { code: 'items:write', descriptionKey: 'items.permission.write', owner: 'items', profiles: ['simple', 'enterprise'] },
  { code: 'items:admin', descriptionKey: 'items.permission.admin', owner: 'items', profiles: ['simple', 'enterprise'] },
  { code: 'items:approve', descriptionKey: 'items.permission.approve', owner: 'items', profiles: ['enterprise'] },
  { code: 'items:import', descriptionKey: 'items.permission.import', owner: 'items', profiles: ['enterprise'] },
  { code: 'items:export', descriptionKey: 'items.permission.export', owner: 'items', profiles: ['enterprise'] },
] satisfies readonly PermissionDefinition[];

export function reconcilePermissions(existingCodes: readonly string[]) {
  const expected = new Set(PERMISSIONS.map((permission) => permission.code));
  return {
    added: PERMISSIONS.filter((permission) => !existingCodes.includes(permission.code)),
    stale: existingCodes.filter((code) => !expected.has(code)),
  };
}
