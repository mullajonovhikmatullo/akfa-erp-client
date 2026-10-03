import { StoreIcon } from '@store/store-shared/ui/store-icon'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Button, Skeleton } from 'antd'
import { useStoreT } from '@store/store-i18n'
import { DataTable } from '@store/store-shared/ui/data-table'
import type { CustomerPurchasedProduct, DebtPayment, SaleListItem } from '@store/store-stub'
import { useBranchesList } from '../../branch/hooks/useBranchesList'
import { SaleDetailDrawer } from '../../sale/detail/SaleDetailDrawer'
import { useSaleMutation } from '../../sale/hooks/useSaleMutation'
import { usePagination } from '../../shared/hooks/usePagination'
import { CustomerFormModal } from '../form/CustomerFormModal'
import { useCustomerDebtPaymentsPage } from '../hooks/useCustomerDebtPaymentsPage'
import { useCustomerDetail } from '../hooks/useCustomerDetail'
import { useCustomerProductsPage } from '../hooks/useCustomerProductsPage'
import { useCustomerSalesPage } from '../hooks/useCustomerSalesPage'
import { useCustomerSummary } from '../hooks/useCustomerSummary'
import { CUSTOMER_DETAIL_TABS, CustomerDetailTabs, type CustomerDetailTab } from './view/CustomerDetailTabs'
import { CustomerInfoCard } from './view/CustomerInfoCard'
import { CustomerProfileHeader } from './view/CustomerProfileHeader'
import { CustomerPurchasesChart } from './view/CustomerPurchasesChart'
import { CustomerSummaryCards } from './view/CustomerSummaryCards'
import { createCustomerDebtColumns } from './view/customerDebtColumns'
import { createCustomerPaymentColumns } from './view/customerPaymentColumns'
import { createCustomerProductsColumns } from './view/customerProductsColumns'
import { createCustomerSalesColumns } from './view/customerSalesColumns'
import { DebtPaymentModal, type DebtPaymentValues } from './view/DebtPaymentModal'

export interface CustomerDetailPanelProps {
  customerId: string
  branchId?: string
  isStoreOwner: boolean
  canManage: boolean
  onBack: () => void
}

function isCustomerDetailTab(value: string | null): value is CustomerDetailTab {
  //
  return CUSTOMER_DETAIL_TABS.includes(value as CustomerDetailTab)
}

export function CustomerDetailPanel({ customerId, branchId, isStoreOwner, canManage, onBack }: CustomerDetailPanelProps) {
  //
  const t = useStoreT()
  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = searchParams.get('tab')
  const activeTab: CustomerDetailTab = isCustomerDetailTab(tabParam) ? tabParam : 'sales'
  const { page, pageSize, changePage, goToPage, rowIndex } = usePagination()
  const [viewingSale, setViewingSale] = useState<SaleListItem | null>(null)
  const [payingSale, setPayingSale] = useState<SaleListItem | null>(null)
  const [editing, setEditing] = useState(false)

  const detailQuery = useCustomerDetail(customerId)
  const summaryQuery = useCustomerSummary(customerId, { branchId })
  const pageQuery = { customerId, branchId, page, pageSize }
  const salesQuery = useCustomerSalesPage(pageQuery, { enabled: activeTab === 'sales' })
  const debtsQuery = useCustomerSalesPage({ ...pageQuery, hasDebt: true }, { enabled: activeTab === 'debts' })
  const productsQuery = useCustomerProductsPage(customerId, { branchId, page, pageSize }, { enabled: activeTab === 'products' })
  const paymentsQuery = useCustomerDebtPaymentsPage(pageQuery, { enabled: activeTab === 'payments' })
  const branchesQuery = useBranchesList()
  const { addPayment } = useSaleMutation(t)

  const activeQuery = { sales: salesQuery, debts: debtsQuery, products: productsQuery, payments: paymentsQuery }[activeTab]
  const total = activeQuery.data?.total ?? 0
  const lastPage = Math.max(1, Math.ceil(total / pageSize))
  const summary = summaryQuery.data

  useEffect(() => {
    //
    if (activeQuery.isPlaceholderData || !activeQuery.data) return
    if (page > lastPage) goToPage(lastPage)
  }, [activeQuery.data, activeQuery.isPlaceholderData, goToPage, lastPage, page])

  function changeTab(tab: CustomerDetailTab) {
    //
    setSearchParams((current) => {
      //
      const next = new URLSearchParams(current)
      next.set('tab', tab)
      next.delete('page')
      return next
    })
  }

  function refresh() {
    //
    void detailQuery.refetch()
    void summaryQuery.refetch()
    void activeQuery.refetch()
  }

  function submitPayment(sale: SaleListItem, values: DebtPaymentValues) {
    //
    if (values.amount <= 0) return
    addPayment.mutate(
      { saleId: sale.id, payload: { amountUzs: Math.min(values.amount, sale.debtAmountUzs), paymentMethod: values.method } },
      { onSuccess: () => setPayingSale(null) },
    )
  }

  const pagination = {
    current: page,
    pageSize,
    total,
    onChange: changePage,
    showSizeChanger: true,
    showTotal: (count: number) => `${count} ${t('common.countSuffix')}`,
    pageSizeOptions: ['10', '25', '50'],
  }

  if (detailQuery.isLoading) {
    return (
      <section className="customer-detail-page">
        <div className="card u-p-16-20"><Skeleton active avatar paragraph={{ rows: 3 }} /></div>
      </section>
    )
  }

  const customer = detailQuery.data
  if (!customer) {
    return (
      <section className="customer-detail-page">
        <div className="card customer-detail-missing">
          <StoreIcon name="user-circle" size={36} className="u-text-quiet" />
          <h2>{t('customerDetail.notFound')}</h2>
          <p>{t('customerDetail.notFoundHint')}</p>
          <Button icon={<StoreIcon name="arrow-left" size={16} />} onClick={onBack}>{t('customerDetail.backToList')}</Button>
        </div>
      </section>
    )
  }

  return (
    <section className="customer-detail-page">
      <CustomerProfileHeader
        t={t}
        customer={customer}
        refreshing={detailQuery.isFetching || summaryQuery.isFetching || activeQuery.isFetching}
        canEdit={canManage}
        onBack={onBack}
        onEdit={() => setEditing(true)}
        onRefresh={refresh}
      />
      <CustomerSummaryCards t={t} summary={summary} loading={summaryQuery.isLoading} />
      <div className="customer-detail-overview">
        <CustomerPurchasesChart t={t} monthly={summary?.monthly} loading={summaryQuery.isLoading} />
        <CustomerInfoCard t={t} customer={customer} summary={summary} />
      </div>

      <CustomerDetailTabs
        t={t}
        active={activeTab}
        counts={{ sales: summary?.salesCount, products: summary?.productCount, debts: summary?.openDebtCount, payments: summary?.debtPaymentCount }}
        onChange={changeTab}
      />
      <div className="card u-overflow-hidden u-p-0">
        {activeTab === 'sales' ? (
          <DataTable<SaleListItem>
            rowKey="id"
            dataSource={salesQuery.data?.items ?? []}
            columns={createCustomerSalesColumns({ t, rowIndex, onView: setViewingSale })}
            loading={salesQuery.isLoading}
            pagination={pagination}
            emptyText={t('customers.drawerNoSales')}
            onRow={(sale) => ({ onClick: () => setViewingSale(sale), className: 'clickable-row' })}
          />
        ) : null}
        {activeTab === 'products' ? (
          <DataTable<CustomerPurchasedProduct>
            rowKey="productId"
            dataSource={productsQuery.data?.items ?? []}
            columns={createCustomerProductsColumns({ t, rowIndex })}
            loading={productsQuery.isLoading}
            pagination={pagination}
            emptyText={t('customerDetail.noProducts')}
          />
        ) : null}
        {activeTab === 'debts' ? (
          <DataTable<SaleListItem>
            rowKey="id"
            dataSource={debtsQuery.data?.items ?? []}
            columns={createCustomerDebtColumns({ t, rowIndex, onPay: setPayingSale, onView: setViewingSale })}
            loading={debtsQuery.isLoading}
            pagination={pagination}
            emptyText={t('customers.drawerNoDebtSales')}
          />
        ) : null}
        {activeTab === 'payments' ? (
          <DataTable<DebtPayment>
            rowKey="id"
            dataSource={paymentsQuery.data?.items ?? []}
            columns={createCustomerPaymentColumns({ t, rowIndex })}
            loading={paymentsQuery.isLoading}
            pagination={pagination}
            emptyText={t('customerDetail.noPayments')}
          />
        ) : null}
      </div>

      <SaleDetailDrawer t={t} sale={viewingSale} onClose={() => setViewingSale(null)} />
      <DebtPaymentModal
        t={t}
        sale={payingSale}
        pending={addPayment.isPending}
        onCancel={() => setPayingSale(null)}
        onSubmit={submitPayment}
      />
      <CustomerFormModal
        t={t}
        open={editing}
        customer={customer}
        onClose={() => setEditing(false)}
        isStoreOwner={isStoreOwner}
        branchId={branchId}
        branches={branchesQuery.data ?? []}
        branchesLoading={branchesQuery.isLoading}
      />
    </section>
  )
}
