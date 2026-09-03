import { Button, Modal, Slider } from 'antd'


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
            <img src={photoUrl} alt="" className={`profile-photo-transform-r${rotation}-z${Math.round(zoom * 100)}`} />
          ) : (
            <i className="icons-image icon-size-42" />
          )}
          <div className="profile-photo-editor__ring" aria-hidden />
        </div>
        <div className="profile-photo-editor__controls">
          <div className="profile-photo-editor__slider">
            <span>{t('profile.photoZoom')}</span>
            <Slider min={1} max={2.5} step={0.05} value={zoom} onChange={onZoomChange} />
          </div>
          <Button icon={<i className="icons-reload icon-size-17" />} onClick={onRotate}>
            {t('profile.photoRotate')}
          </Button>
        </div>
        <div className="profile-photo-editor__hint">{t('profile.photoEditorHint')}</div>
      </div>
    </Modal>
  )
}
