import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Alert, Button, Image, Input, Modal, Popconfirm, Slider } from 'antd'
import {
  ArrowClockwiseIcon,
  CheckIcon,
  ImageSquareIcon,
  LockIcon,
  PencilSimpleIcon,
  ShieldCheckIcon,
  TrashIcon,
  UploadSimpleIcon,
  UserCircleIcon,
  XIcon,
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { blockAutofill } from '@store/store-shared/lib/autofill'
import { getLocalizedApiErrorMessage } from '@store/store-shared'
import type { User } from '@store/store-stub'
import { useUserMutation } from '../../admins/hooks/useUserMutation'
import { prepareProfilePhoto } from '../lib/profile-photo'
import { MaskedInput } from './view/MaskedInput'
import { PasswordStrength } from './view/PasswordStrength'
import { ProfileField } from './view/ProfileField'

type Translate = (key: string) => string

const PROFILE_PHOTO_MAX_BYTES = 5 * 1024 * 1024
const PROFILE_PHOTO_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

interface PendingPhoto {
  file: File
  url: string
}

type UserWithPhoto = User & { base64Photo?: string | null }

export interface ProfilePanelProps {
  t: Translate
  user?: User | null
  onUserUpdated?: (user: User) => void
}

export function ProfilePanel({ t, user, onUserUpdated }: ProfilePanelProps) {
  //
  const viewUser = user as UserWithPhoto | null | undefined
  const [profileEditing, setProfileEditing] = useState(false)
  const [pendingPhoto, setPendingPhoto] = useState<PendingPhoto | null>(null)
  const [photoZoom, setPhotoZoom] = useState(1)
  const [photoRotation, setPhotoRotation] = useState(0)
  const [photoProcessing, setPhotoProcessing] = useState(false)
  const photoInputRef = useRef<HTMLInputElement>(null)
  const { updateProfile, updateProfilePhoto, deleteProfilePhoto, changePassword } = useUserMutation({ onUpdated: onUserUpdated })

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
    if (!profileEditing) {
      profileForm.reset({ fullName: user?.name ?? '', username: user?.username ?? '' })
    }
  }, [profileEditing, profileForm, user?.name, user?.username])

  useEffect(() => {
    return () => {
      if (pendingPhoto) URL.revokeObjectURL(pendingPhoto.url)
    }
  }, [pendingPhoto])

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

  function closePhotoEditor() {
    //
    if (photoProcessing || updateProfilePhoto.isPending) return
    setPendingPhoto(null)
    setPhotoZoom(1)
    setPhotoRotation(0)
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
        toast.success(t('profile.updateSuccess'))
        setProfileEditing(false)
      },
      onError: (error: unknown) =>
        toast.error(getLocalizedApiErrorMessage(error, t, 'profile.updateError')),
    })
  }

  function handlePasswordSave(values: PasswordFormValues) {
    //
    changePassword.mutate(values, {
      onSuccess: () => {
        toast.success(t('profile.passwordSuccess'))
        passwordForm.reset()
      },
      onError: (error: unknown) => {
        const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message
        if (message?.includes("noto'g'ri") || message?.toLowerCase().includes('incorrect')) {
          passwordForm.setError('currentPassword', { message: t('profile.passwordWrong') })
        } else {
          toast.error(getLocalizedApiErrorMessage(error, t, 'profile.passwordError'))
        }
      },
    })
  }

  function handlePhotoSelected(event: ChangeEvent<HTMLInputElement>) {
    //
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

    setPhotoZoom(1)
    setPhotoRotation(0)
    setPendingPhoto({ file, url: URL.createObjectURL(file) })
  }

  async function handlePhotoApply() {
    //
    if (!pendingPhoto) return
    setPhotoProcessing(true)
    try {
      const prepared = await prepareProfilePhoto(pendingPhoto.file, {
        zoom: photoZoom,
        rotation: photoRotation,
      })
      await updateProfilePhoto.mutateAsync(prepared)
      toast.success(t('profile.photoUpdateSuccess'))
      setPendingPhoto(null)
      setPhotoZoom(1)
      setPhotoRotation(0)
    } catch (error) {
      toast.error(getLocalizedApiErrorMessage(error, t, 'profile.photoUpdateError'))
    } finally {
      setPhotoProcessing(false)
    }
  }

  function handlePhotoDelete() {
    //
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
  const photoBusy = photoProcessing || updateProfilePhoto.isPending || deleteProfilePhoto.isPending

  return (
    <div className="profile-page">
      <div className="page-head profile-page__head">
        <div>
          <h1>{t('profile.title')}</h1>
          <div className="sub">{t('profile.subtitle')}</div>
        </div>
      </div>

      <section className="profile-identity" aria-labelledby="profile-identity-name">
        <div className="profile-avatar-wrap">
          <div className="profile-avatar">
            {viewUser?.base64Photo ? (
              <Image
                src={viewUser.base64Photo}
                alt={viewUser.name}
                width={132}
                height={132}
                preview={{ src: viewUser.base64Photo, mask: t('profile.photoPreview') }}
              />
            ) : (
              <span className="profile-avatar__initials">{initials}</span>
            )}
          </div>
          <button
            type="button"
            className="profile-avatar__edit"
            aria-label={viewUser?.base64Photo ? t('profile.photoChange') : t('profile.photoUpload')}
            title={viewUser?.base64Photo ? t('profile.photoChange') : t('profile.photoUpload')}
            disabled={photoBusy}
            onClick={() => photoInputRef.current?.click()}
          >
            <PencilSimpleIcon size={17} weight="bold" />
          </button>
        </div>

        <div className="profile-identity__body">
          <div className="profile-identity__eyebrow">{roleLabel}</div>
          <h2 id="profile-identity-name">{user?.name}</h2>
          <div className="profile-identity__username">@{user?.username}</div>
          <div className="profile-photo-actions">
            <input
              ref={photoInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              hidden
              onChange={handlePhotoSelected}
            />
            <Button
              icon={<UploadSimpleIcon size={17} />}
              loading={photoProcessing || updateProfilePhoto.isPending}
              disabled={deleteProfilePhoto.isPending}
              onClick={() => photoInputRef.current?.click()}
            >
              {viewUser?.base64Photo ? t('profile.photoChange') : t('profile.photoUpload')}
            </Button>
            {viewUser?.base64Photo ? (
              <Popconfirm
                title={t('profile.photoRemoveConfirm')}
                okText={t('profile.photoRemove')}
                cancelText={t('common.cancel')}
                okButtonProps={{ danger: true, loading: deleteProfilePhoto.isPending }}
                onConfirm={handlePhotoDelete}
              >
                <Button
                  danger
                  icon={<TrashIcon size={17} />}
                  disabled={photoProcessing || updateProfilePhoto.isPending}
                >
                  {t('profile.photoRemove')}
                </Button>
              </Popconfirm>
            ) : null}
          </div>
          <div className="profile-photo-hint">{t('profile.photoHint')}</div>
        </div>
      </section>

      <div className="profile-grid">
        <section className="profile-section" aria-labelledby="profile-basic-title">
          <div className="profile-section__head">
            <div className="profile-section__icon profile-section__icon--identity">
              <UserCircleIcon size={20} weight="duotone" />
            </div>
            <div className="profile-section__heading">
              <h2 id="profile-basic-title">{t('profile.basicInfo')}</h2>
              <span>@{user?.username}</span>
            </div>
            {!profileEditing ? (
              <Button icon={<PencilSimpleIcon size={16} />} onClick={startEditing}>
                {t('profile.edit')}
              </Button>
            ) : null}
          </div>

          <form onSubmit={profileForm.handleSubmit(handleProfileSave)} autoComplete="off">
            <div className="profile-form-grid">
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
                      prefix={<span className="profile-input-prefix">@</span>}
                      status={profileForm.formState.errors.username ? 'error' : undefined}
                    />
                  )}
                />
              </ProfileField>
            </div>

            {profileEditing ? (
              <div className="profile-form-actions">
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<CheckIcon size={18} weight="bold" />}
                  loading={updateProfile.isPending}
                >
                  {t('profile.save')}
                </Button>
                <Button icon={<XIcon size={18} />} onClick={cancelEditing} disabled={updateProfile.isPending}>
                  {t('profile.cancel')}
                </Button>
              </div>
            ) : null}
          </form>
        </section>

        <section className="profile-section" aria-labelledby="profile-security-title">
          <div className="profile-section__head">
            <div className="profile-section__icon profile-section__icon--security">
              <LockIcon size={19} weight="duotone" />
            </div>
            <div className="profile-section__heading">
              <h2 id="profile-security-title">{t('profile.changePassword')}</h2>
              <span>{t('profile.passwordHint')}</span>
            </div>
          </div>

          <Alert
            type="info"
            icon={<ShieldCheckIcon size={18} weight="duotone" />}
            showIcon
            message={t('profile.passwordHint')}
            className="profile-security-alert"
          />

          <form onSubmit={passwordForm.handleSubmit(handlePasswordSave)} autoComplete="off">
            <div className="profile-password-grid">
              <ProfileField
                label={t('profile.currentPassword')}
                error={passwordForm.formState.errors.currentPassword?.message}
                required
              >
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

              <div className="profile-password-pair">
                <ProfileField
                  label={t('profile.newPassword')}
                  error={passwordForm.formState.errors.newPassword?.message}
                  required
                >
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

                <ProfileField
                  label={t('profile.confirmPassword')}
                  error={passwordForm.formState.errors.confirmPassword?.message}
                  required
                >
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
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<LockIcon size={18} weight="bold" />}
                  loading={changePassword.isPending}
                >
                  {t('profile.changePasswordBtn')}
                </Button>
              </div>
            </div>
          </form>
        </section>
      </div>

      <Modal
        open={Boolean(pendingPhoto)}
        title={t('profile.photoEditorTitle')}
        okText={t('profile.photoApply')}
        cancelText={t('common.cancel')}
        okButtonProps={{ loading: photoProcessing || updateProfilePhoto.isPending }}
        cancelButtonProps={{ disabled: photoProcessing || updateProfilePhoto.isPending }}
        closable={!photoProcessing && !updateProfilePhoto.isPending}
        maskClosable={!photoProcessing && !updateProfilePhoto.isPending}
        onCancel={closePhotoEditor}
        onOk={() => void handlePhotoApply()}
        width={520}
        className="profile-photo-editor-modal"
      >
        <div className="profile-photo-editor">
          <div className="profile-photo-editor__stage">
            {pendingPhoto ? (
              <img
                src={pendingPhoto.url}
                alt=""
                style={{ transform: `rotate(${photoRotation}deg) scale(${photoZoom})` }}
              />
            ) : (
              <ImageSquareIcon size={42} weight="duotone" />
            )}
            <div className="profile-photo-editor__ring" aria-hidden />
          </div>
          <div className="profile-photo-editor__controls">
            <div className="profile-photo-editor__slider">
              <span>{t('profile.photoZoom')}</span>
              <Slider min={1} max={2.5} step={0.05} value={photoZoom} onChange={setPhotoZoom} />
            </div>
            <Button
              icon={<ArrowClockwiseIcon size={17} />}
              onClick={() => setPhotoRotation((value) => (value + 90) % 360)}
            >
              {t('profile.photoRotate')}
            </Button>
          </div>
          <div className="profile-photo-editor__hint">{t('profile.photoEditorHint')}</div>
        </div>
      </Modal>
    </div>
  )
}
