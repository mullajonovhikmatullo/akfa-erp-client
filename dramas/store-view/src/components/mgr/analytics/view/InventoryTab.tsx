import { Skeleton, Table } from 'antd'
import { WarningIcon } from '@phosphor-icons/react'
import { MoneyDisplay } from '@store/store-shared/ui/money-display'
import type { InventoryReportData } from '@store/store-stub'
import { Empty, SectionTitle } from './AnalyticsShared'
import { createLowStockColumns } from './analyticsColumns'
import type { TFunc } from './types'

export function InventoryTab({ data, loading, t }: { data?: InventoryReportData; loading: boolean; t: TFunc }) {
  //
  if (loading || !data) return <Skeleton active paragraph={{ rows: 8 }} />
  const movementLabels: Record<string, string> = {
    STOCK_IN: t('analytics.movStockIn'),
    STOCK_OUT: t('analytics.movStockOut'),
    ADJUSTMENT: t('analytics.movAdjust'),
    TRANSFER_IN: t('analytics.movTransferIn'),
    TRANSFER_OUT: t('analytics.movTransferOut'),
  }

  return (
    <div className="analytics-inventory">
      <div className="analytics-inventory-branches">
        {data.stockByBranch.map((branch) => <div key={branch.branchId} className="card analytics-inventory-branch"><div className="analytics-inventory-branch__name">{branch.branchName}</div><div className="analytics-inventory-branch__value num"><MoneyDisplay amount={branch.stockValueUzs} currency="UZS" /></div><div className="analytics-inventory-branch__meta">{branch.productCount} {t('analytics.skuSuffix')} · {branch.totalQuantity.toLocaleString('ru-RU')} {t('analytics.pieceSuffix')}</div></div>)}
        {data.stockByBranch.length === 0 ? <div style={{ color: 'var(--ink-3)', fontSize: 13 }}>{t('analytics.noInventoryData')}</div> : null}
      </div>
      <div className="analytics-inventory-details">
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }}><WarningIcon size={18} weight="duotone" color="currentColor" style={{ color: 'var(--warning)' }} /><span style={{ fontWeight: 700, fontSize: 13 }}>{t('analytics.lowStockItems')} ({data.lowStock.length})</span></div>
          {data.lowStock.length === 0 ? <div style={{ padding: '16px', color: 'var(--ink-3)', fontSize: 13 }}>{t('analytics.allSufficient')}</div> : <Table size="small" pagination={false} rowKey={(row) => `${row.productId}-${row.branchId}`} dataSource={data.lowStock} columns={createLowStockColumns(t)} />}
        </div>
        <div className="card analytics-inventory-movements">
          <SectionTitle>{t('analytics.movementSummary')}</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {data.movementSummary.map((movement) => <div key={movement.type} className="analytics-inventory-movement"><span style={{ fontSize: 13, fontWeight: 500 }}>{movementLabels[movement.type] ?? movement.type}</span><div style={{ textAlign: 'right' }}><div className="num" style={{ fontWeight: 700 }}>{movement.totalQuantity.toLocaleString('ru-RU')}</div><div style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>{movement.count} {t('analytics.operationSuffix')}</div></div></div>)}
            {data.movementSummary.length === 0 ? <Empty t={t} /> : null}
          </div>
        </div>
      </div>
    </div>
  )
}
