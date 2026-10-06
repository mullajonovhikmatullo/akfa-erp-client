import { StoreIcon } from '@store/store-shared/ui/store-icon'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Button, DatePicker, Select, Tooltip } from 'antd'

import dayjs, { type Dayjs } from 'dayjs'
import { useStoreT } from '@store/store-i18n'
import type { Expense } from '@store/store-stub'
import { CategoryManagerDrawer } from '../category/CategoryManagerDrawer'
import { ExpenseFormModal } from '../form/ExpenseFormModal'
import { useExpenseCategoriesList } from '../hooks/useExpenseCategoriesList'
import { useExpenseCategorySummary } from '../hooks/useExpenseCategorySummary'
import { useExpenseMutation } from '../hooks/useExpenseMutation'
import { useExpensesPage } from '../hooks/useExpensesPage'
import { usePagination } from '../../shared/hooks/usePagination'
import { getExpenseMetrics } from '../lib/expenseMetrics'
import { ExpenseBreakdown } from './view/ExpenseBreakdown'
import { ExpenseDescriptionModal } from './view/ExpenseDescriptionModal'
import { ExpenseKpiCards } from './view/ExpenseKpiCards'
import { createExpenseColumns } from './view/expenseColumns'
import { DataTable } from '@store/store-shared/ui/data-table'

const KPI_CATEGORY_LIMIT = 5

type ExpenseFiltersForm = {
  categoryId?: string
  dateRange: [Dayjs | null, Dayjs | null]
}

interface ExpensesListProps {
  isStoreOwner: boolean
  branchId?: string
  exchangeRate: number
}

export function ExpensesList({ isStoreOwner, branchId, exchangeRate }: ExpensesListProps) {
  //
  const t = useStoreT()
  const { page, pageSize, changePage, goToPage, resetPage, rowIndex } = usePagination()
  const { control, watch } = useForm<ExpenseFiltersForm>({
    defaultValues: {
      categoryId: undefined,
      dateRange: [null, null],
    },
  })
  const filters = watch()

  const [creating, setCreating] = useState(false)
  const [managingCategories, setManagingCategories] = useState(false)
  const [viewingExpense, setViewingExpense] = useState<Expense | null>(null)
  const dateRange = filters.dateRange
  const dateFilters = {
    from: dateRange[0]?.startOf('day').toISOString(),
    to: dateRange[1]?.endOf('day').toISOString(),
  }

  const expensesQuery = useExpensesPage({
    branchId,
    categoryId: filters.categoryId,
    ...dateFilters,
    page,
    pageSize,
  })
  const { isLoading, isFetching, refetch } = expensesQuery
  const expenses = useMemo(() => expensesQuery.data?.items ?? [], [expensesQuery.data])
  const total = expensesQuery.data?.total ?? 0
  const lastPage = Math.max(1, Math.ceil(total / pageSize))
  const filterKey = [branchId, filters.categoryId, dateFilters.from, dateFilters.to].join('|')
  const previousFilterKey = useRef(filterKey)

  useEffect(() => {
    //
    if (previousFilterKey.current === filterKey) return
    previousFilterKey.current = filterKey
    resetPage()
  }, [filterKey, resetPage])

  useEffect(() => {
    //
    if (expensesQuery.isPlaceholderData || !expensesQuery.data) return
    if (page > lastPage) goToPage(lastPage)
  }, [expensesQuery.data, expensesQuery.isPlaceholderData, goToPage, lastPage, page])
  const {
    data: categorySummary,
    isFetching: isSummaryFetching,
    refetch: refetchCategorySummary,
  } = useExpenseCategorySummary({
    branchId,
    categoryId: filters.categoryId,
    ...dateFilters,
    limit: KPI_CATEGORY_LIMIT,
  })

  const { data: categories = [] } = useExpenseCategoriesList()
  const { deleteExpense } = useExpenseMutation(t)

  const { grandTotal, byCategory, kpiCategories } = useMemo(
    () =>
      getExpenseMetrics({
        expenses,
        categories,
        summary: categorySummary,
        kpiCategoryLimit: KPI_CATEGORY_LIMIT,
        otherLabel: t('common.other'),
      }),
    [categories, categorySummary, expenses, t],
  )

  const columns = createExpenseColumns({
    t,
    rowIndex,
    deleting: deleteExpense.isPending,
    deletingId: deleteExpense.variables,
    onDelete: (id) => deleteExpense.mutate(id),
    onViewDescription: setViewingExpense,
  })

  return (
    <>
      <div className="page-head">
        <div>
          <h1>{t('nav.expenses')}</h1>
          <div className="sub">
            {total} {t('expenses.subtitleRecords')} · {categories.length} {t('expenses.subtitleCategories')}
          </div>
        </div>
        <div className="u-items-center u-flex u-flex-wrap u-gap-8">
          <Button type="primary" icon={<StoreIcon name="plus" size={16} />} onClick={() => setCreating(true)}>
            {t('expenses.newExpense')}
          </Button>
          {isStoreOwner ? (
            <Button icon={<StoreIcon name="tag" size={16} />} onClick={() => setManagingCategories(true)}>
              {t('nav.categories')}
            </Button>
          ) : null}
          <Controller
            name="dateRange"
            control={control}
            render={({ field }) => (
              <DatePicker.RangePicker
                value={field.value}
                onChange={(value) => {
                  field.onChange(value ? [value[0], value[1]] : [null, null])
                }}
                format="DD.MM.YYYY"
                placeholder={[t('common.startDate'), t('common.endDate')]}
                presets={[
                  { label: t('common.today'), value: [dayjs().startOf('day'), dayjs().endOf('day')] },
                  { label: t('common.thisMonth'), value: [dayjs().startOf('month'), dayjs().endOf('day')] },
                  { label: t('analytics.last7Days'), value: [dayjs().subtract(7, 'day').startOf('day'), dayjs().endOf('day')] },
                  { label: t('analytics.last30Days'), value: [dayjs().subtract(30, 'day').startOf('day'), dayjs().endOf('day')] },
                ]}
                className="u-min-w-240"
              />
            )}
          />
          <Tooltip title={t('common.refresh')}>
            <Button
              icon={<StoreIcon name="reload" size={16} className={isFetching || isSummaryFetching ? 'ph-icon-spin' : undefined} />}
              onClick={() => {
                //
                refetch()
                refetchCategorySummary()
              }}
            />
          </Tooltip>
        </div>
      </div>

      <ExpenseKpiCards items={kpiCategories} grandTotal={grandTotal} t={t} />

      <div className="u-items-start u-grid u-gap-12 u-grid-cols-content-280">
        <div className="card u-overflow-hidden u-p-0" >
          <div
            className="u-items-center u-border-b-default u-flex u-gap-10 u-p-14-16"
          >
            <Controller
              name="categoryId"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onChange={(value) => {
                    field.onChange(value)
                  }}
                  allowClear
                  placeholder={t('expenses.filterAll')}
                  className="u-min-w-220"
                  options={categories.map((category) => ({ value: category.id, label: category.name }))}
                />
              )}
            />
            <span className="u-text-muted u-fs-12-5 u-ml-auto">
              <strong>{total}</strong> {t('common.resultsSuffix')}
            </span>
          </div>

          <DataTable<Expense>
            rowKey="id"
            dataSource={expenses}
            columns={columns}
            loading={isLoading || (isFetching && expensesQuery.isPlaceholderData)}
            pagination={{
              current: page,
              pageSize,
              total,
              onChange: changePage,
              showTotal: (count: number) => `${count} ${t('common.countSuffix')}`,
            }}
            emptyText={t('expenses.empty')}
          />
        </div>

        <ExpenseBreakdown items={byCategory} grandTotal={grandTotal} t={t} />
      </div>

      <ExpenseDescriptionModal t={t} expense={viewingExpense} onClose={() => setViewingExpense(null)} />
      <ExpenseFormModal t={t} exchangeRate={exchangeRate} branchId={branchId} open={creating} onClose={() => setCreating(false)} />
      <CategoryManagerDrawer t={t} open={managingCategories} onClose={() => setManagingCategories(false)} />
    </>
  )
}
