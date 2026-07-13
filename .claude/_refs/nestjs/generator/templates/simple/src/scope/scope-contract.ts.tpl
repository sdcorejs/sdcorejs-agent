export const profile = 'simple' as const;

export interface Scope {}

export function scopeFromActor(_actor?: unknown): Scope {
  return {};
}
