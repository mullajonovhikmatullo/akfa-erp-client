import { StoreIcon } from '@store/store-shared/ui/store-icon'
import type { StoreTranslator } from '@store/store-i18n'
import { Button } from 'antd'

interface ProductFormHeaderProps {
  t: StoreTranslator
  title: string
  subtitle: string
  submitLabel: string
  isPending: boolean
  canSubmit: boolean
  onBack: () => void
  onSubmit: () => void
}

export function ProductFormHeader({ t, title, subtitle, submitLabel, isPending, canSubmit, onBack, onSubmit }: ProductFormHeaderProps) {
  //
  return (
    <div className="product-form-page__head">
      <Button type="text" size="small" icon={<StoreIcon name="arrow-left" size={16} />} onClick={onBack} className="product-form-page__back">
        {t('productForm.backToList')}
      </Button>
      <div className="page-head">
        <div className="u-min-w-0">
          <h1 className="u-overflow-hidden u-text-ellipsis u-whitespace-nowrap">{title}</h1>
          <div className="sub">{subtitle}</div>
        </div>
        <div className="u-flex u-gap-8">
          <Button onClick={onBack} disabled={isPending}>{t('common.cancel')}</Button>
          <Button type="primary" icon={<StoreIcon name="check" size={16} />} loading={isPending} disabled={!canSubmit} onClick={onSubmit}>
            {submitLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
