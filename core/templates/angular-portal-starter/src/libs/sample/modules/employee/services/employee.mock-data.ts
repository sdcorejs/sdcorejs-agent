import { v4 as uuidv4 } from 'uuid';

import { EmployeeDTO } from './employee.model';

export const EMPLOYEE_SEED_DATA: EmployeeDTO[] = Array.from({ length: 100 }, (_, i) => {
  const index = i + 1;
  const role = index % 5 === 0 ? 'MANAGER' : 'EMPLOYEE';
  const isActivated = index % 7 !== 0;
  const created = new Date(2025, (index - 1) % 12, ((index - 1) % 28) + 1).toISOString();

  return {
    id: uuidv4(),
    code: `EMP${String(index).padStart(4, '0')}`,
    name: `Employee ${index}`,
    salary: 1000 + index * 25,
    birthday: new Date(1990 + (index % 10), index % 12, ((index - 1) % 28) + 1).toISOString(),
    role,
    isActivated,
    note: `Mock employee record ${index}`,
    createdAt: created,
    updatedAt: created,
    createdBy: 'seed',
    updatedBy: 'seed',
  };
});
