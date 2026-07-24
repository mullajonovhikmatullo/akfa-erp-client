import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Button, Form, Input, Modal, Popconfirm, Switch, Tag, Tooltip } from 'antd'
import { ArrowClockwiseIcon, PencilSimpleIcon, PlusIcon, TagIcon, TrashIcon } from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { Category } from '@store/store-shared/core'
import { blockAutofill } from '@store/store-shared/lib/autofill'
import { formatDate } from '@store/store-shared/lib/formatters'
import { getField } from '@store/store-shared/lib/parse-excel'
import { DataTable, type ColumnDef } from '@store/store-shared/ui/data-table'
import { ExcelImportButton } from '@store/store-shared/ui/excel-import-button'
import { StatusBadge } from '@store/store-shared/ui/status-badge'
import { categoryApi } from '@store/store-stub'
import type { CreateCategoryPayload, UpdateCategoryPayload } from '@store/store-stub'
import { usePagination } from '../../shared/hooks/usePagination'
import { useCategoriesPage, useCategorySummary, useCreateCategory, useDeleteCategory, useUpdateCategory } from '../hooks/useCategories'
import { CategoryIcon } from '../shared/CategoryIcon'

type Translate = (key: string) => string

type CategoryFormValues = {
  name: string
  description?: string
  isActive?: boolean
}

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

  const createMutation = useCreateCategory()
  const updateMutation = useUpdateCategory()
  const deleteMutation = useDeleteCategory()

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
            toast.error((error as { response?: { data?: { message?: string } } }).response?.data?.message ?? t('categories.updateError')),
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
          toast.error((error as { response?: { data?: { message?: string } } }).response?.data?.message ?? t('categories.createError')),
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

  const columns: ColumnDef<Category>[] = [
    {
      title: '#',
      key: '_idx',
      width: 40,
      render: (_: unknown, __: unknown, index: number) => (
        <span style={{ color: 'var(--ink-4)', fontSize: 11, fontVariantNumeric: 'tabular-nums' }}>{rowIndex(index)}</span>
      ),
    },
    {
      title: t('common.name'),
      key: 'name',
      render: (_: unknown, category: Category) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <CategoryIcon name={category.name} />
          <div>
            <div style={{ fontWeight: 600 }}>{category.name}</div>
            {category.description && <div style={{ fontSize: 12, color: 'var(--ink-3)', maxWidth: 300 }}>{category.description}</div>}
          </div>
        </div>
      ),
    },
    {
      title: t('common.status'),
      key: 'isActive',
      width: 110,
      responsiveHide: true,
      filters: [
        { text: t('common.active'), value: 'active' },
        { text: t('common.inactive'), value: 'inactive' },
      ],
      filterMultiple: false,
      filteredValue: statusFilter === 'all' ? null : [statusFilter],
      render: (_: unknown, category: Category) =>
        category.isActive ? <StatusBadge tone="success">{t('common.active')}</StatusBadge> : <Tag color="default">{t('common.inactive')}</Tag>,
    },
    {
      title: t('common.added'),
      key: 'createdAt',
      width: 120,
      responsiveHide: true,
      render: (_: unknown, category: Category) =>
        category.createdAt ? (
          <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>{formatDate(category.createdAt)}</span>
        ) : (
          <span style={{ color: 'var(--ink-4)' }}>—</span>
        ),
    },
    {
      title: '',
      key: 'actions',
      width: 90,
      fixed: 'right',
      render: (_: unknown, category: Category) => (
        <div style={{ display: 'flex', gap: 4 }}>
          <Button
            size="small"
            type="text"
            icon={<PencilSimpleIcon size={18} />}
            onClick={(event) => {
              //
              event.stopPropagation()
              openEdit(category)
            }}
          />
          <Popconfirm
            title={t('categories.deleteTitle')}
            description={t('categories.deleteDesc')}
            okText={t('common.delete')}
            cancelText={t('common.cancel')}
            okButtonProps={{ danger: true, loading: deleteMutation.isPending && deleteMutation.variables === category.id }}
            onConfirm={(event) => {
              //
              event?.stopPropagation()
              deleteMutation.mutate(category.id, {
                onSuccess: () => toast.success(t('categories.deleteSuccess')),
                onError: (error: unknown) =>
                  toast.error((error as { response?: { data?: { message?: string } } }).response?.data?.message ?? t('categories.deleteError')),
              })
            }}
            onPopupClick={(event) => event.stopPropagation()}
          >
            <Button
              size="small"
              type="text"
              danger
              icon={<TrashIcon size={18} />}
              loading={deleteMutation.isPending && deleteMutation.variables === category.id}
              onClick={(event) => event.stopPropagation()}
            />
          </Popconfirm>
        </div>
      ),
    },
  ]

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
          <Tooltip title={t('common.refresh')}>
            <Button
              icon={<ArrowClockwiseIcon size={18} className={isFetching ? 'ph-icon-spin' : undefined} />}
              onClick={handleRefresh}
            />
          </Tooltip>
          <ExcelImportButton<CreateCategoryPayload>
            t={t}
            entityLabel={t('nav.categories')}
            templateHeaders={['name', 'description']}
            templateExamples={[['Glass Panels', 'All types of flat glass products']]}
            templateFileName="categories_template.xlsx"
            parseRow={(raw, index) => {
              //
              const name = getField(raw, 'name')
              if (!name) return { index, raw, error: t('categories.parseErrorName') }
              if (name.length > 100) return { index, raw, error: 'name 100 belgidan oshmasligi kerak' }
              const description = getField(raw, 'description') || undefined
              if (description && description.length > 500) {
                return { index, raw, error: 'description 500 belgidan oshmasligi kerak' }
              }
              return { index, raw, data: { name, description } }
            }}
            createFn={(data) => categoryApi.create(data)}
            onComplete={() => {
              //
              refetch()
              refetchSummary()
            }}
          />
          <Button type="primary" icon={<PlusIcon size={18} weight="bold" />} onClick={openCreate}>
            {t('categories.newCategory')}
          </Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginBottom: 16 }}>
        <div className="card" style={{ padding: '14px 16px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>
            {t('common.total')}
          </div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{totalCategories}</div>
        </div>
        <div className="card" style={{ padding: '14px 16px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>
            {t('common.active')}
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--success, #16a34a)' }}>{active}</div>
        </div>
        <div className="card" style={{ padding: '14px 16px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>
            {t('common.inactive')}
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: inactive > 0 ? 'var(--warning, #d97706)' : 'inherit' }}>{inactive}</div>
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

      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <TagIcon size={18} weight="duotone" />
            {editTarget ? `${t('common.edit')} — ${editTarget.name}` : t('categories.modalCreate')}
          </div>
        }
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleCategorySubmit(submitCategoryForm)}
        okText={editTarget ? t('common.save') : t('common.create')}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        destroyOnClose
        width={440}
      >
        <Form layout="vertical" autoComplete="off" style={{ marginTop: 16 }}>
          <Form.Item
            label={t('common.name')}
            required
            validateStatus={categoryErrors.name ? 'error' : undefined}
            help={categoryErrors.name?.message}
          >
            <Controller
              name="name"
              control={categoryControl}
              rules={{
                required: t('categories.nameRequired'),
                maxLength: { value: 100, message: 'name 100 belgidan oshmasligi kerak' },
              }}
              render={({ field }) => <Input {...field} {...blockAutofill('store-category-name')} placeholder={t('categories.namePlaceholder')} />}
            />
          </Form.Item>

          <Form.Item
            label={t('common.description')}
            validateStatus={categoryErrors.description ? 'error' : undefined}
            help={categoryErrors.description?.message}
          >
            <Controller
              name="description"
              control={categoryControl}
              rules={{
                maxLength: { value: 500, message: 'description 500 belgidan oshmasligi kerak' },
              }}
              render={({ field }) => (
                <Input.TextArea
                  {...field}
                  {...blockAutofill('store-category-description')}
                  placeholder={t('categories.descPlaceholder')}
                  rows={3}
                  maxLength={500}
                  showCount
                />
              )}
            />
          </Form.Item>

          {editTarget && (
            <Form.Item label={t('common.status')}>
              <Controller
                name="isActive"
                control={categoryControl}
                render={({ field }) => (
                  <Switch
                    checked={field.value ?? true}
                    onChange={field.onChange}
                    checkedChildren={t('common.active')}
                    unCheckedChildren={t('common.inactive')}
                  />
                )}
              />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </>
  )
}
