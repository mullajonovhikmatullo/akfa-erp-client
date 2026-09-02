import { Controller, type UseFormReturn } from 'react-hook-form'
import { Button, Input } from 'antd'

import { blockAutofill } from '@store/store-shared/lib/autofill'
import type { ProfileFormValues } from '../profileSchemas'
import { ProfileField } from './ProfileField'

interface ProfileInformationSectionProps {
  t: (key: string) => string
  username?: string
  editing: boolean
  pending: boolean
  form: UseFormReturn<ProfileFormValues>
  onEdit: () => void
  onCancel: () => void
  onSubmit: (values: ProfileFormValues) => void
}

export function ProfileInformationSection({
  t,
  username,
  editing,
  pending,
  form,
  onEdit,
  onCancel,
  onSubmit,
}: ProfileInformationSectionProps) {
  //
  return (
    <section className="profile-section" aria-labelledby="profile-basic-title">
      <div className="profile-section__head">
        <div className="profile-section__icon profile-section__icon--identity">
          <i className="icons-user-circle icon-size-20" />
        </div>
        <div className="profile-section__heading">
          <h2 id="profile-basic-title">{t('profile.basicInfo')}</h2>
          <span>@{username}</span>
        </div>
        {!editing ? (
          <Button icon={<i className="icons-pen-line icon-size-16" />} onClick={onEdit}>
            {t('profile.edit')}
          </Button>
        ) : null}
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} autoComplete="off">
        <div className="profile-form-grid">
          <ProfileField label={t('profile.fullName')} error={form.formState.errors.fullName?.message}>
            <Controller
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <Input
                  {...field}
                  {...blockAutofill('store-profile-full-name')}
                  disabled={!editing}
                  placeholder={t('profile.fullNamePlaceholder')}
                  status={form.formState.errors.fullName ? 'error' : undefined}
                />
              )}
            />
          </ProfileField>

          <ProfileField label={t('profile.username')} error={form.formState.errors.username?.message}>
            <Controller
              control={form.control}
              name="username"
              render={({ field }) => (
                <Input
                  {...field}
                  {...blockAutofill('store-profile-username')}
                  disabled={!editing}
                  placeholder={t('profile.usernamePlaceholder')}
                  prefix={<span className="profile-input-prefix">@</span>}
                  status={form.formState.errors.username ? 'error' : undefined}
                />
              )}
            />
          </ProfileField>
        </div>

        {editing ? (
          <div className="profile-form-actions">
            <Button
              type="primary"
              htmlType="submit"
              icon={<i className="icons-check icon-size-18" />}
              loading={pending}
            >
              {t('profile.save')}
            </Button>
            <Button icon={<i className="icons-close icon-size-18" />} onClick={onCancel} disabled={pending}>
              {t('profile.cancel')}
            </Button>
          </div>
        ) : null}
      </form>
    </section>
  )
}
