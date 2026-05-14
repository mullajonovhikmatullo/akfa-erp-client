import { z } from 'zod';

export const customerSchema = z.object({
  fullName: z.string().min(2, 'Камида 2 та ҳарф').max(150),
  phone: z
    .string()
    .regex(/^\+?[0-9\s\-()\s]{7,20}$/, 'Нотўғри телефон рақами')
    .optional()
    .or(z.literal('')),
  address: z.string().max(300).optional().or(z.literal('')),
  isActive: z.boolean().optional(),
  branchId: z.string().uuid().optional(),
});

export type CustomerFormValues = z.infer<typeof customerSchema>;
