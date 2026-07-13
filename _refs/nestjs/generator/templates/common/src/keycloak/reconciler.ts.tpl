import { OperationState, OperationStateStore } from './operation-state';

export interface ReconciliationProbe {
  inspect(state: OperationState): Promise<'confirmed' | 'absent' | 'ambiguous'>;
}
export class KeycloakReconciler {
  constructor(
    private readonly store: OperationStateStore,
    private readonly probe: ReconciliationProbe,
  ) {}

  async reconcile(idempotencyKey: string): Promise<OperationState> {
    const state = await this.store.find(idempotencyKey);
    if (!state) throw new Error('Operation state not found.');
    const result = await this.probe.inspect(state);
    const status = result === 'confirmed' ? 'CONFIRMED' : result === 'absent' ? 'COMPENSATED' : 'AMBIGUOUS';
    const updated = { ...state, status, updatedAt: new Date().toISOString() } satisfies OperationState;
    await this.store.save(updated);
    return updated;
  }
}
