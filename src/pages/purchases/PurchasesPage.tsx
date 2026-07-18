import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Button, DatePicker, Select, Tooltip } from 'antd';
import { ArrowClockwiseIcon, PlusIcon } from '@phosphor-icons/react';
import dayjs, { type Dayjs } from 'dayjs';
import { useStockBatchesPage, useStockBatchSummary } from '@/entities/inventory';
import { useBranches } from '@/entities/branch';
import { StockInModal } from '@/features/stock-in';
import { BranchName, DataTable, EllipsisText, MoneyDisplay } from '@/shared/ui';
import type { StockBatch } from '@/shared/types/domain';
import { PRODUCT_UNIT_LABELS } from '@/shared/types/domain';
import type { ColumnDef } from '@/shared/ui';
import { formatDateTime } from '@/shared/lib/formatters';
import { usePagination } from '@/shared/lib/usePagination';
import { useT } from '@/shared/lib/i18n';

type PurchaseFiltersForm = {
  depleted?: string;
  dateRange: [Dayjs | null, Dayjs | null];
};

export function PurchasesPage() {
  const t = useT();
  const { page, pageSize, onChange: onPageChange, rowIndex } = usePagination();
  const { control, watch } = useForm<PurchaseFiltersForm>({
    defaultValues: {
      depleted: undefined,
      dateRange: [null, null],
    },
  });
  const filters = watch();
  const [creating, setCreating] = useState(false);
  const depletedFilter = filters.depleted === undefined ? undefined : filters.depleted === 'true';
  const dateRange = filters.dateRange;
  const dateFilters = {
    from: dateRange[0]?.startOf('day').toISOString(),
    to: dateRange[1]?.endOf('day').toISOString(),
  };

  const { data: result, isLoading, isFetching, refetch } = useStockBatchesPage(
    page, pageSize, { depleted: depletedFilter, ...dateFilters }
  );
  const { data: summary } = useStockBatchSummary();
  const { data: branches = [] } = useBranches();
  const batches = result?.items ?? [];
  const total = result?.total ?? 0;
  const totalBatches = summary?.totalBatches ?? 0;
  const activeBatches = summary?.totalActive ?? 0;
  const totalCost = summary?.totalCostUzs ?? 0;
  const totalRemainingValue = summary?.totalRemainingValueUzs ?? 0;
  const branchNameById = useMemo(
    () => new Map(branches.map((branch) => [branch.id, branch.name])),
    [branches],
  );

  function getSupplierNote(note: string | null) {
    if (!note) return null;
    return branchNameById.get(note) ?? note;
  }

  const columns: ColumnDef<StockBatch>[] = [
    {
      title: '#',
      key: '_idx',
      width: 40,
      render: (_: unknown, __: StockBatch, index: number) => (
        <span style={{ color: 'var(--ink-4)', fontSize: 11, fontVariantNumeric: 'tabular-nums' }}>{rowIndex(index)}</span>
      ),
    },
    {
      title: t('common.date'),
      dataIndex: 'receivedAt',
      width: 120,
      render: (v: string) => (
        <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>{formatDateTime(v)}</span>
      ),
    },
    {
      title: t('nav.products'),
      key: 'product',
      render: (_: unknown, b: StockBatch) => (
        <div>
          <div style={{ fontWeight: 600 }}>{b.product.name}</div>
          {b.product.sku && (
            <div style={{ fontSize: 11.5, color: 'var(--ink-3)', fontFamily: 'monospace' }}>
              {b.product.sku}
            </div>
          )}
        </div>
      ),
    },
    {
      title: t('common.branch'),
      key: 'branch',
      width: 150,
      responsiveHide: true,
      render: (_: unknown, b: StockBatch) => (
        <BranchName name={b.branch.name} as="badge" tone="info" />
      ),
    },
    {
      title: t('purchases.colQty'),
      key: 'qty',
      width: 120,
      align: 'right',
      render: (_: unknown, b: StockBatch) => {
        const unit = PRODUCT_UNIT_LABELS[b.product.unit];
        return (
          <span className="num" style={{ fontWeight: 600 }}>
            {b.initialQty.toLocaleString('ru-RU')} {unit}
          </span>
        );
      },
    },
    {
      title: t('purchases.colRemaining'),
      key: 'remainingQty',
      width: 130,
      align: 'right',
      render: (_: unknown, b: StockBatch) => {
        const unit = PRODUCT_UNIT_LABELS[b.product.unit];
        const depleted = b.remainingQty === 0;
        return (
          <span className="num" style={{ fontWeight: 700, color: depleted ? 'var(--ink-4)' : 'var(--success)' }}>
            {b.remainingQty.toLocaleString('ru-RU')} {unit}
          </span>
        );
      },
    },
    {
      title: t('purchases.colCost'),
      key: 'cost',
      width: 150,
      align: 'right',
      render: (_: unknown, b: StockBatch) => (
        <div style={{ textAlign: 'right' }}>
          <div className="num" style={{ fontWeight: 700 }}>
            <MoneyDisplay amount={b.costPriceUzs} currency="UZS" />
          </div>
          {b.costPriceUsd != null && (
            <div className="num" style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>
              <MoneyDisplay amount={b.costPriceUsd} currency="USD" />
            </div>
          )}
        </div>
      ),
    },
    {
      title: t('purchases.colTotalCost'),
      key: 'totalCost',
      width: 160,
      responsiveHide: true,
      align: 'right',
      render: (_: unknown, b: StockBatch) => (
        <span className="num" style={{ fontWeight: 600 }}>
          <MoneyDisplay amount={b.initialQty * b.costPriceUzs} currency="UZS" />
        </span>
      ),
    },
    {
      title: t('purchases.colSupplierNote'),
      dataIndex: 'supplierNote',
      responsiveHide: true,
      render: (v: string | null) => {
        const note = getSupplierNote(v);
        return note ? (
          <span style={{ fontSize: 12.5, color: 'var(--ink-2)' }}>
            <EllipsisText maxWidth={180}>{note}</EllipsisText>
          </span>
        ) : (
          <span style={{ color: 'var(--ink-4)' }}>—</span>
        );
      },
    },
    {
      title: t('common.enteredBy'),
      key: 'createdBy',
      width: 140,
      responsiveHide: true,
      render: (_: unknown, b: StockBatch) => (
        <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>{b.createdBy.fullName}</span>
      ),
    },
  ];

  return (
    <>
      <div className="page-head">
        <div>
          <h1>{t('nav.purchases')}</h1>
          <div className="sub">
            {totalBatches} {t('purchases.subtitleBatches')} · {activeBatches} {t('purchases.subtitleActive')}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Tooltip title={t('common.refresh')}>
            <Button
              icon={<ArrowClockwiseIcon size={18} className={isFetching ? 'ph-icon-spin' : undefined} />}
              onClick={() => refetch()}
            />
          </Tooltip>
          <Button type="primary" icon={<PlusIcon size={18} weight="bold" />} onClick={() => setCreating(true)}>
            {t('purchases.newPurchase')}
          </Button>
        </div>
      </div>

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 12, marginBottom: 16 }}>
        <KpiBox label={t('purchases.kpiTotal')} value={totalBatches} hint={t('purchases.kpiTotalHint')} />
        <KpiBox label={t('purchases.kpiActive')} value={activeBatches} hint={t('purchases.kpiActiveHint')} tone="success" />
        <KpiBox
          label={t('purchases.kpiValue')}
          value={<MoneyDisplay amount={totalCost} currency="UZS" />}
          hint={t('purchases.kpiValueHint')}
        />
        <KpiBox
          label={t('purchases.kpiRemainingValue')}
          value={<MoneyDisplay amount={totalRemainingValue} currency="UZS" />}
          hint={t('purchases.kpiRemainingValueHint')}
          tone="success"
        />
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Toolbar */}
        <div style={{ display: 'flex', gap: 10, padding: '14px 16px', borderBottom: '1px solid var(--border)', alignItems: 'center', flexWrap: 'wrap' }}>
          <Controller
            name="depleted"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                onChange={(value) => {
                  field.onChange(value);
                  onPageChange(1, pageSize);
                }}
                allowClear
                placeholder={t('purchases.filterAll')}
                style={{ minWidth: 180 }}
                options={[
                  { value: 'false', label: t('purchases.filterActive') },
                  { value: 'true', label: t('purchases.depleted') },
                ]}
              />
            )}
          />
          <Controller
            name="dateRange"
            control={control}
            render={({ field }) => (
              <DatePicker.RangePicker
                value={field.value}
                onChange={(values) => {
                  field.onChange(values ?? [null, null]);
                  onPageChange(1, pageSize);
                }}
                allowClear
                format="YYYY-MM-DD"
                placeholder={[t('common.startDate'), t('common.endDate')]}
                presets={[
                  { label: t('common.today'), value: [dayjs(), dayjs()] },
                  { label: t('common.thisMonth'), value: [dayjs().startOf('month'), dayjs()] },
                ]}
                style={{ minWidth: 260 }}
              />
            )}
          />
          <span style={{ marginLeft: 'auto', color: 'var(--ink-3)', fontSize: 12.5 }}>
            <strong>{total}</strong> {t('common.resultsSuffix')}
          </span>
        </div>

        <DataTable<StockBatch>
          rowKey="id"
          dataSource={batches}
          columns={columns}
          loading={isLoading}
          pagination={{ current: page, pageSize, total, onChange: onPageChange, showSizeChanger: true, showTotal: (n) => `${n} ${t('common.countSuffix')}`, pageSizeOptions: ['10', '25', '50'] }}
          emptyText={t('purchases.empty')}
        />
      </div>

      <StockInModal open={creating} onClose={() => setCreating(false)} />
    </>
  );
}

function KpiBox({
  label, value, hint, tone = 'muted',
}: {
  label: string;
  value: React.ReactNode;
  hint: string;
  tone?: 'success' | 'muted';
}) {
  return (
    <div className="card" style={{ padding: '14px 16px' }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>
        {label}
      </div>
      <div className="num" style={{ fontSize: 18, fontWeight: 700, color: tone === 'success' ? 'var(--success)' : 'var(--ink-1)' }}>
        {value}
      </div>
      <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 4 }}>{hint}</div>
    </div>
  );
}
