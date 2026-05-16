import { z } from 'zod';

export const createExpenseSchema = (t: (k: string) => string) =>
  z.object({
    categoryId: z.string().uuid(t('validation.categorySelect')),
    amount: z
      .number({ error: t('validation.amountInvalidType') })
      .positive(t('validation.amountPositive')),
    description: z.string().max(500).optional().or(z.literal('')),
    expenseDate: z.string().optional(),
  });

export type ExpenseFormValues = z.infer<ReturnType<typeof createExpenseSchema>>;
