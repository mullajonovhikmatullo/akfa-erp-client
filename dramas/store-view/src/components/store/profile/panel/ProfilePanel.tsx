import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { getLocalizedApiErrorMessage } from '@store/store-shared'
import type { UpdateProfilePayload, User } from '@store/store-stub'
import { useUserMutation } from '../../admins/hooks/useUserMutation'
import { prepareProfilePhoto } from '../lib/profile-photo'
import {
  createPasswordSchema,
  createProfileSchema,
  type PasswordFormValues,
  type ProfileFormValues,
} from './profileSchemas'
import { ProfileIdentitySection } from './view/ProfileIdentitySection'
import { ProfileInformationSection } from './view/ProfileInformationSection'
import { ProfilePhotoEditorModal } from './view/ProfilePhotoEditorModal'
import { ProfileSecuritySection } from './view/ProfileSecuritySection'

type Translate = (key: string) => string

const PROFILE_PHOTO_MAX_BYTES = 5 * 1024 * 1024
const PROFILE_PHOTO_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

interface PendingPhoto {
  file: File
  url: string
}

export interface ProfilePanelProps {
  t: Translate
  user?: User | null
  onUserUpdated?: (user: User) => void
}

function getInitials(name?: string) {
  //
  return (name ?? '?')
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

export function ProfilePanel({ t, user, onUserUpdated }: ProfilePanelProps) {
  //
  const [profileEditing, setProfileEditing] = useState(false)
  const [pendingPhoto, setPendingPhoto] = useState<PendingPhoto | null>(null)
  const [photoZoom, setPhotoZoom] = useState(1)
  const [photoRotation, setPhotoRotation] = useState(0)
  const [photoProcessing, setPhotoProcessing] = useState(false)
  const photoInputRef = useRef<HTMLInputElement>(null)
  const { updateProfile, updateProfilePhoto, deleteProfilePhoto, changePassword } = useUserMutation({
    onUpdated: onUserUpdated,
  })
  const profileSchema = useMemo(() => createProfileSchema(t), [t])
  const passwordSchema = useMemo(() => createPasswordSchema(t), [t])
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { fullName: user?.name ?? '', username: user?.username ?? '' },
  })
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  })

  useEffect(() => {
    //
    const hasProfileErrors = Object.keys(profileForm.formState.errors).length > 0
    const hasPasswordErrors = Object.keys(passwordForm.formState.errors).length > 0
    if (hasProfileErrors) void profileForm.trigger()
    if (hasPasswordErrors) void passwordForm.trigger()
  }, [passwordForm, profileForm, t])

  useEffect(() => {
    //
    if (!profileEditing) {
      profileForm.reset({ fullName: user?.name ?? '', username: user?.username ?? '' })
    }
  }, [profileEditing, profileForm, user?.name, user?.username])

  useEffect(
    () => () => {
      //
      if (pendingPhoto) URL.revokeObjectURL(pendingPhoto.url)
    },
    [pendingPhoto],
  )

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

  function resetPhotoEditor() {
    //
    setPendingPhoto(null)
    setPhotoZoom(1)
    setPhotoRotation(0)
  }

  function closePhotoEditor() {
    //
    if (photoProcessing || updateProfilePhoto.isPending) return
    resetPhotoEditor()
  }

  function handleProfileSave(values: ProfileFormValues) {
    //
    const changed: UpdateProfilePayload = {}
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
      onError: (error: unknown) =>
        toast.error(getLocalizedApiErrorMessage(error, t, 'profile.updateError')),
    })
  }

  function handlePasswordSave(values: PasswordFormValues) {
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
          return
        }
        toast.error(getLocalizedApiErrorMessage(error, t, 'profile.passwordError'))
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
      resetPhotoEditor()
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

      <ProfileIdentitySection
        t={t}
        user={user}
        initials={getInitials(user?.name)}
        roleLabel={roleLabel}
        photoBusy={photoBusy}
        photoProcessing={photoProcessing}
        updatePhotoPending={updateProfilePhoto.isPending}
        deletePhotoPending={deleteProfilePhoto.isPending}
        photoInputRef={photoInputRef}
        onPhotoSelected={handlePhotoSelected}
        onPhotoDelete={handlePhotoDelete}
      />

      <div className="profile-grid">
        <ProfileInformationSection
          t={t}
          username={user?.username}
          editing={profileEditing}
          pending={updateProfile.isPending}
          form={profileForm}
          onEdit={startEditing}
          onCancel={cancelEditing}
          onSubmit={handleProfileSave}
        />
        <ProfileSecuritySection
          t={t}
          pending={changePassword.isPending}
          form={passwordForm}
          onSubmit={handlePasswordSave}
        />
      </div>

      <ProfilePhotoEditorModal
        t={t}
        photoUrl={pendingPhoto?.url}
        zoom={photoZoom}
        rotation={photoRotation}
        pending={photoProcessing || updateProfilePhoto.isPending}
        onZoomChange={setPhotoZoom}
        onRotate={() => setPhotoRotation((value) => (value + 90) % 360)}
        onClose={closePhotoEditor}
        onApply={() => void handlePhotoApply()}
      />
    </div>
  )
}
