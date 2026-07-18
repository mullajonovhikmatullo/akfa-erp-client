import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Button, DatePicker, Select, Popconfirm, Tooltip } from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  AppstoreOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import dayjs, { type Dayjs } from 'dayjs';
import {
  useExpenses,
  useExpenseCategories,
  useExpenseCategorySummary,
  useDeleteExpense,
} from '@/entities/expense';
import { ExpenseFormModal, CategoryManagerDrawer } from '@/features/create-expense';
import { DataTable, StatusBadge, MoneyDisplay } from '@/shared/ui';
import { useCurrentUser } from '@/entities/user';
import type { Expense } from '@/shared/types/domain';
import type { ColumnDef } from '@/shared/ui';
import { formatDate } from '@/shared/lib/formatters';
import { usePagination } from '@/shared/lib/usePagination';
import { useT } from '@/shared/lib/i18n';

const KPI_CATEGORY_LIMIT = 5;

type ExpenseFiltersForm = {
  categoryId?: string;
  dateRange: [Dayjs | null, Dayjs | null];
};

export function ExpensesPage() {
  const t = useT();
  const { isSuper } = useCurrentUser();
  const { page, pageSize, onChange: onPageChange, rowIndex } = usePagination();
  const { control, watch } = useForm<ExpenseFiltersForm>({
    defaultValues: {
      categoryId: undefined,
      dateRange: [null, null],
    },
  });
  const filters = watch();

  const [creating, setCreating] = useState(false);
  const [managingCats, setManagingCats] = useState(false);
  const dateRange = filters.dateRange;
  const dateFilters = {
    from: dateRange[0]?.startOf('day').toISOString(),
    to: dateRange[1]?.endOf('day').toISOString(),
  };

  const { data: expenses = [], isLoading, isFetching, refetch } = useExpenses({
    categoryId: filters.categoryId,
    ...dateFilters,
    limit: 200,
  });
  const {
    data: categorySummary,
    isFetching: isSummaryFetching,
    refetch: refetchCategorySummary,
  } = useExpenseCategorySummary({
    categoryId: filters.categoryId,
    ...dateFilters,
    limit: KPI_CATEGORY_LIMIT,
  });

  const { data: categories = [] } = useExpenseCategories();
  const deleteMutation = useDeleteExpense();

  // Breakdown by category
  const fallbackGrandTotal = expenses.reduce((sum, e) => sum + e.amount, 0);
  const fallbackByCat = categories
    .map((c) => ({
      ...c,
      total: expenses.filter((e) => e.category.id === c.id).reduce((sum, e) => sum + e.amount, 0),
    }))
    .filter((c) => c.total > 0)
    .sort((a, b) => b.total - a.total);
  const grandTotal = categorySummary?.total ?? fallbackGrandTotal;
  const byCat = categorySummary?.categories.map((c) => ({
    id: c.categoryId,
    name: c.categoryName,
    total: c.amount,
  })) ?? fallbackByCat;
  const kpiCats = categorySummary?.kpiCategories.map((c) => ({
    id: c.isOther ? 'other-expense-categories' : c.categoryId,
    name: c.isOther ? t('common.other') : c.categoryName,
    total: c.amount,
  })) ?? (byCat.length > KPI_CATEGORY_LIMIT
    ? [
      ...byCat.slice(0, KPI_CATEGORY_LIMIT - 1),
      {
        id: 'other-expense-categories',
        name: t('common.other'),
        total: byCat.slice(KPI_CATEGORY_LIMIT - 1).reduce((sum, c) => sum + c.total, 0),
      },
    ]
    : byCat);

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
      render: (v: string) => (
        <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>{formatDate(v)}</span>
      ),
    },
    {
      title: t('nav.categories'),
      key: 'category',
      width: 180,
      render: (_: unknown, e: Expense) => (
        <StatusBadge tone="muted">{e.category.name}</StatusBadge>
      ),
    },
    {
      title: t('common.branch'),
      key: 'branch',
      width: 150,
      responsiveHide: true,
      render: (_: unknown, e: Expense) => (
        <StatusBadge tone="info">{e.branch.name}</StatusBadge>
      ),
    },
    {
      title: t('expenses.colNote'),
      dataIndex: 'description',
      render: (v: string | null) =>
        v ? (
          <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>{v}</span>
        ) : (
          <span style={{ color: 'var(--ink-4)' }}>—</span>
        ),
    },
    {
      title: t('expenses.colAmount'),
      key: 'amount',
      width: 190,
      align: 'right',
      render: (_: unknown, e: Expense) => (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
          <span className="num" style={{ fontWeight: 700 }}>
            <MoneyDisplay amount={e.currency === 'USD' ? e.amountUsd : e.amount} currency={e.currency} />
          </span>
          {e.currency === 'USD' && (
            <span style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>
              <MoneyDisplay amount={e.amount} currency="UZS" /> · {e.usdToUzsRate?.toLocaleString('ru-RU')} UZS
            </span>
          )}
        </div>
      ),
    },
    {
      title: t('common.enteredBy'),
      key: 'createdBy',
      width: 150,
      responsiveHide: true,
      render: (_: unknown, e: Expense) => (
        <span style={{ fontSize: 12.5, color: 'var(--ink-3)' }}>{e.createdBy.fullName}</span>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 60,
      fixed: 'right',
      render: (_: unknown, e: Expense) => (
        <Popconfirm
          title={t('common.deleteTitle')}
          description={t('expenses.deleteDesc')}
          okText={t('common.yes')}
          cancelText={t('common.cancel')}
          okButtonProps={{ danger: true, loading: deleteMutation.isPending && deleteMutation.variables === e.id }}
          onConfirm={(ev) => { ev?.stopPropagation(); deleteMutation.mutate(e.id); }}
          onPopupClick={(ev) => ev.stopPropagation()}
        >
          <Button
            size="small"
            type="text"
            danger
            icon={<DeleteOutlined />}
            loading={deleteMutation.isPending && deleteMutation.variables === e.id}
            onClick={(ev) => ev.stopPropagation()}
          />
        </Popconfirm>
      ),
    },
  ];

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
              icon={<ReloadOutlined spin={isFetching || isSummaryFetching} />}
              onClick={() => {
                refetch();
                refetchCategorySummary();
              }}
            />
          </Tooltip>
          {isSuper && (
            <Button icon={<AppstoreOutlined />} onClick={() => setManagingCats(true)}>
              {t('nav.categories')}
            </Button>
          )}
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreating(true)}>
            {t('expenses.newExpense')}
          </Button>
        </div>
      </div>

      {/* Top KPI cards */}
      {kpiCats.length > 0 && (
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
          {kpiCats.map((c) => {
            const pct = grandTotal > 0 ? (c.total / grandTotal) * 100 : 0;
            return (
              <div
                key={c.id}
                className="card"
                style={{
                  padding: '14px 16px',
                  flex: '1 0 190px',
                  minWidth: 190,
                  maxWidth: 240,
                  scrollSnapAlign: 'start',
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>
                  {c.name}
                </div>
                <div className="num" style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>
                  <MoneyDisplay amount={c.total} currency="UZS" />
                </div>
                <div style={{ height: 4, borderRadius: 2, background: 'var(--border)', overflow: 'hidden', marginBottom: 4 }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: 'var(--primary)', borderRadius: 2 }} />
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>{pct.toFixed(0)}% {t('expenses.pctSuffix')}</div>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16, alignItems: 'flex-start' }}>

        {/* Table */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ display: 'flex', gap: 10, padding: '14px 16px', borderBottom: '1px solid var(--border)', alignItems: 'center' }}>
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
                  options={categories.map((c) => ({ value: c.id, label: c.name }))}
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
            pagination={{ current: page, pageSize, onChange: onPageChange, showSizeChanger: true, showTotal: (total) => `${total} ${t('common.countSuffix')}`, pageSizeOptions: ['10', '25', '50'] }}
            emptyText={t('expenses.empty')}
          />
        </div>

        {/* Breakdown */}
        <div className="card" style={{ position: 'sticky', top: 76 }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14 }}>{t('expenses.breakdown')}</div>
          {byCat.length === 0 ? (
            <div style={{ color: 'var(--ink-3)', fontSize: 13 }}>{t('common.noData')}</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {byCat.map((c) => {
                const pct = grandTotal > 0 ? (c.total / grandTotal) * 100 : 0;
                return (
                  <div key={c.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 4 }}>
                      <span style={{ color: 'var(--ink-2)', fontWeight: 500 }}>{c.name}</span>
                      <span className="num" style={{ color: 'var(--ink-3)' }}>{pct.toFixed(0)}%</span>
                    </div>
                    <div style={{ height: 5, borderRadius: 3, background: 'var(--border)', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: 'var(--primary)', borderRadius: 3 }} />
                    </div>
                    <div className="num" style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 2 }}>
                      <MoneyDisplay amount={c.total} currency="UZS" />
                    </div>
                  </div>
                );
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

      <ExpenseFormModal open={creating} onClose={() => setCreating(false)} />
      <CategoryManagerDrawer open={managingCats} onClose={() => setManagingCats(false)} />
    </>
  );
}
