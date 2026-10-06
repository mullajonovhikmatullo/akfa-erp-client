import type { StoreTranslator } from '@store/store-i18n'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Drawer, Empty, Skeleton } from 'antd'
import type { ExpenseCategory } from '@store/store-stub'
import { usePagination } from '../../shared/hooks/usePagination'
import { ArrowPager } from '../../shared/view/ArrowPager'
import { useExpenseCategoriesPage } from '../hooks/useExpenseCategoriesPage'
import { useExpenseMutation } from '../hooks/useExpenseMutation'
import { ExpenseCategoryCreateForm, ExpenseCategoryRow, type CategoryManagerFormValues } from './view'

const CATEGORY_PAGE_SIZE = 8

interface CategoryManagerDrawerProps {
  t: StoreTranslator
  open: boolean
  onClose: () => void
}

export function CategoryManagerDrawer({ t, open, onClose }: CategoryManagerDrawerProps) {
  //
  const { page, pageSize, goToPage, resetPage } = usePagination(CATEGORY_PAGE_SIZE, 'categories')
  const categoriesQuery = useExpenseCategoriesPage({ includeInactive: true, page, pageSize }, { enabled: open })
  const categories = categoriesQuery.data?.items ?? []
  const total = categoriesQuery.data?.total ?? 0
  const lastPage = Math.max(1, Math.ceil(total / pageSize))
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

  useEffect(() => {
    //
    if (categoriesQuery.isPlaceholderData || !categoriesQuery.data) return
    if (page > lastPage) goToPage(lastPage)
  }, [categoriesQuery.data, categoriesQuery.isPlaceholderData, goToPage, lastPage, page])

  const close = () => {
    //
    resetPage()
    onClose()
  }

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
    <Drawer rootClassName="ant-drawer-root" title={t('categoryDrawer.title')} open={open} onClose={close} width={440} closable={{ placement: 'end' }} destroyOnHidden>
      <ExpenseCategoryCreateForm
        t={t}
        control={control}
        errors={errors}
        name={newName}
        pending={createCat.isPending}
        onSubmit={handleSubmit(submitCreate)}
      />

      {categoriesQuery.isLoading ? (
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

      <ArrowPager t={t} page={page} pageSize={pageSize} total={total} loading={categoriesQuery.isFetching} onChange={goToPage} />
    </Drawer>
  )
}
