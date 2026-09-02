import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Controller, useForm } from 'react-hook-form'
import { Button, Input, Select, Tooltip } from 'antd'
import {
  ArrowClockwiseIcon,
  MagnifyingGlassIcon,
  PlusIcon,
} from '@phosphor-icons/react'
import { DataTable } from '@store/store-shared/ui/data-table'
import { ExcelImportButton } from '@store/store-shared/ui/excel-import-button'
import { MoneyDisplay } from '@store/store-shared/ui/money-display'
import type { CreateCustomerPayload, Customer } from '@store/store-stub'
import { useBranchesList } from '../../branch/hooks/useBranchesList'
import { usePagination } from '../../shared/hooks/usePagination'
import { CustomerDetailDrawer } from '../detail/CustomerDetailDrawer'
import { CustomerFormModal } from '../form/CustomerFormModal'
import { useCustomerMutation } from '../hooks/useCustomerMutation'
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
  t: (key: string) => string
  canManage: boolean
  isStoreOwner: boolean
  branchId?: string | null
}

export function CustomersList({ t, canManage, isStoreOwner, branchId }: CustomersListProps) {
  //
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') === 'payments' ? 'payments' : 'customers'
  const { page, pageSize, onChange: onPageChange, rowIndex } = usePagination()
  const { control, watch } = useForm<CustomerFiltersForm>({
    defaultValues: {
      search: '',
      balance: getInitialBalanceFilter(searchParams.get('balance')),
    },
  })
  const filters = watch()

  const [drawerCustomer, setDrawerCustomer] = useState<Customer | null>(null)
  const [editCustomer, setEditCustomer] = useState<Customer | null | undefined>(undefined)

  const { data: customers = [], isLoading, isFetching, refetch } = useCustomersList({
    search: filters.search || undefined,
    branchId: branchId ?? undefined,
  })
  const { data: branches = [], isLoading: branchesLoading } = useBranchesList()
  const defaultCustomerBranchId = branchId ?? branches[0]?.id ?? ''
  const parseCustomerImportRow = useMemo(() => createCustomerImportParser(isStoreOwner), [isStoreOwner])
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

  const setActiveTab = (tab: 'customers' | 'payments') => {
    //
    const next = new URLSearchParams(searchParams)
    if (tab === 'payments') next.set('tab', 'payments')
    else next.delete('tab')
    setSearchParams(next, { replace: true })
    onPageChange(1, pageSize)
  }

  useEffect(() => {
    onPageChange(1, pageSize)
  }, [branchId, onPageChange, pageSize])

  const columns = createCustomerColumns({
    t,
    rowIndex,
    canManage,
    deleting: deleteMutation.isPending,
    deletingId: deleteMutation.variables,
    onView: setDrawerCustomer,
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
        {activeTab === 'customers' && <div style={{ display: 'flex', gap: 8 }}>
          {canManage && (
            <>
              <Button type="primary" icon={<PlusIcon size={13} weight="bold" />} onClick={() => setEditCustomer(null)}>
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
            <Button icon={<ArrowClockwiseIcon size={18} className={isFetching ? 'ph-icon-spin' : undefined} />} onClick={() => refetch()} />
          </Tooltip>
        </div>}
      </div>

      <div className="customer-tabs" role="tablist" aria-label={t('nav.customers')}>
        <button type="button" role="tab" aria-selected={activeTab === 'customers'} className={activeTab === 'customers' ? 'is-active' : ''} onClick={() => setActiveTab('customers')}>{t('customers.tabCustomers')}</button>
        <button type="button" role="tab" aria-selected={activeTab === 'payments'} className={activeTab === 'payments' ? 'is-active' : ''} onClick={() => setActiveTab('payments')}>{t('customers.tabPayments')}</button>
      </div>

      {activeTab === 'customers' ? <><div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
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

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'flex', gap: 10, padding: '14px 16px', borderBottom: '1px solid var(--border)', alignItems: 'center' }}>
          <Controller
            name="search"
            control={control}
            render={({ field }) => (
              <Input
                prefix={<MagnifyingGlassIcon size={18} />}
                placeholder={t('customers.searchPlaceholder')}
                value={field.value}
                onChange={(event) => {
                  //
                  field.onChange(event.target.value)
                  onPageChange(1, pageSize)
                }}
                allowClear
                style={{ maxWidth: 320 }}
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
                  onPageChange(1, pageSize)
                }}
                style={{ width: 190 }}
                options={[
                  { value: 'all', label: t('customers.filterAllBalances') },
                  { value: 'debt', label: t('customers.filterDebt') },
                  { value: 'credit', label: t('customers.filterCredit') },
                  { value: 'zero', label: t('customers.filterZero') },
                ]}
              />
            )}
          />
          <span style={{ marginLeft: 'auto', color: 'var(--ink-3)', fontSize: 12.5 }}>
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
            onChange: onPageChange,
            showSizeChanger: true,
            showTotal: (total) => `${total} ${t('common.countSuffix')}`,
            pageSizeOptions: ['10', '25', '50'],
          }}
          onRow={(customer) => ({
            onClick: () => setDrawerCustomer(customer),
            style: { cursor: 'pointer' },
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

      <CustomerDetailDrawer t={t} customer={drawerCustomer} onClose={() => setDrawerCustomer(null)} />
      </> : <DebtPaymentsList t={t} branchId={branchId} />}
    </>
  )
}

function getInitialBalanceFilter(value: string | null): BalanceFilter {
  //
  if (value === 'debt' || value === 'credit' || value === 'zero') return value
  return 'all'
}
