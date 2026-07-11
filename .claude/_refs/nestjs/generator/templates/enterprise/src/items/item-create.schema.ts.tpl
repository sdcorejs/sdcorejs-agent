import { z } from 'zod';

export const ItemCreateSchema = z.object({
  name: z.string().trim().min(1).max(120),
}).strict();

export type ItemCreateRequest = z.infer<typeof ItemCreateSchema>;
