import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Alert, Button, Divider, Input } from 'antd'
import {
  CheckIcon,
  LockIcon,
  PencilSimpleIcon,
  ShieldCheckIcon,
  UserCircleIcon,
  XIcon,
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { blockAutofill } from '@erp/erp-shared/lib/autofill'
import type { User } from '@erp/store-buddy-stub'
import { useChangePassword, useUpdateProfile } from '../../admins/hooks/useAdminUsers'
import { MaskedInput } from '../shared/MaskedInput'
import { PasswordStrength } from '../shared/PasswordStrength'
import { ProfileField } from '../shared/ProfileField'

type Translate = (key: string) => string

export interface ProfilePanelProps {
  t: Translate
  user?: User | null
  onUserUpdated?: (user: User) => void
}

export function ProfilePanel({ t, user, onUserUpdated }: ProfilePanelProps) {
  //
  const [profileEditing, setProfileEditing] = useState(false)
  const updateProfile = useUpdateProfile(onUserUpdated)
  const changePassword = useChangePassword()

  const profileSchema = z.object({
    fullName: z.string().min(2, t('pwd.minLen')).max(100),
    username: z
      .string()
      .min(3)
      .max(50)
      .regex(/^[a-zA-Z0-9_]+$/),
  })

  const passwordSchema = z
    .object({
      currentPassword: z.string().min(1),
      newPassword: z.string().min(6).max(100),
      confirmPassword: z.string().min(1),
    })
    .refine((value) => value.newPassword === value.confirmPassword, {
      message: t('profile.passwordMismatch'),
      path: ['confirmPassword'],
    })

  type ProfileFormValues = z.infer<typeof profileSchema>
  type PasswordFormValues = z.infer<typeof passwordSchema>

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.name ?? '',
      username: user?.username ?? '',
    },
  })

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  })

  useEffect(() => {
    //
    if (!profileEditing) {
      profileForm.reset({ fullName: user?.name ?? '', username: user?.username ?? '' })
    }
  }, [profileEditing, profileForm, user?.name, user?.username])

  function startEditing() {
    //
    profileForm.reset({ fullName: user?.name ?? '', username: user?.username ?? '' })
    setProfileEditing(true)
  }

  function cancelEditing() {
    //
    profileForm.reset({ fullName: user?.name ?? '', username: user?.username ?? '' })
    setProfileEditing(false)
  }

  async function handleProfileSave(values: ProfileFormValues) {
    //
    const changed: Record<string, string> = {}
    if (values.fullName !== user?.name) changed.fullName = values.fullName
    if (values.username !== user?.username) changed.username = values.username

    if (Object.keys(changed).length === 0) {
      setProfileEditing(false)
      return
    }

    updateProfile.mutate(changed, {
      onSuccess: () => {
        //
        toast.success(t('profile.updateSuccess'))
        setProfileEditing(false)
      },
      onError: (error: unknown) => {
        //
        const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message
        toast.error(message ?? t('profile.updateError'))
      },
    })
  }

  async function handlePasswordSave(values: PasswordFormValues) {
    //
    changePassword.mutate(values, {
      onSuccess: () => {
        //
        toast.success(t('profile.passwordSuccess'))
        passwordForm.reset()
      },
      onError: (error: unknown) => {
        //
        const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message
        if (message?.includes("noto'g'ri") || message?.toLowerCase().includes('incorrect')) {
          passwordForm.setError('currentPassword', { message: t('profile.passwordWrong') })
        } else {
          toast.error(message ?? t('profile.passwordError'))
        }
      },
    })
  }

  const initials = (user?.name ?? '?')
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()

  const roleLabel = user?.role === 'super_admin' ? t('role.super_admin') : t('role.branch_admin')

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      <div className="page-head">
        <div>
          <h1>{t('profile.title')}</h1>
          <div className="sub">{t('profile.subtitle')}</div>
        </div>
      </div>

      <div className="card" style={{ padding: 24, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #1e4dd8, #1e4dd8cc)',
              color: '#fff',
              fontSize: 24,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {initials}
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--ink)' }}>{user?.name}</div>
            <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 2 }}>
              @{user?.username} · {roleLabel}
            </div>
          </div>
        </div>

        <Divider style={{ margin: '0 0 20px' }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <UserCircleIcon size={18} color="currentColor" style={{ color: 'var(--ink-3)' }} />
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{t('profile.basicInfo')}</span>
          </div>
          {!profileEditing && (
            <Button size="small" icon={<PencilSimpleIcon size={16} />} onClick={startEditing}>
              {t('profile.edit')}
            </Button>
          )}
        </div>

        <form onSubmit={profileForm.handleSubmit(handleProfileSave)} autoComplete="off">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <ProfileField label={t('profile.fullName')} error={profileForm.formState.errors.fullName?.message}>
              <Controller
                control={profileForm.control}
                name="fullName"
                render={({ field }) => (
                  <Input
                    {...field}
                    {...blockAutofill('akfa-profile-full-name')}
                    disabled={!profileEditing}
                    placeholder={t('profile.fullNamePlaceholder')}
                    size="middle"
                    status={profileForm.formState.errors.fullName ? 'error' : undefined}
                  />
                )}
              />
            </ProfileField>

            <ProfileField label={t('profile.username')} error={profileForm.formState.errors.username?.message}>
              <Controller
                control={profileForm.control}
                name="username"
                render={({ field }) => (
                  <Input
                    {...field}
                    {...blockAutofill('akfa-profile-username')}
                    disabled={!profileEditing}
                    placeholder={t('profile.usernamePlaceholder')}
                    prefix={<span style={{ color: 'var(--ink-4)' }}>@</span>}
                    size="middle"
                    status={profileForm.formState.errors.username ? 'error' : undefined}
                  />
                )}
              />
            </ProfileField>
          </div>

          {profileEditing && (
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <Button type="primary" htmlType="submit" icon={<CheckIcon size={18} weight="bold" />} loading={updateProfile.isPending}>
                {t('profile.save')}
              </Button>
              <Button icon={<XIcon size={18} />} onClick={cancelEditing} disabled={updateProfile.isPending}>
                {t('profile.cancel')}
              </Button>
            </div>
          )}
        </form>
      </div>

      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <LockIcon size={18} color="currentColor" style={{ color: 'var(--ink-3)' }} />
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{t('profile.changePassword')}</span>
        </div>

        <Alert
          type="info"
          icon={<ShieldCheckIcon size={18} weight="duotone" />}
          showIcon
          message={t('profile.passwordHint')}
          style={{ marginBottom: 20, borderRadius: 8 }}
        />

        <form onSubmit={passwordForm.handleSubmit(handlePasswordSave)} autoComplete="off">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <ProfileField label={t('profile.currentPassword')} error={passwordForm.formState.errors.currentPassword?.message} required>
              <Controller
                control={passwordForm.control}
                name="currentPassword"
                render={({ field }) => (
                  <MaskedInput
                    {...field}
                    inputName="akfa-profile-current-password"
                    placeholder={t('profile.currentPasswordPlaceholder')}
                    status={passwordForm.formState.errors.currentPassword ? 'error' : undefined}
                  />
                )}
              />
            </ProfileField>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <ProfileField label={t('profile.newPassword')} error={passwordForm.formState.errors.newPassword?.message} required>
                <Controller
                  control={passwordForm.control}
                  name="newPassword"
                  render={({ field }) => (
                    <MaskedInput
                      {...field}
                      inputName="akfa-profile-new-password"
                      placeholder={t('profile.newPasswordPlaceholder')}
                      status={passwordForm.formState.errors.newPassword ? 'error' : undefined}
                    />
                  )}
                />
              </ProfileField>

              <ProfileField label={t('profile.confirmPassword')} error={passwordForm.formState.errors.confirmPassword?.message} required>
                <Controller
                  control={passwordForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <MaskedInput
                      {...field}
                      inputName="akfa-profile-confirm-password"
                      placeholder={t('profile.confirmPasswordPlaceholder')}
                      status={passwordForm.formState.errors.confirmPassword ? 'error' : undefined}
                    />
                  )}
                />
              </ProfileField>
            </div>

            <PasswordStrength password={passwordForm.watch('newPassword') ?? ''} t={t} />

            <div>
              <Button type="primary" htmlType="submit" icon={<LockIcon size={18} weight="bold" />} loading={changePassword.isPending} danger>
                {t('profile.changePasswordBtn')}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
