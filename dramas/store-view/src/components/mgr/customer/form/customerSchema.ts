import { z } from 'zod'

export const createCustomerSchema = (t: (key: string) => string) =>
  z.object({
    fullName: z.string().min(2, t('validation.fullNameMin')).max(150),
    phone: z
      .string()
      .min(1, t('validation.phoneInvalid'))
      .regex(/^\+?[0-9\s\-()\s]{7,20}$/, t('validation.phoneInvalid'))
      .max(20),
    address: z.string().max(300).optional().or(z.literal('')),
    balance: z.number().min(0).optional(),
    balanceType: z.enum(['credit', 'debt']).optional(),
    isActive: z.boolean().optional(),
    branchId: z.string().uuid().optional(),
  })

export type CustomerFormValues = z.infer<ReturnType<typeof createCustomerSchema>>
