import type { StoreTranslator } from '@store/store-i18n'
import { z } from 'zod'
import { isValidUzbekMobilePhone } from '@store/store-shared'

export const createCustomerSchema = (t: StoreTranslator) =>
  z.object({
    fullName: z.string().min(2, t('validation.fullNameMin')).max(150),
    phone: z
      .string()
      .min(1, t('validation.phoneInvalid'))
      .refine(isValidUzbekMobilePhone, t('validation.phoneInvalid')),
    address: z.string().max(300).optional().or(z.literal('')),
    balance: z.number().min(0).optional(),
    balanceType: z.enum(['credit', 'debt']).optional(),
    isActive: z.boolean().optional(),
    branchId: z.string().uuid().optional(),
  })

export type CustomerFormValues = z.infer<ReturnType<typeof createCustomerSchema>>
