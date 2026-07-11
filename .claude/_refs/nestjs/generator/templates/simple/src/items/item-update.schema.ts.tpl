import { z } from 'zod';

export const ItemUpdateSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  expectedVersion: z.number().int().positive(),
}).strict();

export type ItemUpdateRequest = z.infer<typeof ItemUpdateSchema>;
