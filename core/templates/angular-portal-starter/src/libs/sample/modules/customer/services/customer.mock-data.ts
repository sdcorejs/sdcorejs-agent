import { v4 as uuidv4 } from 'uuid';

import { CustomerDTO } from './customer.model';

export const CUSTOMER_SEED_DATA: CustomerDTO[] = Array.from({ length: 100 }, (_, i) => {
  const index = i + 1;
  const isActivated = index % 9 !== 0;
  const created = new Date(2025, (index - 1) % 12, ((index - 1) % 28) + 1).toISOString();

  return {
    id: uuidv4(),
    code: `CUS${String(index).padStart(4, '0')}`,
    name: `Customer ${index}`,
    email: `customer${index}@sample.com`,
    phone: `090${String(index).padStart(7, '0')}`,
    address: `Address ${index}, Ho Chi Minh City`,
    note: `Mock customer record ${index}`,
    isActivated,
    createdAt: created,
    updatedAt: created,
    createdBy: 'seed',
    updatedBy: 'seed',
  };
});
