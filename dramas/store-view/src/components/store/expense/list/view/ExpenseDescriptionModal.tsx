import type { StoreTranslator } from '@store/store-i18n'
import { Button } from 'antd'

import { formatDate } from '@store/store-shared/lib/formatters'
import { AppModal } from '@store/store-shared/ui/app-modal'
import { MoneyDisplay } from '@store/store-shared/ui/money-display'
import { StatusBadge } from '@store/store-shared/ui/status-badge'
import type { Expense } from '@store/store-stub'

interface ExpenseDescriptionModalProps {
  t: StoreTranslator
  expense: Expense | null
  onClose: () => void
}

export function ExpenseDescriptionModal({ t, expense, onClose }: ExpenseDescriptionModalProps) {
  //
  return (
    <AppModal
      title={t('expenses.colNote')}
      open={Boolean(expense)}
      onClose={onClose}
      width={480}
      footer={<Button onClick={onClose}>{t('common.close')}</Button>}
    >
      {expense ? (
        <div className="u-flex u-flex-col u-gap-12">
          <div className="u-items-center u-flex u-flex-wrap u-gap-8">
            <StatusBadge tone="muted">{expense.category.name}</StatusBadge>
            <StatusBadge tone="info">{expense.branch.name}</StatusBadge>
            <span className="u-text-muted u-fs-12">{formatDate(expense.expenseDate)}</span>
            <span className="num u-fw-700 u-ml-auto">
              <MoneyDisplay amount={expense.currency === 'USD' ? expense.amountUsd : expense.amount} currency={expense.currency} />
            </span>
          </div>
          <div className="expense-description">{expense.description}</div>
        </div>
      ) : null}
    </AppModal>
  )
}
