import { z } from 'zod';

export const createLoginSchema = (t: (k: string) => string) =>
  z.object({
    username: z
      .string()
      .min(1, t('validation.usernameRequired'))
      .min(2, t('validation.usernameMin'))
      .max(64, t('validation.usernameMax')),
    password: z
      .string()
      .min(1, t('validation.passwordRequired'))
      .min(6, t('validation.passwordMin')),
  });

export type LoginFormValues = z.infer<ReturnType<typeof createLoginSchema>>;
