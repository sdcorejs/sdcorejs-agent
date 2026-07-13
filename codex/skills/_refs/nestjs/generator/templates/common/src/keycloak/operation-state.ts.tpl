export type OperationStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'AMBIGUOUS'
  | 'COMPENSATED'
  | 'FAILED';

export interface OperationState {
  idempotencyKey: string;
  status: OperationStatus;
  step: string;
  externalReference?: string;
  updatedAt: string;
}
export interface OperationStateStore {
  find(idempotencyKey: string): Promise<OperationState | undefined>;
  save(state: OperationState): Promise<void>;
}
