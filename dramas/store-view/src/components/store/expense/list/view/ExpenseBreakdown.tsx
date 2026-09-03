import type { StoreTranslator } from '@store/store-i18n'
import { MoneyDisplay } from '@store/store-shared/ui/money-display'

interface ExpenseBreakdownItem {
  id: string
  name: string
  total: number
}

export function ExpenseBreakdown({ items, grandTotal, t }: { items: ExpenseBreakdownItem[]; grandTotal: number; t: StoreTranslator }) {
  //
  return (
    <div className="card u-sticky u-top-76" >
      <div className="u-fs-13 u-fw-700 u-mb-14">{t('expenses.breakdown')}</div>
      {items.length === 0 ? (
        <div className="u-text-muted u-fs-13">{t('common.noData')}</div>
      ) : (
        <div className="u-flex u-flex-col u-gap-12">
          {items.map((item) => {
            //
            const pct = grandTotal > 0 ? (item.total / grandTotal) * 100 : 0
            return (
              <div key={item.id}>
                <div className="u-flex u-fs-12-5 u-justify-between u-mb-4">
                  <span className="u-text-secondary u-fw-500">{item.name}</span>
                  <span className="num u-text-muted" >{pct.toFixed(0)}%</span>
                </div>
                <div className="u-bg-border u-rounded-3 u-h-5 u-overflow-hidden">
                  <div className={`progress-fill u-w-pct-${Math.round(pct)}`} />
                </div>
                <div className="num u-text-muted u-fs-11-5 u-mt-2" ><MoneyDisplay amount={item.total} currency="UZS" /></div>
              </div>
            )
          })}
        </div>
      )}
      <div className="u-border-t-default u-m-14-0" />
      <div className="u-flex u-fs-14 u-justify-between">
        <span className="u-text-muted">{t('common.total')}</span>
        <span className="num u-fw-700" ><MoneyDisplay amount={grandTotal} currency="UZS" /></span>
      </div>
    </div>
  )
}
