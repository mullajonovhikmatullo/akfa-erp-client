import { StoreIcon } from '@store/store-shared/ui/store-icon'
import { Skeleton, Table } from 'antd'

import { MoneyDisplay } from '@store/store-shared/ui/money-display'
import type { InventoryReportData, LowStockPage } from '@store/store-stub'
import { ArrowPager } from '../../shared/view/ArrowPager'
import { Empty, SectionTitle } from './AnalyticsShared'
import { createLowStockColumns } from './analyticsColumns'
import type { TFunc } from './types'

interface InventoryTabProps {
  data?: InventoryReportData
  loading: boolean
  lowStock?: LowStockPage
  lowStockLoading: boolean
  lowStockFetching: boolean
  lowStockPage: number
  lowStockPageSize: number
  onLowStockPageChange: (page: number) => void
  t: TFunc
}

export function InventoryTab({
  data,
  loading,
  lowStock,
  lowStockLoading,
  lowStockFetching,
  lowStockPage,
  lowStockPageSize,
  onLowStockPageChange,
  t,
}: InventoryTabProps) {
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
        {data.stockByBranch.length === 0 ? <div className="u-text-muted u-fs-13">{t('analytics.noInventoryData')}</div> : null}
      </div>
      <div className="analytics-inventory-details">
        <div className="card u-overflow-hidden u-p-0" >
          <div className="u-items-center u-border-b-default u-flex u-gap-8 u-p-12-16"><StoreIcon name="warning" size={18} className="u-text-warning" /><span className="u-fs-13 u-fw-700">{t('analytics.lowStockItems')} ({lowStock?.total ?? 0})</span></div>
          {lowStockLoading ? <div className="u-p-16"><Skeleton active paragraph={{ rows: 4 }} /></div> : null}
          {!lowStockLoading && (lowStock?.total ?? 0) === 0 ? <div className="u-text-muted u-fs-13 u-p-16">{t('analytics.allSufficient')}</div> : null}
          {!lowStockLoading && lowStock && lowStock.total > 0 ? (
            <>
              <Table size="small" pagination={false} loading={lowStockFetching} rowKey={(row) => `${row.productId}-${row.branchId}`} dataSource={lowStock.items} columns={createLowStockColumns(t)} />
              <ArrowPager t={t} page={lowStockPage} pageSize={lowStockPageSize} total={lowStock.total} loading={lowStockFetching} onChange={onLowStockPageChange} />
            </>
          ) : null}
        </div>
        <div className="card analytics-inventory-movements">
          <SectionTitle>{t('analytics.movementSummary')}</SectionTitle>
          <div className="u-flex u-flex-col u-gap-8">
            {data.movementSummary.map((movement) => <div key={movement.type} className="analytics-inventory-movement"><span className="u-fs-13 u-fw-500">{movementLabels[movement.type] ?? movement.type}</span><div className="u-text-right"><div className="num u-fw-700" >{movement.totalQuantity.toLocaleString('ru-RU')}</div><div className="u-text-muted u-fs-11-5">{movement.count} {t('analytics.operationSuffix')}</div></div></div>)}
            {data.movementSummary.length === 0 ? <Empty t={t} /> : null}
          </div>
        </div>
      </div>
    </div>
  )
}
