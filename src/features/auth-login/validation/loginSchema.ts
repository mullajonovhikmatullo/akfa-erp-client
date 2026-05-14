import { z } from 'zod';

export const loginSchema = z.object({
  username: z
    .string()
    .min(1, 'Фойдаланувчи номини киритинг')
    .min(2, 'Камида 2 та белги')
    .max(64, 'Фойдаланувчи номи жуда узун'),
  password: z
    .string()
    .min(1, 'Паролни киритинг')
    .min(6, 'Камида 6 та белги'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
