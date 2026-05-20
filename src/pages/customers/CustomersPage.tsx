import { useState } from 'react';
import { Button, Input, Popconfirm, Tooltip } from 'antd';
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
import { CustomerFormModal } from '@/features/create-customer';
import { CustomerDetailDrawer } from '@/widgets/customer-detail';
import { ExcelImportButton } from '@/features/excel-import';
import { getField } from '@/features/excel-import/lib/parseExcel';
import { DataTable, StatusBadge, MoneyDisplay } from '@/shared/ui';
import { useCurrentUser } from '@/entities/user';
import type { Customer } from '@/shared/types/domain';
// @ts-ignore
import type { ColumnDef } from '@/shared/ui';
import { formatDate } from '@/shared/lib/formatters';
import { usePagination } from '@/shared/lib/usePagination';
import { useT } from '@/shared/lib/i18n';

export function CustomersPage() {
  const t = useT();
  const { can, isSuper, branchId } = useCurrentUser();
  const { page, pageSize, onChange: onPageChange, rowIndex } = usePagination();
  const canManage = can('customers:create');

  const [search, setSearch] = useState('');
  const [drawerCustomer, setDrawerCustomer] = useState<Customer | null>(null);
  const [editCustomer, setEditCustomer] = useState<Customer | null | undefined>(undefined);

  const { data: customers = [], isLoading, isFetching, refetch } = useCustomers({
    search: search || undefined,
  });

  const deleteMutation = useDeactivateCustomer();

  const totalDebt = customers.reduce((sum, c) => sum + (c.balance > 0 ? c.balance : 0), 0);
  const totalCredit = customers.reduce((sum, c) => sum + (c.balance < 0 ? -c.balance : 0), 0);

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
              <Tooltip title={t('common.edit')}>
                <Button
                  size="small"
                  type="text"
                  icon={<EditOutlined />}
                  onClick={(e) => { e.stopPropagation(); setEditCustomer(c); }}
                />
              </Tooltip>
              <Popconfirm
                title={t('common.deleteTitle')}
                description={`"${c.fullName}" ${t('customers.deactivateDesc')}`}
                okText={t('common.yesDelete')}
                cancelText={t('common.cancel')}
                okButtonProps={{ danger: true, loading: deleteMutation.isPending }}
                onConfirm={(e) => { e?.stopPropagation(); deleteMutation.mutate(c.id); }}
                onPopupClick={(e) => e.stopPropagation()}
              >
                <Tooltip title={t('customers.deactivateTooltip')}>
                  <Button
                    size="small"
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={(e) => e.stopPropagation()}
                  />
                </Tooltip>
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
            {customers.length} {t('customers.subtitleSuffix')}
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
                templateHeaders={['fullName', 'phone', 'address', 'balance']}
                templateExamples={[
                  ['Alisher Karimov', '+998901234567', 'Tashkent, Chilonzor', '0'],
                  ['Nilufar Tosheva', '+998912345678', '', '150000'],
                ]}
                templateFileName="customers_template.xlsx"
                parseRow={(raw, index) => {
                  const fullName = getField(raw, 'fullName');
                  if (!fullName) return { index, raw, error: 'fullName is required' };
                  const phone = getField(raw, 'phone') || undefined;
                  const address = getField(raw, 'address') || undefined;
                  const balanceRaw = getField(raw, 'balance');
                  const balance = balanceRaw ? Number(balanceRaw) : undefined;
                  if (balance !== undefined && isNaN(balance)) {
                    return { index, raw, error: "Balance noto'g'ri kiritilgan (son bo'lishi kerak)" };
                  }
                  if (balance !== undefined && balance < 0) {
                    return { index, raw, error: "Balance manfiy bo'lishi mumkin emas" };
                  }
                  const resolvedBranchId = isSuper ? (branchId ?? undefined) : (branchId ?? undefined);
                  return { index, raw, data: { fullName, phone, address, branchId: resolvedBranchId, balance } };
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
          <Input
            prefix={<SearchOutlined />}
            placeholder={t('customers.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
            style={{ maxWidth: 320 }}
          />
          <span style={{ marginLeft: 'auto', color: 'var(--ink-3)', fontSize: 12.5 }}>
            <strong>{customers.length}</strong> {t('common.resultsSuffix')}
          </span>
        </div>

        <DataTable<Customer>
          rowKey="id"
          dataSource={customers}
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
