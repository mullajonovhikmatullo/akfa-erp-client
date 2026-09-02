import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button, Tooltip } from 'antd'

import { toast } from 'sonner'
import { DataTable } from '@store/store-shared/ui/data-table'
import type { CreateAdminPayload, UpdateAdminPayload, User } from '@store/store-stub'
import { useBranchesList } from '../../branch'
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
  const { data: result, isLoading, isFetching, refetch, page, pageSize, onPageChange, rowIndex } = useAdminsPage()
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
        <div className="u-flex u-gap-8">
          <Button type="primary" icon={<i className="icons-plus icon-size-13" />} onClick={openCreate}>
            {t('admins.newAdmin')}
          </Button>
          <Tooltip title={t('common.refresh')}>
            <Button
              icon={<i className={['icons-reload icon-size-18', isFetching ? 'ph-icon-spin' : undefined].filter(Boolean).join(' ')} />}
              onClick={() => refetch()}
            />
          </Tooltip>
        </div>
      </div>

      <div className="u-grid u-gap-12 u-grid-cols-fill-180 u-mb-16">
        <div className="card u-p-14-16" >
          <div className="u-text-muted u-fs-11 u-fw-700 u-tracking-wide u-mb-6 u-text-uppercase">
            {t('common.total')}
          </div>
          <div className="u-fs-24 u-fw-700">{total}</div>
        </div>
        <div className="card u-p-14-16" >
          <div className="u-text-muted u-fs-11 u-fw-700 u-tracking-wide u-mb-6 u-text-uppercase">
            {t('admins.statAssigned')}
          </div>
          <div className="u-text-success-fallback u-fs-24 u-fw-700">{assigned}</div>
        </div>
        <div className="card u-p-14-16" >
          <div className="u-text-muted u-fs-11 u-fw-700 u-tracking-wide u-mb-6 u-text-uppercase">
            {t('admins.statUnassigned')}
          </div>
          <div className={`summary-value${unassigned > 0 ? ' tone-warning' : ''}`}>{unassigned}</div>
        </div>
        <div className="card u-p-14-16" >
          <div className="u-text-muted u-fs-11 u-fw-700 u-tracking-wide u-mb-6 u-text-uppercase">
            {t('admins.statBranches')}
          </div>
          <div className="u-fs-24 u-fw-700">
            {assigned} <span className="u-text-muted u-fs-14 u-fw-400">/ {branches.length}</span>
          </div>
        </div>
      </div>

      <div className="card u-overflow-hidden u-p-0" >
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
