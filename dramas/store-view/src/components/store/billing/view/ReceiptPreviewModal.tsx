import { Button, Modal } from 'antd'
import type { ReceiptPreview } from './types'
import type { BillingTranslate } from './types'

interface ReceiptPreviewModalProps {
  preview: ReceiptPreview | null
  t: BillingTranslate
  onClose: () => void
}

export function ReceiptPreviewModal({ preview, t, onClose }: ReceiptPreviewModalProps) {
  //
  return (
    <Modal
      title={preview?.fileName ?? t('billing.receipt')}
      open={Boolean(preview)}
      width={620}
      centered
      className="billing-receipt-modal"
      footer={<Button type="primary" onClick={onClose}>{t('common.close')}</Button>}
      onCancel={onClose}
    >
      <div className="billing-receipt-note">
        <span>{t('billing.note')}</span>
        <p>{preview?.note?.trim() || '—'}</p>
      </div>
      <div className="receipt-preview">
        {preview?.mimeType === 'application/pdf' ? (
          <iframe src={preview.url} title={preview.fileName} />
        ) : preview ? (
          <img src={preview.url} alt={preview.fileName} />
        ) : null}
      </div>
    </Modal>
  )
}

