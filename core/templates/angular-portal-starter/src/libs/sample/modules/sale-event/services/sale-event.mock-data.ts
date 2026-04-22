import { v4 as uuidv4 } from 'uuid';

import { SaleEventDTO } from './sale-event.model';

const SELL_TYPES = ['DIRECT', 'BOOKING'];
const APPROVAL_STATUSES = ['DRAFT', 'PENDING', 'APPROVED'];
const OPERATION_STATUSES = ['INACTIVE', 'ACTIVE'];

export const SALE_EVENT_SEED_DATA: SaleEventDTO[] = Array.from({ length: 100 }, (_, i) => {
  const index = i + 1;
  const created = new Date(2025, (index - 1) % 12, ((index - 1) % 28) + 1, 8, 0, 0).toISOString();
  const startDate = new Date(2026, (index - 1) % 12, ((index - 1) % 28) + 1, 9, 0, 0).toISOString();
  const endDate = new Date(2026, (index - 1) % 12, ((index - 1) % 28) + 8, 18, 0, 0).toISOString();

  return {
    id: uuidv4(),
    code: `SE${String(index).padStart(4, '0')}`,
    name: `Sale Event ${index}`,
    projectName: `Project ${((index - 1) % 12) + 1}`,
    sellType: SELL_TYPES[index % SELL_TYPES.length],
    expectedStartDate: startDate,
    expectedEndDate: endDate,
    approvalStatus: APPROVAL_STATUSES[index % APPROVAL_STATUSES.length],
    operationStatus: OPERATION_STATUSES[index % OPERATION_STATUSES.length],
    inventoryPoolCount: (index % 8) + 1,
    description: `Mock sale event description ${index}`,
    note: `Mock note ${index}`,
    createdAt: created,
    updatedAt: created,
    createdBy: 'seed',
    updatedBy: 'seed',
  };
});
