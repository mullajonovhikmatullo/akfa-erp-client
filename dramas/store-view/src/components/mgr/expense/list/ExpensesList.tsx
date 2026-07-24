import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Button, DatePicker, Popconfirm, Select, Tooltip } from 'antd'
import { ArrowClockwiseIcon, PlusIcon, TagIcon, TrashIcon } from '@phosphor-icons/react'
import dayjs, { type Dayjs } from 'dayjs'
import { formatDate } from '@store/store-shared/lib/formatters'
import { DataTable, type ColumnDef } from '@store/store-shared/ui/data-table'
import { MoneyDisplay } from '@store/store-shared/ui/money-display'
import { StatusBadge } from '@store/store-shared/ui/status-badge'
import type { Expense } from '@store/store-stub'
import { CategoryManagerDrawer } from '../category/CategoryManagerDrawer'
import { ExpenseFormModal } from '../form/ExpenseFormModal'
import {
  useDeleteExpense,
  useExpenseCategories,
  useExpenseCategorySummary,
  useExpenses,
} from '../hooks/useExpenses'
import { usePagination } from '../../shared/hooks/usePagination'

const KPI_CATEGORY_LIMIT = 5

type ExpenseFiltersForm = {
  categoryId?: string
  dateRange: [Dayjs | null, Dayjs | null]
}

interface ExpensesListProps {
  t: (key: string) => string
  isSuper: boolean
  exchangeRate: number
}

export function ExpensesList({ t, isSuper, exchangeRate }: ExpensesListProps) {
  //
  const { page, pageSize, onChange: onPageChange, rowIndex } = usePagination()
  const { control, watch } = useForm<ExpenseFiltersForm>({
    defaultValues: {
      categoryId: undefined,
      dateRange: [null, null],
    },
  })
  const filters = watch()

  const [creating, setCreating] = useState(false)
  const [managingCategories, setManagingCategories] = useState(false)
  const dateRange = filters.dateRange
  const dateFilters = {
    from: dateRange[0]?.startOf('day').toISOString(),
    to: dateRange[1]?.endOf('day').toISOString(),
  }

  const {
    data: expenses = [],
    isLoading,
    isFetching,
    refetch,
  } = useExpenses({
    categoryId: filters.categoryId,
    ...dateFilters,
    limit: 200,
  })
  const {
    data: categorySummary,
    isFetching: isSummaryFetching,
    refetch: refetchCategorySummary,
  } = useExpenseCategorySummary({
    categoryId: filters.categoryId,
    ...dateFilters,
    limit: KPI_CATEGORY_LIMIT,
  })

  const { data: categories = [] } = useExpenseCategories()
  const deleteExpense = useDeleteExpense()

  const fallbackGrandTotal = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const fallbackByCategory = categories
    .map((category) => ({
      ...category,
      total: expenses.filter((expense) => expense.category.id === category.id).reduce((sum, expense) => sum + expense.amount, 0),
    }))
    .filter((category) => category.total > 0)
    .sort((a, b) => b.total - a.total)
  const grandTotal = categorySummary?.total ?? fallbackGrandTotal
  const byCategory =
    categorySummary?.categories.map((category) => ({
      id: category.categoryId,
      name: category.categoryName,
      total: category.amount,
    })) ?? fallbackByCategory
  const kpiCategories =
    categorySummary?.kpiCategories.map((category) => ({
      id: category.isOther ? 'other-expense-categories' : category.categoryId,
      name: category.isOther ? t('common.other') : category.categoryName,
      total: category.amount,
    })) ??
    (byCategory.length > KPI_CATEGORY_LIMIT
      ? [
          ...byCategory.slice(0, KPI_CATEGORY_LIMIT - 1),
          {
            id: 'other-expense-categories',
            name: t('common.other'),
            total: byCategory.slice(KPI_CATEGORY_LIMIT - 1).reduce((sum, category) => sum + category.total, 0),
          },
        ]
      : byCategory)

  const columns: ColumnDef<Expense>[] = [
    {
      title: '#',
      key: '_idx',
      width: 40,
      render: (_: unknown, __: Expense, index: number) => (
        <span style={{ color: 'var(--ink-4)', fontSize: 11, fontVariantNumeric: 'tabular-nums' }}>{rowIndex(index)}</span>
      ),
    },
    {
      title: t('common.date'),
      dataIndex: 'expenseDate',
      width: 120,
      render: (value: string) => <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>{formatDate(value)}</span>,
    },
    {
      title: t('nav.categories'),
      key: 'category',
      width: 180,
      render: (_: unknown, expense: Expense) => <StatusBadge tone="muted">{expense.category.name}</StatusBadge>,
    },
    {
      title: t('common.branch'),
      key: 'branch',
      width: 150,
      responsiveHide: true,
      render: (_: unknown, expense: Expense) => <StatusBadge tone="info">{expense.branch.name}</StatusBadge>,
    },
    {
      title: t('expenses.colNote'),
      dataIndex: 'description',
      render: (value: string | null) =>
        value ? (
          <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>{value}</span>
        ) : (
          <span style={{ color: 'var(--ink-4)' }}>-</span>
        ),
    },
    {
      title: t('expenses.colAmount'),
      key: 'amount',
      width: 190,
      align: 'right',
      render: (_: unknown, expense: Expense) => (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
          <span className="num" style={{ fontWeight: 700 }}>
            <MoneyDisplay amount={expense.currency === 'USD' ? expense.amountUsd : expense.amount} currency={expense.currency} />
          </span>
          {expense.currency === 'USD' ? (
            <span style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>
              <MoneyDisplay amount={expense.amount} currency="UZS" /> · {expense.usdToUzsRate?.toLocaleString('ru-RU')} UZS
            </span>
          ) : null}
        </div>
      ),
    },
    {
      title: t('common.enteredBy'),
      key: 'createdBy',
      width: 150,
      responsiveHide: true,
      render: (_: unknown, expense: Expense) => (
        <span style={{ fontSize: 12.5, color: 'var(--ink-3)' }}>{expense.createdBy.fullName}</span>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 60,
      fixed: 'right',
      render: (_: unknown, expense: Expense) => (
        <Popconfirm
          title={t('common.deleteTitle')}
          description={t('expenses.deleteDesc')}
          okText={t('common.yes')}
          cancelText={t('common.cancel')}
          okButtonProps={{
            danger: true,
            loading: deleteExpense.isPending && deleteExpense.variables === expense.id,
          }}
          onConfirm={(event) => {
            //
            event?.stopPropagation()
            deleteExpense.mutate(expense.id)
          }}
          onPopupClick={(event) => event.stopPropagation()}
        >
          <Button
            size="small"
            type="text"
            danger
            icon={<TrashIcon size={18} />}
            loading={deleteExpense.isPending && deleteExpense.variables === expense.id}
            onClick={(event) => event.stopPropagation()}
          />
        </Popconfirm>
      ),
    },
  ]

  return (
    <>
      <div className="page-head">
        <div>
          <h1>{t('nav.expenses')}</h1>
          <div className="sub">
            {expenses.length} {t('expenses.subtitleRecords')} · {categories.length} {t('expenses.subtitleCategories')}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <Controller
            name="dateRange"
            control={control}
            render={({ field }) => (
              <DatePicker.RangePicker
                value={field.value}
                onChange={(value) => field.onChange(value ? [value[0], value[1]] : [null, null])}
                format="DD.MM.YYYY"
                placeholder={[t('common.startDate'), t('common.endDate')]}
                presets={[
                  { label: t('common.today'), value: [dayjs().startOf('day'), dayjs().endOf('day')] },
                  { label: t('common.thisMonth'), value: [dayjs().startOf('month'), dayjs().endOf('day')] },
                  { label: t('analytics.last7Days'), value: [dayjs().subtract(7, 'day').startOf('day'), dayjs().endOf('day')] },
                  { label: t('analytics.last30Days'), value: [dayjs().subtract(30, 'day').startOf('day'), dayjs().endOf('day')] },
                ]}
                style={{ minWidth: 240 }}
              />
            )}
          />
          <Tooltip title={t('common.refresh')}>
            <Button
              icon={<ArrowClockwiseIcon size={18} className={isFetching || isSummaryFetching ? 'ph-icon-spin' : undefined} />}
              onClick={() => {
                //
                refetch()
                refetchCategorySummary()
              }}
            />
          </Tooltip>
          {isSuper ? (
            <Button icon={<TagIcon size={18} />} onClick={() => setManagingCategories(true)}>
              {t('nav.categories')}
            </Button>
          ) : null}
          <Button type="primary" icon={<PlusIcon size={18} weight="bold" />} onClick={() => setCreating(true)}>
            {t('expenses.newExpense')}
          </Button>
        </div>
      </div>

      {kpiCategories.length > 0 ? (
        <div
          style={{
            display: 'flex',
            gap: 12,
            marginBottom: 16,
            overflowX: 'auto',
            paddingBottom: 4,
            scrollSnapType: 'x proximity',
          }}
        >
          {kpiCategories.map((category) => {
            //
            const pct = grandTotal > 0 ? (category.total / grandTotal) * 100 : 0
            return (
              <div
                key={category.id}
                className="card"
                style={{
                  padding: '14px 16px',
                  flex: '1 0 190px',
                  minWidth: 190,
                  maxWidth: 240,
                  scrollSnapAlign: 'start',
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: 'var(--ink-3)',
                    textTransform: 'uppercase',
                    letterSpacing: '.06em',
                    marginBottom: 6,
                  }}
                >
                  {category.name}
                </div>
                <div className="num" style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>
                  <MoneyDisplay amount={category.total} currency="UZS" />
                </div>
                <div style={{ height: 4, borderRadius: 2, background: 'var(--border)', overflow: 'hidden', marginBottom: 4 }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: 'var(--primary)', borderRadius: 2 }} />
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>
                  {pct.toFixed(0)}% {t('expenses.pctSuffix')}
                </div>
              </div>
            )
          })}
        </div>
      ) : null}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16, alignItems: 'flex-start' }}>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div
            style={{
              display: 'flex',
              gap: 10,
              padding: '14px 16px',
              borderBottom: '1px solid var(--border)',
              alignItems: 'center',
            }}
          >
            <Controller
              name="categoryId"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onChange={field.onChange}
                  allowClear
                  placeholder={t('expenses.filterAll')}
                  style={{ minWidth: 220 }}
                  options={categories.map((category) => ({ value: category.id, label: category.name }))}
                />
              )}
            />
            <span style={{ marginLeft: 'auto', color: 'var(--ink-3)', fontSize: 12.5 }}>
              <strong>{expenses.length}</strong> {t('common.resultsSuffix')}
            </span>
          </div>

          <DataTable<Expense>
            rowKey="id"
            dataSource={expenses}
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
            emptyText={t('expenses.empty')}
          />
        </div>

        <div className="card" style={{ position: 'sticky', top: 76 }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14 }}>{t('expenses.breakdown')}</div>
          {byCategory.length === 0 ? (
            <div style={{ color: 'var(--ink-3)', fontSize: 13 }}>{t('common.noData')}</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {byCategory.map((category) => {
                //
                const pct = grandTotal > 0 ? (category.total / grandTotal) * 100 : 0
                return (
                  <div key={category.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 4 }}>
                      <span style={{ color: 'var(--ink-2)', fontWeight: 500 }}>{category.name}</span>
                      <span className="num" style={{ color: 'var(--ink-3)' }}>{pct.toFixed(0)}%</span>
                    </div>
                    <div style={{ height: 5, borderRadius: 3, background: 'var(--border)', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: 'var(--primary)', borderRadius: 3 }} />
                    </div>
                    <div className="num" style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 2 }}>
                      <MoneyDisplay amount={category.total} currency="UZS" />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
          <div style={{ borderTop: '1px solid var(--border)', margin: '14px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
            <span style={{ color: 'var(--ink-3)' }}>{t('common.total')}</span>
            <span className="num" style={{ fontWeight: 700 }}>
              <MoneyDisplay amount={grandTotal} currency="UZS" />
            </span>
          </div>
        </div>
      </div>

      <ExpenseFormModal t={t} exchangeRate={exchangeRate} open={creating} onClose={() => setCreating(false)} />
      <CategoryManagerDrawer t={t} open={managingCategories} onClose={() => setManagingCategories(false)} />
    </>
  )
}
