import { z } from 'zod';

export const expenseSchema = z.object({
  categoryId: z.string().uuid("Kategoriya tanlang"),
  amount: z.number({ invalid_type_error: "Miqdor kiriting" }).positive("0 dan katta bo'lishi kerak"),
  description: z.string().max(500).optional().or(z.literal('')),
  expenseDate: z.string().optional(),
});

export type ExpenseFormValues = z.infer<typeof expenseSchema>;
