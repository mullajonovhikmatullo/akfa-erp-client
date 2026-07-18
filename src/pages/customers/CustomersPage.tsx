import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import { Button, Input, Popconfirm, Select, Tooltip } from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import {
  useCustomers,
  useDeactivateCustomer,
  customerApi,
} from '@/entities/customer';
import type { CreateCustomerPayload } from '@/entities/customer';
import { useBranches } from '@/entities/branch';
import { CustomerFormModal } from '@/features/create-customer';
import { CustomerDetailDrawer } from '@/widgets/customer-detail';
import { ExcelImportButton } from '@/features/excel-import';
import { getField, isUuid, parseExcelNumber } from '@/features/excel-import/lib/parseExcel';
import { DataTable, StatusBadge, MoneyDisplay } from '@/shared/ui';
import { useCurrentUser } from '@/entities/user';
import type { Customer } from '@/shared/types/domain';
// @ts-ignore
import type { ColumnDef } from '@/shared/ui';
import { formatDate } from '@/shared/lib/formatters';
import { usePagination } from '@/shared/lib/usePagination';
import { useT } from '@/shared/lib/i18n';

type CustomerFiltersForm = {
  search: string;
  balance: BalanceFilter;
};

export function CustomersPage() {
  const t = useT();
  const [searchParams, setSearchParams] = useSearchParams();
  const { can, isSuper } = useCurrentUser();
  const { page, pageSize, onChange: onPageChange, rowIndex } = usePagination();
  const canManage = can('customers:create');
  const { control, watch } = useForm<CustomerFiltersForm>({
    defaultValues: {
      search: '',
      balance: getInitialBalanceFilter(searchParams.get('balance')),
    },
  });
  const filters = watch();

  const [drawerCustomer, setDrawerCustomer] = useState<Customer | null>(null);
  const [editCustomer, setEditCustomer] = useState<Customer | null | undefined>(undefined);

  const { data: customers = [], isLoading, isFetching, refetch } = useCustomers({
    search: filters.search || undefined,
  });
  const { data: branches = [] } = useBranches();
  const defaultCustomerBranchId = branches[0]?.id ?? '';

  const deleteMutation = useDeactivateCustomer();

  const totalDebt = customers.reduce((sum, c) => sum + (c.balance > 0 ? c.balance : 0), 0);
  const totalCredit = customers.reduce((sum, c) => sum + (c.balance < 0 ? -c.balance : 0), 0);
  const filteredCustomers = useMemo(() => customers.filter((customer) => {
    if (filters.balance === 'debt') return customer.balance > 0;
    if (filters.balance === 'credit') return customer.balance < 0;
    if (filters.balance === 'zero') return customer.balance === 0;
    return true;
  }), [filters.balance, customers]);

  const syncBalanceFilterParam = (value: BalanceFilter) => {
    const next = new URLSearchParams(searchParams);
    if (value === 'all') {
      next.delete('balance');
    } else {
      next.set('balance', value);
    }
    setSearchParams(next, { replace: true });
  };

  const columns: ColumnDef<Customer>[] = [
    {
      title: '#',
      key: '_idx',
      width: 40,
      render: (_: unknown, __: Customer, index: number) => (
        <span style={{ color: 'var(--ink-4)', fontSize: 11, fontVariantNumeric: 'tabular-nums' }}>{rowIndex(index)}</span>
      ),
    },
    {
      title: t('nav.customers'),
      key: 'fullName',
      render: (_: unknown, c: Customer) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 26, height: 26, borderRadius: '50%',
              background: 'var(--primary)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 700, flexShrink: 0,
            }}
          >
            {c.fullName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 600 }}>{c.fullName}</div>
            {c.address && (
              <div style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>{c.address}</div>
            )}
          </div>
        </div>
      ),
    },
    {
      title: t('common.phone'),
      dataIndex: 'phone',
      width: 170,
      responsiveHide: true,
      render: (v: string | null) =>
        v ? (
          <span className="num" style={{ fontSize: 13 }}>{v}</span>
        ) : (
          <span style={{ color: 'var(--ink-4)' }}>—</span>
        ),
    },
    {
      title: t('common.branch'),
      key: 'branch',
      width: 150,
      responsiveHide: true,
      render: (_: unknown, c: Customer) => (
        <StatusBadge tone="muted">{c.branch.name}</StatusBadge>
      ),
    },
    {
      title: t('customers.colBalance'),
      key: 'balance',
      width: 180,
      align: 'right',
      render: (_: unknown, c: Customer) => {
        const tone = c.balance > 0 ? 'danger' : c.balance < 0 ? 'success' : 'muted';
        const label = c.balance > 0 ? t('customers.balanceDebt') : c.balance < 0 ? t('customers.balanceCredit') : t('customers.balanceZero');
        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
            <span className="num" style={{ fontWeight: 700 }}>
              <MoneyDisplay amount={Math.abs(c.balance)} currency="UZS" />
            </span>
            <StatusBadge tone={tone}>{label}</StatusBadge>
          </div>
        );
      },
    },
    {
      title: t('common.status'),
      dataIndex: 'isActive',
      width: 90,
      align: 'center',
      responsiveHide: true,
      render: (v: boolean) =>
        v ? (
          <StatusBadge tone="success" dot>{t('common.active')}</StatusBadge>
        ) : (
          <StatusBadge tone="danger" dot>{t('common.inactive')}</StatusBadge>
        ),
    },
    {
      title: t('common.added'),
      dataIndex: 'createdAt',
      width: 110,
      responsiveHide: true,
      render: (v: string) => (
        <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>{formatDate(v)}</span>
      ),
    },
    {
      title: '',
      key: 'actions',
      width: 90,
      fixed: 'right',
      render: (_: unknown, c: Customer) => (
        <div style={{ display: 'flex', gap: 4 }}>
          <Tooltip title={t('common.view')}>
            <Button
              size="small"
              type="text"
              icon={<EyeOutlined />}
              onClick={(e) => { e.stopPropagation(); setDrawerCustomer(c); }}
            />
          </Tooltip>
          {canManage && (
            <>
              <Button
                size="small"
                type="text"
                icon={<EditOutlined />}
                onClick={(e) => { e.stopPropagation(); setEditCustomer(c); }}
              />
              <Popconfirm
                title={t('common.deleteTitle')}
                description={`"${c.fullName}" ${t('customers.deactivateDesc')}`}
                okText={t('common.yesDelete')}
                cancelText={t('common.cancel')}
                okButtonProps={{ danger: true, loading: deleteMutation.isPending && deleteMutation.variables === c.id }}
                onConfirm={(e) => { e?.stopPropagation(); deleteMutation.mutate(c.id); }}
                onPopupClick={(e) => e.stopPropagation()}
              >
                <Button
                  size="small"
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  loading={deleteMutation.isPending && deleteMutation.variables === c.id}
                  onClick={(e) => e.stopPropagation()}
                />
              </Popconfirm>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="page-head">
        <div>
          <h1>{t('nav.customers')}</h1>
          <div className="sub">
            {filteredCustomers.length} {t('customers.subtitleSuffix')}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Tooltip title={t('common.refresh')}>
            <Button icon={<ReloadOutlined spin={isFetching} />} onClick={() => refetch()} />
          </Tooltip>
          {canManage && (
            <>
              <ExcelImportButton<CreateCustomerPayload>
                entityLabel={t('nav.customers')}
                templateHeaders={['fullName', 'phone', 'address', 'balance', 'branchId']}
                templateExamples={[
                  ['Alisher Karimov', '+998901234567', 'Tashkent, Chilonzor', '0', isSuper ? defaultCustomerBranchId : ''],
                  ['Nilufar Tosheva', '', '', '150000', isSuper ? defaultCustomerBranchId : ''],
                ]}
                templateFileName="customers_template.xlsx"
                hints={isSuper ? [{
                  label: t('common.branch'),
                  items: branches.map((b) => `${b.name}: ${b.id}`),
                }] : undefined}
                parseRow={(raw, index) => {
                  const fullName = getField(raw, 'fullName');
                  if (!fullName || fullName.length < 2) {
                    return { index, raw, error: 'fullName kamida 2 belgi bo\'lishi kerak' };
                  }
                  if (fullName.length > 150) {
                    return { index, raw, error: 'fullName 150 belgidan oshmasligi kerak' };
                  }

                  const phone = getField(raw, 'phone') || undefined;
                  if (phone && !/^\+?[0-9\s\-()]{7,20}$/.test(phone)) {
                    return { index, raw, error: 'phone formati noto\'g\'ri' };
                  }

                  const address = getField(raw, 'address') || undefined;
                  if (address && address.length > 300) {
                    return { index, raw, error: 'address 300 belgidan oshmasligi kerak' };
                  }

                  const balanceRaw = getField(raw, 'balance');
                  const balance = parseExcelNumber(balanceRaw);
                  if (balanceRaw && (balance === undefined || !Number.isFinite(balance))) {
                    return { index, raw, error: "balance noto'g'ri kiritilgan (son bo'lishi kerak)" };
                  }

                  const branchFromRow = getField(raw, 'branchId');
                  if (branchFromRow && !isUuid(branchFromRow)) {
                    return { index, raw, error: 'branchId UUID formatida bo\'lishi kerak' };
                  }
                  if (isSuper && !branchFromRow) {
                    return { index, raw, error: 'branchId kiritilishi shart' };
                  }

                  return {
                    index,
                    raw,
                    data: { fullName, phone, address, branchId: branchFromRow || undefined, balance },
                  };
                }}
                createFn={(data) => customerApi.create(data)}
                onComplete={() => refetch()}
              />
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setEditCustomer(null)}
              >
                {t('customers.newCustomer')}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
        <KpiBox
          label={t('customers.kpiTotalDebt')}
          value={<MoneyDisplay amount={totalDebt} currency="UZS" />}
          hint={`${customers.filter((c) => c.balance > 0).length} ${t('customers.subtitleSuffix2')}`}
          tone="danger"
        />
        <KpiBox
          label={t('customers.kpiCredit')}
          value={<MoneyDisplay amount={totalCredit} currency="UZS" />}
          hint={`${customers.filter((c) => c.balance < 0).length} ${t('customers.subtitleSuffix2')}`}
          tone="success"
        />
        <KpiBox
          label={t('customers.kpiNet')}
          value={<MoneyDisplay amount={totalDebt - totalCredit} currency="UZS" />}
          hint={`${customers.length} ${t('common.total')}`}
          tone="muted"
        />
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Toolbar */}
        <div style={{ display: 'flex', gap: 10, padding: '14px 16px', borderBottom: '1px solid var(--border)', alignItems: 'center' }}>
          <Controller
            name="search"
            control={control}
            render={({ field }) => (
              <Input
                prefix={<SearchOutlined />}
                placeholder={t('customers.searchPlaceholder')}
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
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
                  field.onChange(value);
                  syncBalanceFilterParam(value);
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
          pagination={{ current: page, pageSize, onChange: onPageChange, showSizeChanger: true, showTotal: (total) => `${total} ${t('common.countSuffix')}`, pageSizeOptions: ['10', '25', '50'] }}
          onRow={(c) => ({
            onClick: () => setDrawerCustomer(c),
            style: { cursor: 'pointer' },
          })}
          emptyText={t('customers.empty')}
        />
      </div>

      <CustomerFormModal
        open={editCustomer !== undefined}
        customer={editCustomer ?? null}
        onClose={() => setEditCustomer(undefined)}
      />

      <CustomerDetailDrawer
        customer={drawerCustomer}
        onClose={() => setDrawerCustomer(null)}
      />
    </>
  );
}

type BalanceFilter = 'all' | 'debt' | 'credit' | 'zero';

function getInitialBalanceFilter(value: string | null): BalanceFilter {
  if (value === 'debt' || value === 'credit' || value === 'zero') return value;
  return 'all';
}

function KpiBox({
  label, value, hint, tone,
}: {
  label: string;
  value: React.ReactNode;
  hint: string;
  tone: 'danger' | 'success' | 'muted';
}) {
  const colors: Record<string, string> = {
    danger: 'var(--danger)',
    success: 'var(--success)',
    muted: 'var(--ink-2)',
  };
  return (
    <div className="card" style={{ padding: '14px 16px' }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>
        {label}
      </div>
      <div className="num" style={{ fontSize: 18, fontWeight: 700, color: colors[tone] }}>
        {value}
      </div>
      <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 4 }}>{hint}</div>
    </div>
  );
}
