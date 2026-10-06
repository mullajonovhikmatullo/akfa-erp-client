import { StoreIcon } from '@store/store-shared/ui/store-icon'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Controller, useForm } from 'react-hook-form'
import { Button, Input, Select, Tooltip } from 'antd'

import { useStoreT } from '@store/store-i18n'
import { DataTable } from '@store/store-shared/ui/data-table'
import { ExcelImportButton } from '@store/store-shared/ui/excel-import-button'
import { MoneyDisplay } from '@store/store-shared/ui/money-display'
import type { CreateCustomerPayload, Customer } from '@store/store-stub'
import { useBranchesList } from '../../branch/hooks/useBranchesList'
import { CustomerFormModal } from '../form/CustomerFormModal'
import { useCustomerMutation } from '../hooks/useCustomerMutation'
import { usePagination } from '../../shared/hooks/usePagination'
import { useCustomersList } from '../hooks/useCustomersList'
import { DebtPaymentsList } from './DebtPaymentsList'
import { createCustomerImportParser } from './customerImport'
import { CustomerKpiBox } from './view/CustomerKpiBox'
import { createCustomerColumns } from './view/customerColumns'

type BalanceFilter = 'all' | 'debt' | 'credit' | 'zero'

type CustomerFiltersForm = {
  search: string
  balance: BalanceFilter
}

interface CustomersListProps {
  canManage: boolean
  isStoreOwner: boolean
  branchId?: string | null
  onOpenCustomer: (customer: Customer) => void
}

export function CustomersList({ canManage, isStoreOwner, branchId, onOpenCustomer }: CustomersListProps) {
  //
  const t = useStoreT()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') === 'payments' ? 'payments' : 'customers'
  const { control, watch } = useForm<CustomerFiltersForm>({
    defaultValues: {
      search: searchParams.get('q') ?? '',
      balance: getInitialBalanceFilter(searchParams.get('balance')),
    },
  })
  const filters = watch()

  const { page, pageSize, changePage, resetPage, rowIndex } = usePagination()
  const [editCustomer, setEditCustomer] = useState<Customer | null | undefined>(undefined)

  const {
    data: customers = [],
    isLoading,
    isFetching,
    refetch,
  } = useCustomersList({
    search: filters.search || undefined,
    branchId: branchId ?? undefined,
  })
  const { data: branches = [], isLoading: branchesLoading } = useBranchesList()
  const defaultCustomerBranchId = branchId ?? branches[0]?.id ?? ''
  const parseCustomerImportRow = useMemo(() => createCustomerImportParser(isStoreOwner, t), [isStoreOwner, t])
  const { createCustomer: createMutation, deactivateCustomer: deleteMutation } = useCustomerMutation(t, {
    showCreateSuccess: false,
  })

  const totalDebt = customers.reduce((sum, customer) => sum + (customer.balance > 0 ? customer.balance : 0), 0)
  const totalCredit = customers.reduce((sum, customer) => sum + (customer.balance < 0 ? -customer.balance : 0), 0)
  const filteredCustomers = useMemo(
    () =>
      customers.filter((customer) => {
        //
        if (filters.balance === 'debt') return customer.balance > 0
        if (filters.balance === 'credit') return customer.balance < 0
        if (filters.balance === 'zero') return customer.balance === 0
        return true
      }),
    [filters.balance, customers],
  )

  const syncBalanceFilterParam = (value: BalanceFilter) => {
    //
    const next = new URLSearchParams(searchParams)
    if (value === 'all') {
      next.delete('balance')
    } else {
      next.set('balance', value)
    }
    setSearchParams(next, { replace: true })
  }

  const syncSearchParam = (value: string) => {
    //
    setSearchParams((current) => {
      //
      const next = new URLSearchParams(current)
      if (value.trim()) next.set('q', value)
      else next.delete('q')
      next.delete('page')
      return next
    }, { replace: true })
  }

  const setActiveTab = (tab: 'customers' | 'payments') => {
    //
    const next = new URLSearchParams(searchParams)
    if (tab === 'payments') next.set('tab', 'payments')
    else next.delete('tab')
    setSearchParams(next, { replace: true })
    resetPage()
  }

  const previousBranchId = useRef(branchId)
  useEffect(() => {
    //
    if (previousBranchId.current === branchId) return
    previousBranchId.current = branchId
    resetPage()
  }, [branchId, resetPage])

  const columns = createCustomerColumns({
    t,
    rowIndex,
    canManage,
    deleting: deleteMutation.isPending,
    deletingId: deleteMutation.variables,
    onView: onOpenCustomer,
    onEdit: setEditCustomer,
    onDelete: (id) => deleteMutation.mutate(id),
  })

  return (
    <>
      <div className="page-head">
        <div>
          <h1>{t('nav.customers')}</h1>
          <div className="sub">
            {activeTab === 'customers'
              ? `${filteredCustomers.length} ${t('customers.subtitleSuffix')}`
              : t('customers.paymentsSubtitle')}
          </div>
        </div>
        {activeTab === 'customers' && <div className="u-flex u-gap-8">
          {canManage && (
            <>
              <Button type="primary" icon={<StoreIcon name="plus" size={16} />} onClick={() => setEditCustomer(null)}>
                {t('customers.newCustomer')}
              </Button>
              <ExcelImportButton<CreateCustomerPayload>
                t={t}
                entityLabel={t('nav.customers')}
                templateHeaders={['fullName', 'phone', 'address', 'balance', 'branchId']}
                templateExamples={[
                  ['Alisher Karimov', '+998901234567', 'Tashkent, Chilonzor', '0', isStoreOwner ? defaultCustomerBranchId : ''],
                  ['Nilufar Tosheva', '', '', '150000', isStoreOwner ? defaultCustomerBranchId : ''],
                ]}
                templateFileName="customers_template.xlsx"
                hints={
                  isStoreOwner
                    ? [
                        {
                          label: t('common.branch'),
                          items: branches.map((branch) => `${branch.name}: ${branch.id}`),
                        },
                      ]
                    : undefined
                }
                parseRow={parseCustomerImportRow}
                createFn={createMutation.mutateAsync}
                onComplete={() => refetch()}
              />
            </>
          )}
          <Tooltip title={t('common.refresh')}>
            <Button icon={<StoreIcon name="reload" size={16} className={isFetching ? 'ph-icon-spin' : undefined} />} onClick={() => refetch()} />
          </Tooltip>
        </div>}
      </div>

      <div className="customer-tabs" role="tablist" aria-label={t('nav.customers')}>
        <button type="button" role="tab" aria-selected={activeTab === 'customers'} className={activeTab === 'customers' ? 'is-active' : ''} onClick={() => setActiveTab('customers')}>{t('customers.tabCustomers')}</button>
        <button type="button" role="tab" aria-selected={activeTab === 'payments'} className={activeTab === 'payments' ? 'is-active' : ''} onClick={() => setActiveTab('payments')}>{t('customers.tabPayments')}</button>
      </div>

      {activeTab === 'customers' ? <><div className="u-grid u-gap-12 u-grid-cols-3 u-mb-16">
        <CustomerKpiBox
          label={t('customers.kpiTotalDebt')}
          value={<MoneyDisplay amount={totalDebt} currency="UZS" />}
          hint={`${customers.filter((customer) => customer.balance > 0).length} ${t('customers.subtitleSuffix2')}`}
          tone="danger"
        />
        <CustomerKpiBox
          label={t('customers.kpiCredit')}
          value={<MoneyDisplay amount={totalCredit} currency="UZS" />}
          hint={`${customers.filter((customer) => customer.balance < 0).length} ${t('customers.subtitleSuffix2')}`}
          tone="success"
        />
        <CustomerKpiBox
          label={t('customers.kpiNet')}
          value={<MoneyDisplay amount={totalDebt - totalCredit} currency="UZS" />}
          hint={`${customers.length} ${t('common.total')}`}
          tone="muted"
        />
      </div>

      <div className="card u-overflow-hidden u-p-0" >
        <div className="u-items-center u-border-b-default u-flex u-gap-10 u-p-14-16">
          <Controller
            name="search"
            control={control}
            render={({ field }) => (
              <Input
                prefix={<StoreIcon name="search" size={16} />}
                placeholder={t('customers.searchPlaceholder')}
                value={field.value}
                onChange={(event) => {
                  //
                  field.onChange(event.target.value)
                  syncSearchParam(event.target.value)
                }}
                allowClear
                className="u-max-w-320"
              />
            )}
          />
          <Controller
            name="balance"
            control={control}
            render={({ field }) => (
              <Select<BalanceFilter>
                value={field.value}
                onChange={(value) => {
                  //
                  field.onChange(value)
                  syncBalanceFilterParam(value)
                  resetPage()
                }}
                className="u-w-190"
                options={[
                  { value: 'all', label: t('customers.filterAllBalances') },
                  { value: 'debt', label: t('customers.filterDebt') },
                  { value: 'credit', label: t('customers.filterCredit') },
                  { value: 'zero', label: t('customers.filterZero') },
                ]}
              />
            )}
          />
          <span className="u-text-muted u-fs-12-5 u-ml-auto">
            <strong>{filteredCustomers.length}</strong> {t('common.resultsSuffix')}
          </span>
        </div>

        <DataTable<Customer>
          rowKey="id"
          dataSource={filteredCustomers}
          columns={columns}
          loading={isLoading}
          pagination={{
            current: page,
            pageSize,
            onChange: changePage,
            showSizeChanger: true,
            showTotal: (total) => `${total} ${t('common.countSuffix')}`,
            pageSizeOptions: ['10', '25', '50'],
          }}
          onRow={(customer) => ({
            onClick: () => onOpenCustomer(customer),
            className: 'clickable-row',
          })}
          emptyText={t('customers.empty')}
        />
      </div>

      <CustomerFormModal
        t={t}
        open={editCustomer !== undefined}
        customer={editCustomer ?? null}
        onClose={() => setEditCustomer(undefined)}
        isStoreOwner={isStoreOwner}
        branchId={branchId}
        branches={branches}
        branchesLoading={branchesLoading}
      />
      </> : <DebtPaymentsList t={t} branchId={branchId} />}
    </>
  )
}

function getInitialBalanceFilter(value: string | null): BalanceFilter {
  //
  if (value === 'debt' || value === 'credit' || value === 'zero') return value
  return 'all'
}
