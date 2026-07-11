import { z } from 'zod';

export const ItemApproveSchema = z.object({
  expectedVersion: z.number().int().positive(),
}).strict();

export type ItemApproveRequest = z.infer<typeof ItemApproveSchema>;

export const ItemImportSchema = z.object({
  idempotencyKey: z.string().trim().min(8).max(120),
  rows: z.array(z.object({ name: z.string().max(120) }).strict()).max(1000),
}).strict();

export type ItemImportRequest = z.infer<typeof ItemImportSchema>;
