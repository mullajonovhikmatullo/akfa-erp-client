import { Controller, type UseFormReturn } from 'react-hook-form'
import { Alert, Button } from 'antd'

import type { PasswordFormValues } from '../profileSchemas'
import { MaskedInput } from './MaskedInput'
import { PasswordStrength } from './PasswordStrength'
import { ProfileField } from './ProfileField'

interface ProfileSecuritySectionProps {
  t: (key: string) => string
  pending: boolean
  form: UseFormReturn<PasswordFormValues>
  onSubmit: (values: PasswordFormValues) => void
}

export function ProfileSecuritySection({
  t,
  pending,
  form,
  onSubmit,
}: ProfileSecuritySectionProps) {
  //
  return (
    <section className="profile-section" aria-labelledby="profile-security-title">
      <div className="profile-section__head">
        <div className="profile-section__icon profile-section__icon--security">
          <i className="icons-lock icon-size-19" />
        </div>
        <div className="profile-section__heading">
          <h2 id="profile-security-title">{t('profile.changePassword')}</h2>
          <span>{t('profile.passwordHint')}</span>
        </div>
      </div>

      <Alert
        type="info"
        icon={<i className="icons-user_check icon-size-18" />}
        showIcon
        message={t('profile.passwordHint')}
        className="profile-security-alert"
      />

      <form onSubmit={form.handleSubmit(onSubmit)} autoComplete="off">
        <div className="profile-password-grid">
          <ProfileField
            label={t('profile.currentPassword')}
            error={form.formState.errors.currentPassword?.message}
            required
          >
            <Controller
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <MaskedInput
                  {...field}
                  inputName="store-profile-current-password"
                  placeholder={t('profile.currentPasswordPlaceholder')}
                  status={form.formState.errors.currentPassword ? 'error' : undefined}
                />
              )}
            />
          </ProfileField>

          <div className="profile-password-pair">
            <ProfileField
              label={t('profile.newPassword')}
              error={form.formState.errors.newPassword?.message}
              required
            >
              <Controller
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <MaskedInput
                    {...field}
                    inputName="store-profile-new-password"
                    placeholder={t('profile.newPasswordPlaceholder')}
                    status={form.formState.errors.newPassword ? 'error' : undefined}
                  />
                )}
              />
            </ProfileField>

            <ProfileField
              label={t('profile.confirmPassword')}
              error={form.formState.errors.confirmPassword?.message}
              required
            >
              <Controller
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <MaskedInput
                    {...field}
                    inputName="store-profile-confirm-password"
                    placeholder={t('profile.confirmPasswordPlaceholder')}
                    status={form.formState.errors.confirmPassword ? 'error' : undefined}
                  />
                )}
              />
            </ProfileField>
          </div>

          <PasswordStrength password={form.watch('newPassword') ?? ''} t={t} />
          <div>
            <Button
              type="primary"
              htmlType="submit"
              icon={<i className="icons-lock icon-size-18" />}
              loading={pending}
            >
              {t('profile.changePasswordBtn')}
            </Button>
          </div>
        </div>
      </form>
    </section>
  )
}
