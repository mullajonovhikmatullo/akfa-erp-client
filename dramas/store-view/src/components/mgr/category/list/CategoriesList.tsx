import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button, Tooltip } from 'antd'
import { ArrowClockwiseIcon, PlusIcon } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { getLocalizedApiErrorMessage } from '@store/store-shared'
import { DataTable } from '@store/store-shared/ui/data-table'
import { ExcelImportButton } from '@store/store-shared/ui/excel-import-button'
import type { Category, CreateCategoryPayload, UpdateCategoryPayload } from '@store/store-stub'
import { usePagination } from '../../shared/hooks/usePagination'
import { useCategoriesPage } from '../hooks/useCategoriesPage'
import { useCategoryMutation } from '../hooks/useCategoryMutation'
import { useCategorySummary } from '../hooks/useCategorySummary'
import { createCategoryImportParser } from './categoryImport'
import { CategoryFormModal, type CategoryFormValues } from './view/CategoryFormModal'
import { createCategoryColumns } from './view/categoryColumns'

type Translate = (key: string) => string

type CategoryStatusFilter = 'all' | 'active' | 'inactive'

type CategoryFiltersForm = {
  status: CategoryStatusFilter
}

export interface CategoriesListProps {
  t: Translate
}

export function CategoriesList({ t }: CategoriesListProps) {
  //
  const { page, pageSize, onChange: onPageChange, rowIndex } = usePagination()
  const { setValue: setFilterValue, watch: watchFilters } = useForm<CategoryFiltersForm>({
    defaultValues: { status: 'all' },
  })
  const statusFilter = watchFilters('status')
  const isActiveFilter = statusFilter === 'all' ? undefined : statusFilter === 'active'
  const { data: result, isLoading, isFetching, refetch } = useCategoriesPage(page, pageSize, isActiveFilter)
  const { data: summary, refetch: refetchSummary } = useCategorySummary()
  const categories = result?.items ?? []
  const filteredTotal = result?.total ?? 0

  const { createCategory: createMutation, updateCategory: updateMutation, deleteCategory: deleteMutation } = useCategoryMutation()

  const {
    control: categoryControl,
    handleSubmit: handleCategorySubmit,
    reset: resetCategoryForm,
    formState: { errors: categoryErrors },
  } = useForm<CategoryFormValues>({
    defaultValues: {
      name: '',
      description: '',
      isActive: true,
    },
  })
  const [editTarget, setEditTarget] = useState<Category | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const parseCategoryImportRow = createCategoryImportParser(t)

  function openCreate() {
    //
    setEditTarget(null)
    resetCategoryForm({ name: '', description: '', isActive: true })
    setModalOpen(true)
  }

  function openEdit(category: Category) {
    //
    setEditTarget(category)
    resetCategoryForm({
      name: category.name,
      description: category.description ?? '',
      isActive: category.isActive,
    })
    setModalOpen(true)
  }

  function submitCategoryForm(values: CategoryFormValues) {
    //
    if (editTarget) {
      const payload: UpdateCategoryPayload = {
        name: values.name,
        description: values.description || undefined,
        isActive: values.isActive,
      }
      updateMutation.mutate(
        { id: editTarget.id, payload },
        {
          onSuccess: () => {
            //
            toast.success(t('categories.updateSuccess'))
            setModalOpen(false)
          },
          onError: (error: unknown) =>
            toast.error(getLocalizedApiErrorMessage(error, t, 'categories.updateError')),
        },
      )
    } else {
      const payload: CreateCategoryPayload = {
        name: values.name,
        description: values.description || undefined,
      }
      createMutation.mutate(payload, {
        onSuccess: () => {
          //
          toast.success(t('categories.createSuccess'))
          setModalOpen(false)
        },
        onError: (error: unknown) =>
          toast.error(getLocalizedApiErrorMessage(error, t, 'categories.createError')),
      })
    }
  }

  const active = summary?.totalActive ?? 0
  const inactive = summary?.totalInactive ?? 0
  const totalCategories = active + inactive

  function handleRefresh() {
    //
    refetch()
    refetchSummary()
  }

  const columns = createCategoryColumns({
    t,
    rowIndex,
    statusFilter,
    deleting: deleteMutation.isPending,
    deletingId: deleteMutation.variables,
    onEdit: openEdit,
    onDelete: (id) =>
      deleteMutation.mutate(id, {
        onSuccess: () => toast.success(t('categories.deleteSuccess')),
        onError: (error: unknown) => toast.error(getLocalizedApiErrorMessage(error, t, 'categories.deleteError')),
      }),
  })

  return (
    <>
      <div className="page-head">
        <div>
          <h1>{t('nav.categories')}</h1>
          <div className="sub">
            {totalCategories} {t('categories.subtitleSuffix')}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button type="primary" icon={<PlusIcon size={13} weight="bold" />} onClick={openCreate}>
            {t('categories.newCategory')}
          </Button>
          <ExcelImportButton<CreateCategoryPayload>
            t={t}
            entityLabel={t('nav.categories')}
            templateHeaders={['name', 'description']}
            templateExamples={[['Glass Panels', 'All types of flat glass products']]}
            templateFileName="categories_template.xlsx"
            parseRow={parseCategoryImportRow}
            createFn={createMutation.mutateAsync}
            onComplete={() => {
              //
              refetch()
              refetchSummary()
            }}
          />
          <Tooltip title={t('common.refresh')}>
            <Button
              icon={<ArrowClockwiseIcon size={18} className={isFetching ? 'ph-icon-spin' : undefined} />}
              onClick={handleRefresh}
            />
          </Tooltip>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginBottom: 16 }}>
        <div className="card" style={{ padding: '14px 16px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>
            {t('common.total')}
          </div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{totalCategories}</div>
        </div>
        <div className="card" style={{ padding: '14px 16px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>
            {t('common.active')}
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--success, #16a34a)' }}>{active}</div>
        </div>
        <div className="card" style={{ padding: '14px 16px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>
            {t('common.inactive')}
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: inactive > 0 ? 'var(--warning, #d97706)' : 'inherit' }}>{inactive}</div>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <DataTable<Category>
          rowKey="id"
          dataSource={categories}
          columns={columns}
          loading={isLoading}
          onChange={(pagination, filters, _sorter, extra) => {
            //
            const selectedStatus = filters.isActive?.[0]
            const nextStatus = selectedStatus === 'active' || selectedStatus === 'inactive' ? selectedStatus : 'all'
            const nextPageSize = pagination.pageSize ?? pageSize
            const nextPage = extra.action === 'filter' && nextStatus !== statusFilter ? 1 : pagination.current ?? page

            if (nextStatus !== statusFilter) {
              setFilterValue('status', nextStatus)
            }
            onPageChange(nextPage, nextPageSize)
          }}
          pagination={{
            current: page,
            pageSize,
            total: filteredTotal,
            onChange: onPageChange,
            showSizeChanger: true,
            showTotal: (count) => `${count} ${t('common.countSuffix')}`,
            pageSizeOptions: ['10', '25', '50'],
          }}
          emptyText={t('categories.empty')}
        />
      </div>

      <CategoryFormModal
        t={t}
        open={modalOpen}
        editTarget={editTarget}
        control={categoryControl}
        errors={categoryErrors}
        pending={createMutation.isPending || updateMutation.isPending}
        onCancel={() => setModalOpen(false)}
        onSubmit={handleCategorySubmit(submitCategoryForm)}
      />
    </>
  )
}
