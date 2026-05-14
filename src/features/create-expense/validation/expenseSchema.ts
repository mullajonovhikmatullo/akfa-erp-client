import { z } from 'zod';

export const expenseSchema = z.object({
  categoryId: z.string().uuid('Категория танланг'),
  amount: z.number({ invalid_type_error: 'Миқдор киритинг' }).positive('0 дан катта бўлиши керак'),
  description: z.string().max(500).optional().or(z.literal('')),
  expenseDate: z.string().optional(),
});

export type ExpenseFormValues = z.infer<typeof expenseSchema>;
