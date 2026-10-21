import type { StoreTranslator } from '@store/store-i18n'
import { Skeleton } from 'antd'
import { formatDateTime } from '@store/store-shared/lib/formatters'
import type { ProductDiscountChange } from '@store/store-stub'

interface DiscountHistoryProps {
  t: StoreTranslator
  changes: ProductDiscountChange[]
  loading: boolean
}

const percent = (value: number) => `${value.toLocaleString('ru-RU', { maximumFractionDigits: 2 })}%`

export function DiscountHistory({ t, changes, loading }: DiscountHistoryProps) {
  //
  if (loading) return <Skeleton active paragraph={{ rows: 2 }} />
  if (changes.length === 0) return <div className="u-text-muted u-fs-13 u-p-12-0">{t('products.discountHistoryEmpty')}</div>

  return (
    <div className="u-flex u-flex-col u-gap-8">
      {changes.map((change) => (
        <div key={change.id} className="u-items-center u-bg-surface-2 u-rounded-8 u-border-default u-flex u-justify-between u-gap-8 u-p-10-14">
          <div className="u-min-w-0">
            <div className="u-fw-600">{change.changedBy.fullName}</div>
            <div className="u-text-muted u-fs-11-5">{formatDateTime(change.createdAt)}</div>
          </div>
          <span className="num u-fw-700 u-whitespace-nowrap">
            <span className="u-text-muted">{percent(change.oldPercent)}</span> → {percent(change.newPercent)}
          </span>
        </div>
      ))}
    </div>
  )
}
