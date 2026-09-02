import { Controller } from 'react-hook-form'
import { Button, Input, Popconfirm, Switch } from 'antd'

import { blockAutofill } from '@store/store-shared/lib/autofill'
import { StatusBadge } from '@store/store-shared/ui/status-badge'
import type { ExpenseCategory } from '@store/store-stub'
import type { CategoryManagerFormControl, CategoryManagerFormErrors } from './types'

interface ExpenseCategoryRowProps {
  category: ExpenseCategory
  t: (key: string) => string
  control: CategoryManagerFormControl
  errors: CategoryManagerFormErrors
  editName: string
  editing: boolean
  updatePending: boolean
  deletePending: boolean
  onStartEdit: (category: ExpenseCategory) => void
  onSubmitEdit: (id: string) => void
  onCancelEdit: () => void
  onToggleActive: (id: string, active: boolean) => void
  onDelete: (id: string) => void
}

export function ExpenseCategoryRow({
  category,
  t,
  control,
  errors,
  editName,
  editing,
  updatePending,
  deletePending,
  onStartEdit,
  onSubmitEdit,
  onCancelEdit,
  onToggleActive,
  onDelete,
}: ExpenseCategoryRowProps) {
  //
  return (
    <div className={`expense-category-row${category.isActive ? '' : ' expense-category-row--inactive'}`}>
      {editing ? (
        <>
          <Controller
            name="editName"
            control={control}
            rules={{
              validate: (value) => value.trim().length > 0 || t('categoryDrawer.nameRequired'),
              maxLength: { value: 100, message: t('categoryDrawer.nameMax') },
            }}
            render={({ field }) => (
              <div className="u-flex-1 u-min-w-0">
                <Input
                  {...field}
                  {...blockAutofill(`store-expense-category-edit-${category.id}`)}
                  onPressEnter={() => onSubmitEdit(category.id)}
                  status={errors.editName ? 'error' : undefined}
                  autoFocus
                />
                {errors.editName?.message ? <div className="u-text-danger u-fs-11 u-mt-4">{errors.editName.message}</div> : null}
              </div>
            )}
          />
          <Button
            size="small"
            type="primary"
            icon={<i className="icons-check icon-size-16" />}
            onClick={() => onSubmitEdit(category.id)}
            loading={updatePending}
            disabled={!editName.trim()}
          />
          <Button size="small" icon={<i className="icons-close icon-size-16" />} onClick={onCancelEdit} />
        </>
      ) : (
        <>
          <div className="u-flex-1">
            <div className="u-fw-500">{category.name}</div>
            <div className="u-text-muted u-fs-11-5">
              {category._count.expenses} {t('categoryDrawer.expenseCountSuffix')}
            </div>
          </div>
          <StatusBadge tone={category.isActive ? 'success' : 'danger'}>
            {category.isActive ? t('common.active') : t('common.inactive')}
          </StatusBadge>
          <Switch
            size="small"
            checked={category.isActive}
            loading={updatePending}
            onChange={(checked) => onToggleActive(category.id, checked)}
          />
          <Button size="small" type="text" icon={<i className="icons-pen-line icon-size-16" />} onClick={() => onStartEdit(category)} />
          <Popconfirm
            title={t('categoryDrawer.popconfirmTitle')}
            description={
              category._count.expenses > 0
                ? t('categoryDrawer.popconfirmHasExpenses')
                : t('categoryDrawer.popconfirmNoExpenses')
            }
            okText={t('categoryDrawer.okText')}
            cancelText={t('categoryDrawer.cancelText')}
            okButtonProps={{ danger: true, disabled: category._count.expenses > 0, loading: deletePending }}
            onConfirm={() => onDelete(category.id)}
          >
            <Button size="small" type="text" danger icon={<i className="icons-trash icon-size-16" />} loading={deletePending} />
          </Popconfirm>
        </>
      )}
    </div>
  )
}
