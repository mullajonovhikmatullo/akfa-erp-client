import { Button, Form, Input, Modal, Space, Upload } from 'antd'
import type { FormInstance, UploadFile } from 'antd'

import { RECEIPT_ACCEPT, isValidReceipt } from '../lib/billing-receipt'
import { formatBillingMoney } from '../lib/billing-formatters'
import type { BillingTranslate, PaymentFormValues, ReceiptPreview } from './types'

interface PaymentSubmissionModalProps {
  open: boolean
  pending: boolean
  amount: number
  form: FormInstance<PaymentFormValues>
  files: UploadFile[]
  preview: ReceiptPreview | null
  t: BillingTranslate
  onClose: () => void
  onAfterClose: () => void
  onSubmit: () => void
  onFilesChange: (files: UploadFile[]) => void
  onClearReceipt: () => void
  onInvalidReceipt: () => void
}

export function PaymentSubmissionModal({
  open,
  pending,
  amount,
  form,
  files,
  preview,
  t,
  onClose,
  onAfterClose,
  onSubmit,
  onFilesChange,
  onClearReceipt,
  onInvalidReceipt,
}: PaymentSubmissionModalProps) {
  //
  return (
    <Modal
      title={t('billing.modalTitle')}
      open={open}
      okText={t('billing.submit')}
      cancelText={t('common.cancel')}
      confirmLoading={pending}
      okButtonProps={{ disabled: files.length === 0 }}
      onOk={onSubmit}
      onCancel={onClose}
      afterClose={onAfterClose}
      destroyOnHidden
      maskClosable
      keyboard
    >
      <Form<PaymentFormValues> form={form} layout="vertical">
        <div className="billing-modal-amount">
          <span>{t('billing.amountToPay')}</span>
          <strong>{formatBillingMoney(amount)}</strong>
        </div>
        <Form.Item label={t('billing.receipt')}>
          {preview ? (
            <div className="billing-receipt-preview">
              <div className="billing-receipt-preview__header">
                <span title={preview.fileName}>{preview.fileName}</span>
                <Button type="text" danger htmlType="button" icon={<i className="icons-close icon-size-16" />} onClick={onClearReceipt}>
                  {t('common.cancel')}
                </Button>
              </div>
              <div className="billing-receipt-preview__content">
                {preview.mimeType === 'application/pdf' ? (
                  <iframe src={preview.url} title={preview.fileName} />
                ) : (
                  <img src={preview.url} alt={preview.fileName} />
                )}
              </div>
            </div>
          ) : (
            <Upload.Dragger
              accept={RECEIPT_ACCEPT}
              maxCount={1}
              fileList={files}
              showUploadList={false}
              beforeUpload={(file) => {
                //
                if (!isValidReceipt(file)) {
                  onInvalidReceipt()
                  return Upload.LIST_IGNORE
                }
                return false
              }}
              onChange={({ fileList }) => onFilesChange(fileList)}
            >
              <i className="icons-file-upload icon-size-30" />
              <p>{t('billing.receiptDrop')}</p>
              <span>{t('billing.receiptHint')}</span>
            </Upload.Dragger>
          )}
        </Form.Item>
        <Form.Item name="note" label={t('billing.note')}>
          <Input.TextArea
            rows={3}
            maxLength={500}
            showCount={{ formatter: ({ count, maxLength }) => `${count}/${maxLength ?? ''}` }}
            placeholder={t('billing.notePlaceholder')}
          />
        </Form.Item>
        <Space className="billing-security-note" size={8}>
          <i className="icons-circle-check icon-size-18" />
          <span>{t('billing.securityNote')}</span>
        </Space>
      </Form>
    </Modal>
  )
}

