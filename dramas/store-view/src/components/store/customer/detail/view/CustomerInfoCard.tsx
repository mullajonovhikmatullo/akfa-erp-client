import type { ReactNode } from 'react'
import type { StoreTranslator } from '@store/store-i18n'
import { formatDate } from '@store/store-shared/lib/formatters'
import { StatusBadge } from '@store/store-shared/ui/status-badge'
import type { CustomerDetail, CustomerSummary } from '@store/store-stub'

interface CustomerInfoCardProps {
  t: StoreTranslator
  customer: CustomerDetail
  summary?: CustomerSummary
}

function InfoLine({ label, children }: { label: string; children: ReactNode }) {
  //
  return (
    <div className="customer-info-line">
      <span>{label}</span>
      <div>{children}</div>
    </div>
  )
}

export function CustomerInfoCard({ t, customer, summary }: CustomerInfoCardProps) {
  //
  const branches = customer.branchLinks?.length ? customer.branchLinks.map((link) => link.branch) : [customer.branch]

  return (
    <div className="card u-p-16-20">
      <div className="u-fs-13 u-fw-700 u-mb-10">{t('customerDetail.infoTitle')}</div>
      <InfoLine label={t('common.phone')}>
        <span className="u-font-mono">{customer.phone ?? '—'}</span>
      </InfoLine>
      <InfoLine label={t('customerDetail.address')}>{customer.address ?? '—'}</InfoLine>
      <InfoLine label={t('customerDetail.branches')}>
        <div className="u-flex u-flex-wrap u-gap-4 u-justify-end">
          {branches.map((branch) => <StatusBadge key={branch.id} tone={branch.id === customer.branchId ? 'info' : 'muted'}>{branch.name}</StatusBadge>)}
        </div>
      </InfoLine>
      <InfoLine label={t('customerDetail.customerSince')}>{formatDate(customer.createdAt)}</InfoLine>
      <InfoLine label={t('customerDetail.firstPurchase')}>{summary?.firstSaleAt ? formatDate(summary.firstSaleAt) : '—'}</InfoLine>
      <InfoLine label={t('customerDetail.lastPurchase')}>{summary?.lastSaleAt ? formatDate(summary.lastSaleAt) : '—'}</InfoLine>
      <InfoLine label={t('customerDetail.productTypes')}>
        <span className="num">{summary?.productCount ?? 0}</span>
      </InfoLine>
    </div>
  )
}
