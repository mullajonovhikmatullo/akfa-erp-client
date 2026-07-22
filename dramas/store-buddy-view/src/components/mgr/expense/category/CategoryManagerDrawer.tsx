import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Button, Drawer, Empty, Input, Popconfirm, Skeleton, Switch } from 'antd'
import { CheckIcon, PencilSimpleIcon, PlusIcon, TrashIcon, XIcon } from '@phosphor-icons/react'
import { blockAutofill } from '@erp/erp-shared/lib/autofill'
import { StatusBadge } from '@erp/erp-shared/ui/status-badge'
import type { ExpenseCategory } from '@erp/store-buddy-stub'
import {
  useCreateExpenseCategory,
  useDeleteExpenseCategory,
  useExpenseCategories,
  useUpdateExpenseCategory,
} from '../hooks/useExpenses'

interface CategoryManagerDrawerProps {
  t: (key: string) => string
  open: boolean
  onClose: () => void
}

type CategoryManagerFormValues = {
  newName: string
  editName: string
}

export function CategoryManagerDrawer({ t, open, onClose }: CategoryManagerDrawerProps) {
  //
  const { data: categories = [], isLoading } = useExpenseCategories(true)
  const createCat = useCreateExpenseCategory()
  const updateCat = useUpdateExpenseCategory()
  const deleteCat = useDeleteExpenseCategory()

  const [editingId, setEditingId] = useState<string | null>(null)
  const { control, handleSubmit, resetField, setValue, getValues, watch } = useForm<CategoryManagerFormValues>({
    defaultValues: {
      newName: '',
      editName: '',
    },
  })
  const newName = watch('newName') ?? ''
  const editName = watch('editName') ?? ''

  const submitCreate = (values: CategoryManagerFormValues) => {
    //
    const name = values.newName.trim()
    if (!name) return
    createCat.mutate({ name }, { onSuccess: () => resetField('newName') })
  }

  const startEdit = (category: ExpenseCategory) => {
    //
    setEditingId(category.id)
    setValue('editName', category.name)
  }

  const saveEdit = (id: string) => {
    //
    const name = getValues('editName').trim()
    if (!name) return
    updateCat.mutate({ id, payload: { name } }, { onSuccess: () => setEditingId(null) })
  }

  return (
    <Drawer title={t('categoryDrawer.title')} open={open} onClose={onClose} width={440} destroyOnHidden>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <Controller
          name="newName"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              {...blockAutofill('akfa-expense-category-new-name')}
              placeholder={t('categoryDrawer.placeholderNewName')}
              onPressEnter={handleSubmit(submitCreate)}
              style={{ flex: 1 }}
            />
          )}
        />
        <Button
          type="primary"
          icon={<PlusIcon size={18} weight="bold" />}
          loading={createCat.isPending}
          disabled={!newName.trim()}
          onClick={handleSubmit(submitCreate)}
        >
          {t('common.add')}
        </Button>
      </div>

      {isLoading ? (
        <Skeleton active paragraph={{ rows: 4 }} />
      ) : categories.length === 0 ? (
        <Empty description={t('categoryDrawer.emptyCategories')} image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {categories.map((category) => (
            <div
              key={category.id}
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
              {editingId === category.id ? (
                <>
                  <Controller
                    name="editName"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        {...blockAutofill(`akfa-expense-category-edit-${category.id}`)}
                        onPressEnter={() => saveEdit(category.id)}
                        style={{ flex: 1 }}
                        autoFocus
                      />
                    )}
                  />
                  <Button
                    size="small"
                    type="primary"
                    icon={<CheckIcon size={16} weight="bold" />}
                    onClick={() => saveEdit(category.id)}
                    loading={updateCat.isPending}
                    disabled={!editName.trim()}
                  />
                  <Button
                    size="small"
                    icon={<XIcon size={16} />}
                    onClick={() => {
                      //
                      setEditingId(null)
                      resetField('editName')
                    }}
                  />
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
                    loading={updateCat.isPending}
                    onChange={(checked) => updateCat.mutate({ id: category.id, payload: { isActive: checked } })}
                  />
                  <Button size="small" type="text" icon={<PencilSimpleIcon size={16} />} onClick={() => startEdit(category)} />
                  <Popconfirm
                    title={t('categoryDrawer.popconfirmTitle')}
                    description={
                      category._count.expenses > 0
                        ? t('categoryDrawer.popconfirmHasExpenses')
                        : t('categoryDrawer.popconfirmNoExpenses')
                    }
                    okText={t('categoryDrawer.okText')}
                    cancelText={t('categoryDrawer.cancelText')}
                    okButtonProps={{
                      danger: true,
                      disabled: category._count.expenses > 0,
                      loading: deleteCat.isPending && deleteCat.variables === category.id,
                    }}
                    onConfirm={() => deleteCat.mutate(category.id)}
                  >
                    <Button
                      size="small"
                      type="text"
                      danger
                      icon={<TrashIcon size={16} />}
                      loading={deleteCat.isPending && deleteCat.variables === category.id}
                    />
                  </Popconfirm>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </Drawer>
  )
}
