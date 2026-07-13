import { z } from 'zod';

export const createExpenseSchema = (t: (k: string) => string) =>
  z.object({
    categoryId: z.string().uuid(t('validation.categorySelect')),
    currency: z.enum(['UZS', 'USD']),
    amount: z
      .number({ error: t('validation.amountInvalidType') })
      .positive(t('validation.amountPositive')),
    usdToUzsRate: z.number().positive(t('validation.amountPositive')).optional(),
    description: z.string().max(500).optional().or(z.literal('')),
    expenseDate: z.string().optional(),
  })
    .refine((v) => v.currency === 'USD' || Number.isInteger(v.amount), {
      message: t('validation.amountInteger'),
      path: ['amount'],
    })
    .refine((v) => v.currency === 'UZS' || v.usdToUzsRate !== undefined, {
      message: t('validation.exchangeRateRequired'),
      path: ['usdToUzsRate'],
    });

export type ExpenseFormValues = z.infer<ReturnType<typeof createExpenseSchema>>;
