import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Button, Form, Input, Modal, Popconfirm, Select, Tag, Tooltip } from 'antd'
import {
  ArrowClockwiseIcon,
  LockIcon,
  PencilSimpleIcon,
  PlusIcon,
  TrashIcon,
  UserSwitchIcon,
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import type { Branch } from '@erp/erp-shared/core'
import { blockAutofill } from '@erp/erp-shared/lib/autofill'
import { formatDate } from '@erp/erp-shared/lib/formatters'
import { DataTable, type ColumnDef } from '@erp/erp-shared/ui/data-table'
import { SelectLoadingContent } from '@erp/erp-shared/ui/select-loading-content'
import { StatusBadge } from '@erp/erp-shared/ui/status-badge'
import type { CreateAdminPayload, UpdateAdminPayload, User } from '@erp/store-buddy-stub'
import { useBranches } from '../../branch/hooks/useBranches'
import { usePagination } from '../../shared/hooks/usePagination'
import { AdminAvatar } from '../shared/AdminAvatar'
import { useAdminsPage, useCreateAdmin, useDeleteAdmin, useUpdateAdmin } from '../hooks/useAdminUsers'

type Translate = (key: string) => string

type AdminFormValues = {
  name: string
  username?: string
  password?: string
  branchId?: string | null
}

export interface AdminsListProps {
  t: Translate
}

export function AdminsList({ t }: AdminsListProps) {
  //
  const { page, pageSize, onChange: onPageChange, rowIndex } = usePagination()
  const { data: result, isLoading, isFetching, refetch } = useAdminsPage(page, pageSize)
  const admins = result?.items ?? []
  const total = result?.total ?? 0
  const { data: branches = [], isLoading: branchesLoading } = useBranches()

  const createMutation = useCreateAdmin()
  const updateMutation = useUpdateAdmin()
  const deleteMutation = useDeleteAdmin()

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

  const getBranch = (branchId: string | null | undefined): Branch | undefined =>
    branches.find((branch) => branch.id === branchId)

  const columns: ColumnDef<User>[] = [
    {
      title: '#',
      key: '_idx',
      width: 40,
      render: (_: unknown, __: unknown, index: number) => (
        <span style={{ color: 'var(--ink-4)', fontSize: 11, fontVariantNumeric: 'tabular-nums' }}>{rowIndex(index)}</span>
      ),
    },
    {
      title: t('admins.colAdmin'),
      key: 'name',
      render: (_: unknown, user: User) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <AdminAvatar name={user.name} />
          <div>
            <div style={{ fontWeight: 600 }}>{user.name}</div>
            <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>@{user.username}</div>
          </div>
        </div>
      ),
    },
    {
      title: t('admins.colAssignedBranch'),
      key: 'branch',
      width: 220,
      render: (_: unknown, user: User) => {
        //
        const branch = getBranch(user.branchId)
        return branch ? <StatusBadge tone="info">{branch.name}</StatusBadge> : <Tag color="warning">{t('common.unassigned')}</Tag>
      },
    },
    {
      title: t('admins.colRole'),
      key: 'role',
      width: 140,
      render: () => <StatusBadge tone="muted">{t('admins.roleBranchAdmin')}</StatusBadge>,
    },
    {
      title: t('common.added'),
      key: 'createdAt',
      width: 120,
      responsiveHide: true,
      render: (_: unknown, user: User) =>
        user.createdAt ? (
          <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>{formatDate(user.createdAt)}</span>
        ) : (
          <span style={{ color: 'var(--ink-4)' }}>—</span>
        ),
    },
    {
      title: '',
      key: 'actions',
      width: 90,
      fixed: 'right',
      render: (_: unknown, user: User) => (
        <div style={{ display: 'flex', gap: 4 }}>
          <Button
            size="small"
            type="text"
            icon={<PencilSimpleIcon size={18} />}
            onClick={(event) => {
              //
              event.stopPropagation()
              openEdit(user)
            }}
          />
          <Popconfirm
            title={t('common.deleteTitle')}
            description={t('admins.deleteDesc')}
            okText={t('common.delete')}
            cancelText={t('common.cancel')}
            okButtonProps={{ danger: true, loading: deleteMutation.isPending && deleteMutation.variables === user.id }}
            onConfirm={(event) => {
              //
              event?.stopPropagation()
              deleteMutation.mutate(user.id, {
                onSuccess: () => toast.success(t('admins.deleteSuccess')),
                onError: () => toast.error(t('admins.deleteError')),
              })
            }}
            onPopupClick={(event) => event.stopPropagation()}
          >
            <Button
              size="small"
              type="text"
              danger
              icon={<TrashIcon size={18} />}
              loading={deleteMutation.isPending && deleteMutation.variables === user.id}
              onClick={(event) => event.stopPropagation()}
            />
          </Popconfirm>
        </div>
      ),
    },
  ]

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
          <Tooltip title={t('common.refresh')}>
            <Button
              icon={<ArrowClockwiseIcon size={18} className={isFetching ? 'ph-icon-spin' : undefined} />}
              onClick={() => refetch()}
            />
          </Tooltip>
          <Button type="primary" icon={<PlusIcon size={18} weight="bold" />} onClick={openCreate}>
            {t('admins.newAdmin')}
          </Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginBottom: 16 }}>
        <div className="card" style={{ padding: '14px 16px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>
            {t('common.total')}
          </div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{total}</div>
        </div>
        <div className="card" style={{ padding: '14px 16px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>
            {t('admins.statAssigned')}
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--success, #16a34a)' }}>{assigned}</div>
        </div>
        <div className="card" style={{ padding: '14px 16px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>
            {t('admins.statUnassigned')}
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: unassigned > 0 ? 'var(--warning, #d97706)' : 'inherit' }}>{unassigned}</div>
        </div>
        <div className="card" style={{ padding: '14px 16px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>
            {t('admins.statBranches')}
          </div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>
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

      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <UserSwitchIcon size={18} weight="duotone" />
            {editTarget ? `${t('common.edit')} — ${editTarget.name}` : t('admins.modalCreate')}
          </div>
        }
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSubmit(submitAdminForm)}
        okText={editTarget ? t('common.save') : t('common.create')}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        destroyOnClose
        width={480}
      >
        <Form layout="vertical" autoComplete="off" style={{ marginTop: 16 }}>
          <Form.Item label={t('profile.fullName')} required validateStatus={errors.name ? 'error' : undefined} help={errors.name?.message}>
            <Controller
              name="name"
              control={control}
              rules={{ required: t('admins.nameRequired') }}
              render={({ field }) => (
                <Input {...field} {...blockAutofill('akfa-admin-full-name')} placeholder={t('profile.fullNamePlaceholder')} />
              )}
            />
          </Form.Item>

          {!editTarget && (
            <Form.Item
              label={t('profile.username')}
              required
              validateStatus={errors.username ? 'error' : undefined}
              help={errors.username?.message}
            >
              <Controller
                name="username"
                control={control}
                rules={{
                  required: t('admins.usernameRequired'),
                  pattern: { value: /^[a-zA-Z0-9_]+$/, message: t('admins.usernamePattern') },
                }}
                render={({ field }) => (
                  <Input {...field} {...blockAutofill('akfa-admin-username')} placeholder={t('profile.usernamePlaceholder')} prefix="@" />
                )}
              />
            </Form.Item>
          )}

          {!editTarget && (
            <Form.Item
              label={t('admins.labelPassword')}
              required
              validateStatus={errors.password ? 'error' : undefined}
              help={errors.password?.message}
            >
              <Controller
                name="password"
                control={control}
                rules={{
                  required: t('admins.passwordRequired'),
                  minLength: { value: 6, message: t('pwd.minLen') },
                }}
                render={({ field }) => (
                  <Input.Password
                    {...field}
                    {...blockAutofill('akfa-admin-new-password')}
                    placeholder={t('pwd.minLen')}
                    prefix={<LockIcon size={18} color="currentColor" style={{ color: 'var(--ink-3)' }} />}
                  />
                )}
              />
            </Form.Item>
          )}

          <Form.Item
            label={t('admins.labelBranch')}
            required={!editTarget}
            validateStatus={errors.branchId ? 'error' : undefined}
            help={errors.branchId?.message}
          >
            <Controller
              name="branchId"
              control={control}
              rules={editTarget ? undefined : { required: t('admins.branchRequired') }}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onChange={field.onChange}
                  allowClear={!!editTarget}
                  placeholder={t('admins.branchPlaceholder')}
                  loading={branchesLoading}
                  notFoundContent={branchesLoading ? <SelectLoadingContent /> : undefined}
                  options={branches.map((branch) => ({ value: branch.id, label: branch.name }))}
                />
              )}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
