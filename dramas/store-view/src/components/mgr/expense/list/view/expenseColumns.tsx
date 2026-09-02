import { Button, Popconfirm } from 'antd'

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
        <span className="u-text-quiet u-fs-11 u-numeric-tabular">{rowIndex(index)}</span>
      ),
    },
    {
      title: t('common.date'),
      dataIndex: 'expenseDate',
      width: 120,
      render: (value: string) => <span className="u-text-muted u-fs-12">{formatDate(value)}</span>,
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
      render: (value: string | null) => value ? <span className="u-text-secondary u-fs-13">{value}</span> : <span className="u-text-quiet">-</span>,
    },
    {
      title: t('expenses.colAmount'),
      key: 'amount',
      width: 190,
      align: 'right',
      render: (_: unknown, expense: Expense) => (
        <div className="u-items-end u-flex u-flex-col u-gap-2">
          <span className="num u-fw-700" >
            <MoneyDisplay amount={expense.currency === 'USD' ? expense.amountUsd : expense.amount} currency={expense.currency} />
          </span>
          {expense.currency === 'USD' ? (
            <span className="u-text-muted u-fs-11-5">
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
      render: (_: unknown, expense: Expense) => <span className="u-text-muted u-fs-12-5">{expense.createdBy.fullName}</span>,
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
            icon={<i className="icons-trash icon-size-18" />}
            loading={deleting && deletingId === expense.id}
            onClick={(event) => event.stopPropagation()}
          />
        </Popconfirm>
      ),
    },
  ]
}
