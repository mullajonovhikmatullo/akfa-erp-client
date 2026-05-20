import { z } from 'zod';

export const createCustomerSchema = (t: (k: string) => string) =>
  z.object({
    fullName: z.string().min(2, t('validation.fullNameMin')).max(150),
    phone: z
      .string()
      .regex(/^\+?[0-9\s\-()\s]{7,20}$/, t('validation.phoneInvalid'))
      .optional()
      .or(z.literal('')),
    address: z.string().max(300).optional().or(z.literal('')),
    balance: z.number().min(0).optional(),
    isActive: z.boolean().optional(),
    branchId: z.string().uuid().optional(),
  });

export type CustomerFormValues = z.infer<ReturnType<typeof createCustomerSchema>>;
