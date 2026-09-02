import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Drawer, Empty, Skeleton } from 'antd'
import type { ExpenseCategory } from '@store/store-stub'
import { useExpenseCategoriesList } from '../hooks/useExpenseCategoriesList'
import { useExpenseMutation } from '../hooks/useExpenseMutation'
import { ExpenseCategoryCreateForm, ExpenseCategoryRow, type CategoryManagerFormValues } from './view'

interface CategoryManagerDrawerProps {
  t: (key: string) => string
  open: boolean
  onClose: () => void
}

export function CategoryManagerDrawer({ t, open, onClose }: CategoryManagerDrawerProps) {
  //
  const { data: categories = [], isLoading } = useExpenseCategoriesList(true)
  const { createExpenseCategory: createCat, updateExpenseCategory: updateCat, deleteExpenseCategory: deleteCat } = useExpenseMutation(t)

  const [editingId, setEditingId] = useState<string | null>(null)
  const { control, handleSubmit, resetField, setValue, getValues, watch, formState: { errors } } = useForm<CategoryManagerFormValues>({
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

  const saveEdit = (id: string, rawName = getValues('editName')) => {
    //
    const name = rawName.trim()
    if (!name) return
    updateCat.mutate({ id, payload: { name } }, { onSuccess: () => setEditingId(null) })
  }

  const submitEdit = (id: string) => {
    handleSubmit((values) => saveEdit(id, values.editName))()
  }

  return (
    <Drawer rootClassName="ant-drawer-root" title={t('categoryDrawer.title')} open={open} onClose={onClose} width={440} closable={{ placement: 'end' }} destroyOnHidden>
      <ExpenseCategoryCreateForm
        t={t}
        control={control}
        errors={errors}
        name={newName}
        pending={createCat.isPending}
        onSubmit={handleSubmit(submitCreate)}
      />

      {isLoading ? (
        <Skeleton active paragraph={{ rows: 4 }} />
      ) : categories.length === 0 ? (
        <Empty description={t('categoryDrawer.emptyCategories')} image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <div className="u-flex u-flex-col u-gap-8">
          {categories.map((category) => (
            <ExpenseCategoryRow
              key={category.id}
              category={category}
              t={t}
              control={control}
              errors={errors}
              editName={editName}
              editing={editingId === category.id}
              updatePending={updateCat.isPending}
              deletePending={deleteCat.isPending && deleteCat.variables === category.id}
              onStartEdit={startEdit}
              onSubmitEdit={submitEdit}
              onCancelEdit={() => {
                //
                setEditingId(null)
                resetField('editName')
              }}
              onToggleActive={(id, isActive) => updateCat.mutate({ id, payload: { isActive } })}
              onDelete={(id) => deleteCat.mutate(id)}
            />
          ))}
        </div>
      )}
    </Drawer>
  )
}
