import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button, Tooltip } from 'antd'
import { ArrowClockwiseIcon, PlusIcon } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { DataTable } from '@store/store-shared/ui/data-table'
import type { CreateAdminPayload, UpdateAdminPayload, User } from '@store/store-stub'
import { useBranchesList } from '../../branch'
import { usePagination } from '../../shared/hooks/usePagination'
import { useAdminsPage } from '../hooks/useAdminsPage'
import { useUserMutation } from '../hooks/useUserMutation'
import { AdminFormModal, type AdminFormValues } from './view/AdminFormModal'
import { createAdminColumns } from './view/adminColumns'

type Translate = (key: string) => string

export interface AdminsListProps {
  t: Translate
}

export function AdminsList({ t }: AdminsListProps) {
  //
  const { page, pageSize, onChange: onPageChange, rowIndex } = usePagination()
  const { data: result, isLoading, isFetching, refetch } = useAdminsPage(page, pageSize)
  const admins = result?.items ?? []
  const total = result?.total ?? 0
  const { data: branches = [], isLoading: branchesLoading } = useBranchesList()

  const { createAdmin: createMutation, updateAdmin: updateMutation, deleteAdmin: deleteMutation } = useUserMutation()

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AdminFormValues>({
    defaultValues: {
      name: '',
      username: '',
      password: '',
      branchId: undefined,
    },
  })
  const [editTarget, setEditTarget] = useState<User | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  function openCreate() {
    //
    setEditTarget(null)
    reset({ name: '', username: '', password: '', branchId: undefined })
    setModalOpen(true)
  }

  function openEdit(user: User) {
    //
    setEditTarget(user)
    reset({
      name: user.name,
      username: user.username,
      password: '',
      branchId: user.branchId ?? undefined,
    })
    setModalOpen(true)
  }

  function submitAdminForm(values: AdminFormValues) {
    //
    if (editTarget) {
      const payload: UpdateAdminPayload = {
        fullName: values.name,
        branchId: values.branchId ?? null,
      }
      updateMutation.mutate(
        { id: editTarget.id, data: payload },
        {
          onSuccess: () => {
            //
            toast.success(t('admins.updateSuccess'))
            setModalOpen(false)
          },
          onError: () => toast.error(t('admins.updateError')),
        },
      )
    } else {
      const payload: CreateAdminPayload = {
        fullName: values.name,
        username: values.username!,
        password: values.password!,
        branchId: values.branchId!,
      }
      createMutation.mutate(payload, {
        onSuccess: () => {
          //
          toast.success(t('admins.createSuccess'))
          setModalOpen(false)
        },
        onError: () => toast.error(t('admins.createError')),
      })
    }
  }

  const columns = createAdminColumns({
    t,
    rowIndex,
    branches,
    deleting: deleteMutation.isPending,
    deletingId: deleteMutation.variables,
    onEdit: openEdit,
    onDelete: (id) =>
      deleteMutation.mutate(id, {
        onSuccess: () => toast.success(t('admins.deleteSuccess')),
        onError: () => toast.error(t('admins.deleteError')),
      }),
  })

  const assigned = result?.totalAssigned ?? 0
  const unassigned = result?.totalUnassigned ?? 0

  return (
    <>
      <div className="page-head">
        <div>
          <h1>{t('admins.title')}</h1>
          <div className="sub">
            {total} {t('admins.subtitleSuffix')}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button type="primary" icon={<PlusIcon size={13} weight="bold" />} onClick={openCreate}>
            {t('admins.newAdmin')}
          </Button>
          <Tooltip title={t('common.refresh')}>
            <Button
              icon={<ArrowClockwiseIcon size={18} className={isFetching ? 'ph-icon-spin' : undefined} />}
              onClick={() => refetch()}
            />
          </Tooltip>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginBottom: 16 }}>
        <div className="card" style={{ padding: '14px 16px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>
            {t('common.total')}
          </div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{total}</div>
        </div>
        <div className="card" style={{ padding: '14px 16px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>
            {t('admins.statAssigned')}
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--success, #16a34a)' }}>{assigned}</div>
        </div>
        <div className="card" style={{ padding: '14px 16px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>
            {t('admins.statUnassigned')}
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: unassigned > 0 ? 'var(--warning, #d97706)' : 'inherit' }}>{unassigned}</div>
        </div>
        <div className="card" style={{ padding: '14px 16px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>
            {t('admins.statBranches')}
          </div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>
            {assigned} <span style={{ fontSize: 14, fontWeight: 400, color: 'var(--ink-3)' }}>/ {branches.length}</span>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <DataTable<User>
          rowKey="id"
          dataSource={admins}
          columns={columns}
          loading={isLoading}
          pagination={{
            current: page,
            pageSize,
            total,
            onChange: onPageChange,
            showSizeChanger: true,
            showTotal: (count) => `${count} ${t('common.countSuffix')}`,
            pageSizeOptions: ['10', '25', '50'],
          }}
          emptyText={t('admins.empty')}
        />
      </div>

      <AdminFormModal
        t={t}
        open={modalOpen}
        editTarget={editTarget}
        control={control}
        errors={errors}
        branches={branches}
        branchesLoading={branchesLoading}
        pending={createMutation.isPending || updateMutation.isPending}
        onCancel={() => setModalOpen(false)}
        onSubmit={handleSubmit(submitAdminForm)}
      />
    </>
  )
}
