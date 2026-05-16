import { v4 as uuidv4 } from 'uuid';

import { DepartmentDTO } from './department.model';

export const DEPARTMENT_SEED_DATA: DepartmentDTO[] = Array.from({ length: 100 }, (_, i) => {
  const index = i + 1;
  const isActivated = index % 8 !== 0;
  const created = new Date(2025, (index - 1) % 12, ((index - 1) % 28) + 1).toISOString();

  return {
    id: uuidv4(),
    code: `DPT${String(index).padStart(4, '0')}`,
    name: `Department ${index}`,
    description: `Mock department record ${index}`,
    isActivated,
    createdAt: created,
    updatedAt: created,
    createdBy: 'seed',
    updatedBy: 'seed',
  };
});
