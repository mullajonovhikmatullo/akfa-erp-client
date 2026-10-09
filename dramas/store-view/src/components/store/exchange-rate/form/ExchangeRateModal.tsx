import type { StoreTranslator } from '@store/store-i18n'
import { Modal } from 'antd'
import type { ExchangeRate } from '@store/store-stub'
import { useExchangeRateForm } from './useExchangeRateForm'
import { ExchangeRateFormFields } from './view/ExchangeRateFormFields'

interface ExchangeRateModalProps {
  t: StoreTranslator
  open: boolean
  current?: ExchangeRate
  onClose: () => void
}

export function ExchangeRateModal({ t, open, current, onClose }: ExchangeRateModalProps) {
  //
  const rateForm = useExchangeRateForm({ t, open, current, onClose })

  return (
    <Modal
      open={open}
      title={t('exchangeRate.title')}
      okText={t('exchangeRate.save')}
      cancelText={t('exchangeRate.cancel')}
      okButtonProps={{ loading: rateForm.isPending, disabled: !rateForm.canSubmit }}
      onCancel={onClose}
      onOk={rateForm.submit}
      destroyOnHidden
    >
      <ExchangeRateFormFields
        t={t}
        control={rateForm.control}
        current={current}
        mode={rateForm.mode}
        hasCbuRate={rateForm.hasCbuRate}
        minRate={rateForm.minRate}
      />
    </Modal>
  )
}
