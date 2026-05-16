import { v4 as uuidv4 } from 'uuid';

import { ProductDTO } from './product.model';

export const PRODUCT_SEED_DATA: ProductDTO[] = Array.from({ length: 100 }, (_, i) => {
  const index = i + 1;
  const isActivated = index % 6 !== 0;
  const created = new Date(2025, (index - 1) % 12, ((index - 1) % 28) + 1).toISOString();

  return {
    id: uuidv4(),
    code: `PRD${String(index).padStart(4, '0')}`,
    name: `Product ${index}`,
    price: 50 + index * 3,
    isActivated,
    note: `Mock product record ${index}`,
    createdAt: created,
    updatedAt: created,
    createdBy: 'seed',
    updatedBy: 'seed',
  };
});
