import { useState } from 'react';
import { Button, Select, Popconfirm, Tooltip } from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  AppstoreOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useExpenses, useExpenseCategories, useDeleteExpense } from '@/entities/expense';
import { ExpenseFormModal, CategoryManagerDrawer } from '@/features/create-expense';
import { DataTable, StatusBadge, MoneyDisplay } from '@/shared/ui';
import { useCurrentUser } from '@/entities/user';
import type { Expense } from '@/shared/types/domain';
import type { ColumnDef } from '@/shared/ui';
import { formatDate } from '@/shared/lib/formatters';
import { usePagination } from '@/shared/lib/usePagination';

export function ExpensesPage() {
  const { isSuper } = useCurrentUser();
  const { page, pageSize, onChange: onPageChange, rowIndex } = usePagination();

  const [categoryFilter, setCategoryFilter] = useState<string | undefined>();
  const [creating, setCreating] = useState(false);
  const [managingCats, setManagingCats] = useState(false);

  const { data: expenses = [], isLoading, isFetching, refetch } = useExpenses({
    categoryId: categoryFilter,
    limit: 200,
  });

  const { data: categories = [] } = useExpenseCategories();
  const deleteMutation = useDeleteExpense();

  // Breakdown by category
  const grandTotal = expenses.reduce((sum, e) => sum + e.amount, 0);
  const byCat = categories
    .map((c) => ({
      ...c,
      total: expenses.filter((e) => e.category.id === c.id).reduce((sum, e) => sum + e.amount, 0),
    }))
    .filter((c) => c.total > 0)
    .sort((a, b) => b.total - a.total);

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
      title: 'Сана',
      dataIndex: 'expenseDate',
      width: 120,
      render: (v: string) => (
        <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>{formatDate(v)}</span>
      ),
    },
    {
      title: 'Категория',
      key: 'category',
      width: 180,
      render: (_: unknown, e: Expense) => (
        <StatusBadge tone="muted">{e.category.name}</StatusBadge>
      ),
    },
    {
      title: 'Филиал',
      key: 'branch',
      width: 150,
      responsiveHide: true,
      render: (_: unknown, e: Expense) => (
        <StatusBadge tone="info">{e.branch.name}</StatusBadge>
      ),
    },
    {
      title: 'Изоҳ',
      dataIndex: 'description',
      render: (v: string | null) =>
        v ? (
          <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>{v}</span>
        ) : (
          <span style={{ color: 'var(--ink-4)' }}>—</span>
        ),
    },
    {
      title: 'Миқдор',
      key: 'amount',
      width: 160,
      align: 'right',
      render: (_: unknown, e: Expense) => (
        <span className="num" style={{ fontWeight: 700 }}>
          <MoneyDisplay amount={e.amount} currency="UZS" />
        </span>
      ),
    },
    {
      title: 'Киритувчи',
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
          title="Ўчирилсинми?"
          description="Бу харажат ўчирилади."
          okText="Ҳа"
          cancelText="Бекор"
          okButtonProps={{ danger: true, loading: deleteMutation.isPending }}
          onConfirm={(ev) => { ev?.stopPropagation(); deleteMutation.mutate(e.id); }}
          onPopupClick={(ev) => ev.stopPropagation()}
        >
          <Tooltip title="Ўчириш">
            <Button
              size="small"
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={(ev) => ev.stopPropagation()}
            />
          </Tooltip>
        </Popconfirm>
      ),
    },
  ];

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Харажатлар</h1>
          <div className="sub">
            {expenses.length} та ёзув · {categories.length} та категория
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Tooltip title="Янгилаш">
            <Button icon={<ReloadOutlined spin={isFetching} />} onClick={() => refetch()} />
          </Tooltip>
          {isSuper && (
            <Button icon={<AppstoreOutlined />} onClick={() => setManagingCats(true)}>
              Категориялар
            </Button>
          )}
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreating(true)}>
            Харажат қўшиш
          </Button>
        </div>
      </div>

      {/* Top KPI cards */}
      {byCat.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, marginBottom: 16 }}>
          {byCat.slice(0, 4).map((c) => {
            const pct = grandTotal > 0 ? (c.total / grandTotal) * 100 : 0;
            return (
              <div key={c.id} className="card" style={{ padding: '14px 16px' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>
                  {c.name}
                </div>
                <div className="num" style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>
                  <MoneyDisplay amount={c.total} currency="UZS" />
                </div>
                <div style={{ height: 4, borderRadius: 2, background: 'var(--border)', overflow: 'hidden', marginBottom: 4 }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: 'var(--primary)', borderRadius: 2 }} />
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>{pct.toFixed(0)}% жами харажатдан</div>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16, alignItems: 'flex-start' }}>

        {/* Table */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ display: 'flex', gap: 10, padding: '14px 16px', borderBottom: '1px solid var(--border)', alignItems: 'center' }}>
            <Select
              value={categoryFilter}
              onChange={setCategoryFilter}
              allowClear
              placeholder="Барча категориялар"
              style={{ minWidth: 220 }}
              options={categories.map((c) => ({ value: c.id, label: c.name }))}
            />
            <span style={{ marginLeft: 'auto', color: 'var(--ink-3)', fontSize: 12.5 }}>
              <strong>{expenses.length}</strong> та натижа
            </span>
          </div>

          <DataTable<Expense>
            rowKey="id"
            dataSource={expenses}
            columns={columns}
            loading={isLoading}
            pagination={{ current: page, pageSize, onChange: onPageChange, showSizeChanger: true, showTotal: (t) => `${t} ta`, pageSizeOptions: ['10', '25', '50'] }}
            emptyText="Харажатлар топилмади"
          />
        </div>

        {/* Breakdown */}
        <div className="card" style={{ position: 'sticky', top: 76 }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 14 }}>Категориялар бўйича</div>
          {byCat.length === 0 ? (
            <div style={{ color: 'var(--ink-3)', fontSize: 13 }}>Маълумот йўқ</div>
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
            <span style={{ color: 'var(--ink-3)' }}>Жами</span>
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
