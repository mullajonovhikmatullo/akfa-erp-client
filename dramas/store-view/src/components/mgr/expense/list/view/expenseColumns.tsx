import { Button, Popconfirm } from 'antd'
import { TrashIcon } from '@phosphor-icons/react'
import { formatDate } from '@store/store-shared/lib/formatters'
import type { ColumnDef } from '@store/store-shared/ui/data-table'
import { MoneyDisplay } from '@store/store-shared/ui/money-display'
import { StatusBadge } from '@store/store-shared/ui/status-badge'
import type { Expense } from '@store/store-stub'

interface ExpenseColumnsOptions {
  t: (key: string) => string
  rowIndex: (index: number) => number
  deleting: boolean
  deletingId?: string
  onDelete: (id: string) => void
}

export function createExpenseColumns({ t, rowIndex, deleting, deletingId, onDelete }: ExpenseColumnsOptions): ColumnDef<Expense>[] {
  //
  return [
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
      render: (value: string | null) => value ? <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>{value}</span> : <span style={{ color: 'var(--ink-4)' }}>-</span>,
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
      render: (_: unknown, expense: Expense) => <span style={{ fontSize: 12.5, color: 'var(--ink-3)' }}>{expense.createdBy.fullName}</span>,
    },
    {
      title: '',
      key: 'actions',
      width: 60,
      fixed: 'right' as const,
      render: (_: unknown, expense: Expense) => (
        <Popconfirm
          title={t('common.deleteTitle')}
          description={t('expenses.deleteDesc')}
          okText={t('common.yes')}
          cancelText={t('common.cancel')}
          okButtonProps={{ danger: true, loading: deleting && deletingId === expense.id }}
          onConfirm={(event) => {
            //
            event?.stopPropagation()
            onDelete(expense.id)
          }}
          onPopupClick={(event) => event.stopPropagation()}
        >
          <Button
            size="small"
            type="text"
            danger
            icon={<TrashIcon size={18} />}
            loading={deleting && deletingId === expense.id}
            onClick={(event) => event.stopPropagation()}
          />
        </Popconfirm>
      ),
    },
  ]
}
