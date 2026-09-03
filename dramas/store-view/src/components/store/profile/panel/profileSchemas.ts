import type { StoreTranslator } from '@store/store-i18n'
import { z } from 'zod'

type Translate = StoreTranslator

export function createProfileSchema(t: Translate) {
  //
  return z.object({
    fullName: z
      .string()
      .trim()
      .min(2, t('profile.validation.fullNameMin'))
      .max(100, t('profile.validation.fullNameMax')),
    username: z
      .string()
      .trim()
      .min(3, t('profile.validation.usernameMin'))
      .max(50, t('profile.validation.usernameMax'))
      .regex(/^[a-zA-Z0-9_]+$/, t('profile.validation.usernameFormat')),
  })
}

export function createPasswordSchema(t: Translate) {
  //
  return z
    .object({
      currentPassword: z.string().min(1, t('profile.validation.currentPasswordRequired')),
      newPassword: z
        .string()
        .min(6, t('profile.validation.newPasswordMin'))
        .max(100, t('profile.validation.newPasswordMax')),
      confirmPassword: z.string().min(1, t('profile.validation.confirmPasswordRequired')),
    })
    .refine((value) => value.newPassword === value.confirmPassword, {
      message: t('profile.passwordMismatch'),
      path: ['confirmPassword'],
    })
}

export type ProfileFormValues = z.infer<ReturnType<typeof createProfileSchema>>
export type PasswordFormValues = z.infer<ReturnType<typeof createPasswordSchema>>
