export type RoleScope =
  | { kind: 'global'; tenantCode?: never; departmentCode?: never }
  | { kind: 'tenant'; tenantCode: string; departmentCode?: never }
  | { kind: 'department'; tenantCode: string; departmentCode: string };

export function roleUniqueKey(code: string, scope: RoleScope): string {
  if (!code.trim()) throw new Error('Role code is required.');
  if (scope.kind === 'global') return `global:${code}`;
  if (scope.kind === 'tenant') return `tenant:${scope.tenantCode}:${code}`;
  return `department:${scope.tenantCode}:${scope.departmentCode}:${code}`;
}
