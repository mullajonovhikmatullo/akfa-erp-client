import type { StoreTranslator } from '@store/store-i18n'
import { MoneyDisplay } from '@store/store-shared/ui/money-display'

interface ExpenseKpiItem {
  id: string
  name: string
  total: number
}

export function ExpenseKpiCards({ items, grandTotal, t }: { items: ExpenseKpiItem[]; grandTotal: number; t: StoreTranslator }) {
  //
  if (items.length === 0) return null

  return (
    <div className="u-flex u-gap-12 u-mb-16 u-overflow-x-auto u-pb-4 u-snap-x-proximity">
      {items.map((item) => {
        //
        const pct = grandTotal > 0 ? (item.total / grandTotal) * 100 : 0
        return (
          <div key={item.id} className="card u-flex-grow-basis-190 u-max-w-240 u-min-w-190 u-p-14-16 u-snap-align-start" >
            <div className="u-text-muted u-fs-11 u-fw-700 u-tracking-wide u-mb-6 u-text-uppercase">{item.name}</div>
            <div className="num u-fs-16 u-fw-700 u-mb-6" ><MoneyDisplay amount={item.total} currency="UZS" /></div>
            <div className="u-bg-border u-rounded-2 u-h-4 u-mb-4 u-overflow-hidden">
              <div className={`progress-fill progress-fill--rounded-2 u-w-pct-${Math.round(pct)}`} />
            </div>
            <div className="u-text-muted u-fs-11-5">{pct.toFixed(0)}% {t('expenses.pctSuffix')}</div>
          </div>
        )
      })}
    </div>
  )
}
