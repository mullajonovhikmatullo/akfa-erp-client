import { Controller } from 'react-hook-form'
import { Button, Input, Popconfirm, Switch } from 'antd'
import { CheckIcon, PencilSimpleIcon, TrashIcon, XIcon } from '@phosphor-icons/react'
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
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '10px 14px',
        border: '1px solid var(--border)',
        borderRadius: 8,
        background: 'var(--surface-2)',
        opacity: category.isActive ? 1 : 0.6,
      }}
    >
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
              <div style={{ flex: 1, minWidth: 0 }}>
                <Input
                  {...field}
                  {...blockAutofill(`store-expense-category-edit-${category.id}`)}
                  onPressEnter={() => onSubmitEdit(category.id)}
                  status={errors.editName ? 'error' : undefined}
                  autoFocus
                />
                {errors.editName?.message ? <div style={{ marginTop: 4, color: 'var(--danger)', fontSize: 11 }}>{errors.editName.message}</div> : null}
              </div>
            )}
          />
          <Button
            size="small"
            type="primary"
            icon={<CheckIcon size={16} weight="bold" />}
            onClick={() => onSubmitEdit(category.id)}
            loading={updatePending}
            disabled={!editName.trim()}
          />
          <Button size="small" icon={<XIcon size={16} />} onClick={onCancelEdit} />
        </>
      ) : (
        <>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 500 }}>{category.name}</div>
            <div style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>
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
          <Button size="small" type="text" icon={<PencilSimpleIcon size={16} />} onClick={() => onStartEdit(category)} />
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
            <Button size="small" type="text" danger icon={<TrashIcon size={16} />} loading={deletePending} />
          </Popconfirm>
        </>
      )}
    </div>
  )
}
