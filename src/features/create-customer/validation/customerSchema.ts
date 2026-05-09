import { z } from 'zod';

export const customerSchema = z.object({
  fullName: z.string().min(2, "Kamida 2 ta harf").max(150),
  phone: z
    .string()
    .regex(/^\+?[0-9\s\-()\s]{7,20}$/, "Noto'g'ri telefon raqami")
    .optional()
    .or(z.literal('')),
  address: z.string().max(300).optional().or(z.literal('')),
  isActive: z.boolean().optional(),
});

export type CustomerFormValues = z.infer<typeof customerSchema>;
