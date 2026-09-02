import { Button, Modal, Slider } from 'antd'
import { ArrowClockwiseIcon, ImageSquareIcon } from '@phosphor-icons/react'

interface ProfilePhotoEditorModalProps {
  t: (key: string) => string
  photoUrl?: string
  zoom: number
  rotation: number
  pending: boolean
  onZoomChange: (value: number) => void
  onRotate: () => void
  onClose: () => void
  onApply: () => void
}

export function ProfilePhotoEditorModal({
  t,
  photoUrl,
  zoom,
  rotation,
  pending,
  onZoomChange,
  onRotate,
  onClose,
  onApply,
}: ProfilePhotoEditorModalProps) {
  //
  return (
    <Modal
      open={Boolean(photoUrl)}
      title={t('profile.photoEditorTitle')}
      okText={t('profile.photoApply')}
      cancelText={t('common.cancel')}
      okButtonProps={{ loading: pending }}
      cancelButtonProps={{ disabled: pending }}
      closable={!pending}
      maskClosable={!pending}
      onCancel={onClose}
      onOk={onApply}
      width={520}
      className="profile-photo-editor-modal"
    >
      <div className="profile-photo-editor">
        <div className="profile-photo-editor__stage">
          {photoUrl ? (
            <img src={photoUrl} alt="" style={{ transform: `rotate(${rotation}deg) scale(${zoom})` }} />
          ) : (
            <ImageSquareIcon size={42} weight="duotone" />
          )}
          <div className="profile-photo-editor__ring" aria-hidden />
        </div>
        <div className="profile-photo-editor__controls">
          <div className="profile-photo-editor__slider">
            <span>{t('profile.photoZoom')}</span>
            <Slider min={1} max={2.5} step={0.05} value={zoom} onChange={onZoomChange} />
          </div>
          <Button icon={<ArrowClockwiseIcon size={17} />} onClick={onRotate}>
            {t('profile.photoRotate')}
          </Button>
        </div>
        <div className="profile-photo-editor__hint">{t('profile.photoEditorHint')}</div>
      </div>
    </Modal>
  )
}
