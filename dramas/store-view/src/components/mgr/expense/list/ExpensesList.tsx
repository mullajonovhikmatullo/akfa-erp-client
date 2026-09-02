import { useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Button, DatePicker, Select, Tooltip } from 'antd'

import dayjs, { type Dayjs } from 'dayjs'
import type { Expense } from '@store/store-stub'
import { CategoryManagerDrawer } from '../category/CategoryManagerDrawer'
import { ExpenseFormModal } from '../form/ExpenseFormModal'
import { useExpenseCategoriesList } from '../hooks/useExpenseCategoriesList'
import { useExpenseCategorySummary } from '../hooks/useExpenseCategorySummary'
import { useExpenseMutation } from '../hooks/useExpenseMutation'
import { useExpensesList } from '../hooks/useExpensesList'
import { getExpenseMetrics } from '../lib/expenseMetrics'
import { ExpenseBreakdown } from './view/ExpenseBreakdown'
import { ExpenseKpiCards } from './view/ExpenseKpiCards'
import { createExpenseColumns } from './view/expenseColumns'
import { DataTable } from '@store/store-shared/ui/data-table'

const KPI_CATEGORY_LIMIT = 5

type ExpenseFiltersForm = {
  categoryId?: string
  dateRange: [Dayjs | null, Dayjs | null]
}

interface ExpensesListProps {
  t: (key: string) => string
  isStoreOwner: boolean
  branchId?: string
  exchangeRate: number
}

export function ExpensesList({ t, isStoreOwner, branchId, exchangeRate }: ExpensesListProps) {
  //
  const rowIndex = (index: number) => index + 1
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
  } = useExpensesList({
    branchId,
    categoryId: filters.categoryId,
    ...dateFilters,
    limit: 200,
  })
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
  })

  return (
    <>
      <div className="page-head">
        <div>
          <h1>{t('nav.expenses')}</h1>
          <div className="sub">
            {expenses.length} {t('expenses.subtitleRecords')} · {categories.length} {t('expenses.subtitleCategories')}
          </div>
        </div>
        <div className="u-items-center u-flex u-flex-wrap u-gap-8">
          <Button type="primary" icon={<i className="icons-plus icon-size-13" />} onClick={() => setCreating(true)}>
            {t('expenses.newExpense')}
          </Button>
          {isStoreOwner ? (
            <Button icon={<i className="icons-tag icon-size-13" />} onClick={() => setManagingCategories(true)}>
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
              icon={<i className={['icons-reload icon-size-18', isFetching || isSummaryFetching ? 'ph-icon-spin' : undefined].filter(Boolean).join(' ')} />}
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
              <strong>{expenses.length}</strong> {t('common.resultsSuffix')}
            </span>
          </div>

          <DataTable<Expense>
            rowKey="id"
            dataSource={expenses}
            columns={columns}
            loading={isLoading}
            pagination={false}
            emptyText={t('expenses.empty')}
          />
        </div>

        <ExpenseBreakdown items={byCategory} grandTotal={grandTotal} t={t} />
      </div>

      <ExpenseFormModal t={t} exchangeRate={exchangeRate} branchId={branchId} open={creating} onClose={() => setCreating(false)} />
      <CategoryManagerDrawer t={t} open={managingCategories} onClose={() => setManagingCategories(false)} />
    </>
  )
}
