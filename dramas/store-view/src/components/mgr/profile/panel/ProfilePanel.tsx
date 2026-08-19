import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Alert, Button, Divider, Image, Input, Popconfirm } from 'antd'
import {
  CheckIcon,
  LockIcon,
  PencilSimpleIcon,
  TrashIcon,
  UploadSimpleIcon,
  ShieldCheckIcon,
  UserCircleIcon,
  XIcon,
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { blockAutofill } from '@store/store-shared/lib/autofill'
import { getLocalizedApiErrorMessage } from '@store/store-shared/lib/api-error'
import type { User } from '@store/store-stub'
import {
  useChangePassword,
  useDeleteProfilePhoto,
  useUpdateProfile,
  useUpdateProfilePhoto,
} from '../../admins/hooks/useAdminUsers'
import { MaskedInput } from '../shared/MaskedInput'
import { PasswordStrength } from '../shared/PasswordStrength'
import { ProfileField } from '../shared/ProfileField'

type Translate = (key: string) => string

const PROFILE_PHOTO_MAX_BYTES = 5 * 1024 * 1024
const PROFILE_PHOTO_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('Invalid file result'))
    reader.onerror = () => reject(reader.error ?? new Error('Could not read file'))
    reader.readAsDataURL(file)
  })
}

export interface ProfilePanelProps {
  t: Translate
  user?: User | null
  onUserUpdated?: (user: User) => void
}

export function ProfilePanel({ t, user, onUserUpdated }: ProfilePanelProps) {
  //
  const [profileEditing, setProfileEditing] = useState(false)
  const photoInputRef = useRef<HTMLInputElement>(null)
  const updateProfile = useUpdateProfile(onUserUpdated)
  const updateProfilePhoto = useUpdateProfilePhoto(onUserUpdated)
  const deleteProfilePhoto = useDeleteProfilePhoto(onUserUpdated)
  const changePassword = useChangePassword()

  const profileSchema = z.object({
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

  const passwordSchema = z
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
    const hasProfileErrors = Object.keys(profileForm.formState.errors).length > 0
    const hasPasswordErrors = Object.keys(passwordForm.formState.errors).length > 0

    if (hasProfileErrors) void profileForm.trigger()
    if (hasPasswordErrors) void passwordForm.trigger()
  }, [t, profileForm.trigger, passwordForm.trigger])

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
        toast.error(t('profile.updateError'))
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
          toast.error(t('profile.passwordError'))
        }
      },
    })
  }

  async function handlePhotoSelected(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget
    const file = input.files?.[0]
    input.value = ''
    if (!file) return

    if (!PROFILE_PHOTO_TYPES.has(file.type)) {
      toast.error(t('profile.photoInvalidType'))
      return
    }
    if (file.size > PROFILE_PHOTO_MAX_BYTES) {
      toast.error(t('profile.photoTooLarge'))
      return
    }

    try {
      const base64Photo = await readFileAsDataUrl(file)
      updateProfilePhoto.mutate(
        { base64Photo },
        {
          onSuccess: () => toast.success(t('profile.photoUpdateSuccess')),
          onError: (error: unknown) =>
            toast.error(getLocalizedApiErrorMessage(error, t, 'profile.photoUpdateError')),
        },
      )
    } catch {
      toast.error(t('profile.photoReadError'))
    }
  }

  function handlePhotoDelete() {
    deleteProfilePhoto.mutate(undefined, {
      onSuccess: () => toast.success(t('profile.photoRemoveSuccess')),
      onError: (error: unknown) =>
        toast.error(getLocalizedApiErrorMessage(error, t, 'profile.photoRemoveError')),
    })
  }

  const initials = (user?.name ?? '?')
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()

  const roleLabel = user?.role === 'store_owner' ? t('role.store_owner') : t('role.branch_admin')

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      <div className="page-head">
        <div>
          <h1>{t('profile.title')}</h1>
          <div className="sub">{t('profile.subtitle')}</div>
        </div>
      </div>

      <div className="card" style={{ padding: 18, marginBottom: 16 }}>
        <div className="profile-photo-row">
          <div className="profile-photo-avatar">
            {user?.base64Photo ? (
              <Image
                src={user.thumbnailPhoto ?? user.base64Photo}
                alt={user.name}
                width={88}
                height={88}
                preview={{
                  src: user.base64Photo,
                  mask: t('profile.photoPreview'),
                }}
              />
            ) : (
              <span className="profile-photo-initials">{initials}</span>
            )}
          </div>
          <div className="profile-photo-content">
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)' }}>{user?.name}</div>
            <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 2 }}>
              @{user?.username} · {roleLabel}
            </div>
            <div className="profile-photo-actions">
              <input
                ref={photoInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                hidden
                onChange={handlePhotoSelected}
              />
              <Button
                size="small"
                icon={<UploadSimpleIcon size={16} />}
                loading={updateProfilePhoto.isPending}
                disabled={deleteProfilePhoto.isPending}
                onClick={() => photoInputRef.current?.click()}
              >
                {user?.base64Photo ? t('profile.photoChange') : t('profile.photoUpload')}
              </Button>
              {user?.base64Photo ? (
                <Popconfirm
                  title={t('profile.photoRemoveConfirm')}
                  okText={t('profile.photoRemove')}
                  cancelText={t('common.cancel')}
                  okButtonProps={{ danger: true, loading: deleteProfilePhoto.isPending }}
                  onConfirm={handlePhotoDelete}
                >
                  <Button
                    size="small"
                    danger
                    icon={<TrashIcon size={16} />}
                    disabled={updateProfilePhoto.isPending}
                  >
                    {t('profile.photoRemove')}
                  </Button>
                </Popconfirm>
              ) : null}
            </div>
            <div className="profile-photo-hint">{t('profile.photoHint')}</div>
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <ProfileField label={t('profile.fullName')} error={profileForm.formState.errors.fullName?.message}>
              <Controller
                control={profileForm.control}
                name="fullName"
                render={({ field }) => (
                  <Input
                    {...field}
                    {...blockAutofill('store-profile-full-name')}
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
                    {...blockAutofill('store-profile-username')}
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

      <div className="card" style={{ padding: 18 }}>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <ProfileField label={t('profile.currentPassword')} error={passwordForm.formState.errors.currentPassword?.message} required>
              <Controller
                control={passwordForm.control}
                name="currentPassword"
                render={({ field }) => (
                  <MaskedInput
                    {...field}
                    inputName="store-profile-current-password"
                    placeholder={t('profile.currentPasswordPlaceholder')}
                    status={passwordForm.formState.errors.currentPassword ? 'error' : undefined}
                  />
                )}
              />
            </ProfileField>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <ProfileField label={t('profile.newPassword')} error={passwordForm.formState.errors.newPassword?.message} required>
                <Controller
                  control={passwordForm.control}
                  name="newPassword"
                  render={({ field }) => (
                    <MaskedInput
                      {...field}
                      inputName="store-profile-new-password"
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
                      inputName="store-profile-confirm-password"
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
