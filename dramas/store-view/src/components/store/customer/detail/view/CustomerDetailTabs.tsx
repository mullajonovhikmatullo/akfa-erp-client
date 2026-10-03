import type { StoreTranslator } from '@store/store-i18n'

export type CustomerDetailTab = 'sales' | 'products' | 'debts' | 'payments'

export const CUSTOMER_DETAIL_TABS: CustomerDetailTab[] = ['sales', 'products', 'debts', 'payments']

const TAB_LABELS = {
  sales: 'customerDetail.tabSales',
  products: 'customerDetail.tabProducts',
  debts: 'customerDetail.tabDebts',
  payments: 'customerDetail.tabPayments',
} as const

interface CustomerDetailTabsProps {
  t: StoreTranslator
  active: CustomerDetailTab
  counts: Partial<Record<CustomerDetailTab, number>>
  onChange: (tab: CustomerDetailTab) => void
}

export function CustomerDetailTabs({ t, active, counts, onChange }: CustomerDetailTabsProps) {
  //
  return (
    <div className="customer-tabs" role="tablist" aria-label={t('customerDetail.infoTitle')}>
      {CUSTOMER_DETAIL_TABS.map((tab) => (
        <button
          key={tab}
          type="button"
          role="tab"
          aria-selected={active === tab}
          className={active === tab ? 'is-active' : ''}
          onClick={() => onChange(tab)}
        >
          {t(TAB_LABELS[tab])}
          {counts[tab] ? <span className="customer-tabs__count">{counts[tab]}</span> : null}
        </button>
      ))}
    </div>
  )
}
