import type { StoreTranslator } from '@store/store-i18n'
import type { ChangeEventHandler, RefObject } from 'react'
import { Button, Image, Popconfirm } from 'antd'

import type { User } from '@store/store-stub'

interface ProfileIdentitySectionProps {
  t: StoreTranslator
  user?: User | null
  initials: string
  roleLabel: string
  photoBusy: boolean
  photoProcessing: boolean
  updatePhotoPending: boolean
  deletePhotoPending: boolean
  photoInputRef: RefObject<HTMLInputElement | null>
  onPhotoSelected: ChangeEventHandler<HTMLInputElement>
  onPhotoDelete: () => void
}

export function ProfileIdentitySection({
  t,
  user,
  initials,
  roleLabel,
  photoBusy,
  photoProcessing,
  updatePhotoPending,
  deletePhotoPending,
  photoInputRef,
  onPhotoSelected,
  onPhotoDelete,
}: ProfileIdentitySectionProps) {
  //
  const photo = user?.base64Photo

  return (
    <section className="profile-identity" aria-labelledby="profile-identity-name">
      <div className="profile-avatar-wrap">
        <div className="profile-avatar">
          {photo ? (
            <Image
              src={photo}
              alt={user?.name}
              width={132}
              height={132}
              preview={{ src: photo, mask: t('profile.photoPreview') }}
            />
          ) : (
            <span className="profile-avatar__initials">{initials}</span>
          )}
        </div>
        <button
          type="button"
          className="profile-avatar__edit"
          aria-label={photo ? t('profile.photoChange') : t('profile.photoUpload')}
          title={photo ? t('profile.photoChange') : t('profile.photoUpload')}
          disabled={photoBusy}
          onClick={() => photoInputRef.current?.click()}
        >
          <i className="icons-pen-line icon-size-17" />
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
            onChange={onPhotoSelected}
          />
          <Button
            icon={<i className="icons-upload icon-size-17" />}
            loading={photoProcessing || updatePhotoPending}
            disabled={deletePhotoPending}
            onClick={() => photoInputRef.current?.click()}
          >
            {photo ? t('profile.photoChange') : t('profile.photoUpload')}
          </Button>
          {photo ? (
            <Popconfirm
              title={t('profile.photoRemoveConfirm')}
              okText={t('profile.photoRemove')}
              cancelText={t('common.cancel')}
              okButtonProps={{ danger: true, loading: deletePhotoPending }}
              onConfirm={onPhotoDelete}
            >
              <Button
                danger
                icon={<i className="icons-trash icon-size-17" />}
                disabled={photoProcessing || updatePhotoPending}
              >
                {t('profile.photoRemove')}
              </Button>
            </Popconfirm>
          ) : null}
        </div>
        <div className="profile-photo-hint">{t('profile.photoHint')}</div>
      </div>
    </section>
  )
}
