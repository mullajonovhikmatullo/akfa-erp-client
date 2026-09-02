import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { Alert, Button, Form, Input, Modal, Select, Tooltip } from 'antd'
import { useNavigate } from 'react-router-dom'
import {
  ArrowClockwiseIcon,
  ArrowUpRight,
  PlusIcon,
  UserPlusIcon,
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { blockAutofill } from '@store/store-shared/lib/autofill'
import { formatDate } from '@store/store-shared/lib/formatters'
import { isValidUzbekMobilePhone } from '@store/store-shared'
import { DataTable } from '@store/store-shared/ui/data-table'
import { SelectLoadingContent } from '@store/store-shared/ui/select-loading-content'
import { UzbekPhoneInput } from '@store/store-shared'
import type { Branch, BranchPayload, User } from '@store/store-stub'
import { useUserMutation } from '../../admins/hooks/useUserMutation'
import { useUsersList } from '../../admins/hooks/useUsersList'
import { usePagination } from '../../shared/hooks/usePagination'
import { useBranchMutation } from '../hooks/useBranchMutation'
import { useBranchesPage } from '../hooks/useBranchesPage'
import { createBranchColumns } from './view/branchColumns'

type Translate = (key: string) => string

type AssignBranchFormValues = {
  userId?: string | null
}

export interface BranchesListProps {
  t: Translate
  currentUser?: User | null
  isStoreOwner?: boolean
}

export function BranchesList({ t, currentUser, isStoreOwner = false }: BranchesListProps) {
  //
  const navigate = useNavigate()
  const { page, pageSize, onChange: onPageChange, rowIndex } = usePagination()
  const { data: result, isLoading, isFetching, refetch } = useBranchesPage(page, pageSize)
  const branches = result?.items ?? []
  const total = result?.total ?? 0
  const maxBranches = currentUser?.store?.plan?.maxBranches
  const branchLimitReached = typeof maxBranches === 'number' && total >= maxBranches
  const [branchLimitNoticeDismissed, setBranchLimitNoticeDismissed] = useState(false)
  const { data: users = [], isLoading: usersLoading } = useUsersList()

  const { createBranch: createMutation, updateBranch: updateMutation, deleteBranch: deleteMutation } = useBranchMutation()
  const { assignBranch: assignMutation } = useUserMutation()

  const {
    control: branchControl,
    handleSubmit: handleBranchFormSubmit,
    reset: resetBranchForm,
    formState: { errors: branchErrors },
  } = useForm<BranchPayload>({
    defaultValues: {
      name: '',
      address: '',
      phone: '',
    },
  })
  const {
    control: assignControl,
    handleSubmit: handleAssignFormSubmit,
    reset: resetAssignForm,
  } = useForm<AssignBranchFormValues>({
    defaultValues: {
      userId: null,
    },
  })

  const [editTarget, setEditTarget] = useState<Branch | null>(null)
  const [branchModalOpen, setBranchModalOpen] = useState(false)
  const [assignTarget, setAssignTarget] = useState<Branch | null>(null)

  useEffect(() => {
    if (!branchLimitReached) setBranchLimitNoticeDismissed(false)
  }, [branchLimitReached])

  const branchAdmins = users.filter((user) => user.role === 'branch_admin')

  function getAssignedUser(branchId: string) {
    //
    const admin = branchAdmins.find((user) => user.branchId === branchId)
    if (admin) return admin
    if (isStoreOwner && currentUser?.branchId === branchId) return currentUser
    return null
  }

  function openCreate() {
    //
    if (branchLimitReached) return
    setEditTarget(null)
    resetBranchForm({ name: '', address: '', phone: '' })
    setBranchModalOpen(true)
  }

  function openEdit(branch: Branch) {
    //
    setEditTarget(branch)
    resetBranchForm({ name: branch.name, address: branch.address ?? '', phone: branch.phone ?? '' })
    setBranchModalOpen(true)
  }

  function openAssign(branch: Branch) {
    //
    setAssignTarget(branch)
    const currentAdmin = branchAdmins.find((user) => user.branchId === branch.id)
    resetAssignForm({ userId: currentAdmin?.id ?? null })
  }

  function submitBranchForm(values: BranchPayload) {
    //
    const payload: BranchPayload = {
      name: values.name,
      address: values.address || undefined,
      phone: values.phone || undefined,
    }

    if (editTarget) {
      updateMutation.mutate(
        { id: editTarget.id, data: payload },
        {
          onSuccess: () => {
            //
            toast.success(t('branches.updateSuccess'))
            setBranchModalOpen(false)
          },
          onError: () => toast.error(t('branches.updateError')),
        },
      )
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          //
          toast.success(t('branches.createSuccess'))
          setBranchModalOpen(false)
        },
        onError: () => toast.error(t('branches.createError')),
      })
    }
  }

  function submitAssignForm({ userId }: AssignBranchFormValues) {
    //
    if (!assignTarget) return

    const prevAdmin = branchAdmins.find((user) => user.branchId === assignTarget.id)

    const steps: Promise<unknown>[] = []
    if (prevAdmin && prevAdmin.id !== userId) {
      steps.push(assignMutation.mutateAsync({ userId: prevAdmin.id, branchId: null }))
    }
    if (userId) {
      steps.push(assignMutation.mutateAsync({ userId, branchId: assignTarget.id }))
    }

    Promise.all(steps)
      .then(() => {
        //
        toast.success(t('branches.assignSuccess'))
        setAssignTarget(null)
      })
      .catch(() => toast.error(t('branches.assignError')))
  }

  const columns = createBranchColumns({
    t,
    rowIndex,
    branchAdmins,
    currentUser,
    isStoreOwner,
    deleting: deleteMutation.isPending,
    deletingId: deleteMutation.variables,
    onAssign: openAssign,
    onEdit: openEdit,
    onDelete: (id) => deleteMutation.mutate(id, {
      onSuccess: () => toast.success(t('branches.deleteSuccess')),
      onError: () => toast.error(t('branches.deleteError')),
    }),
  })

  const unassignedAdmins = branchAdmins.filter((user) => !user.branchId || user.branchId === assignTarget?.id)

  return (
    <>
      <div className="page-head">
        <div>
          <h1>{t('nav.branches')}</h1>
          <div className="sub">
            {total} {t('branches.statSuffix')} · {branchAdmins.length} {t('admins.subtitleSuffix')}
          </div>
          {branchLimitReached && !branchLimitNoticeDismissed && maxBranches !== undefined && maxBranches !== null && (
            <Alert
              className="branch-limit-alert"
              type="warning"
              showIcon
              closable
              onClose={() => setBranchLimitNoticeDismissed(true)}
              message={t('branches.limitReached').replace('{limit}', String(maxBranches))}
              action={
                <Button
                  className="branch-limit-upgrade-button"
                  type="primary"
                  size="small"
                  icon={<ArrowUpRight size={15} weight="bold" />}
                  onClick={() => navigate('/billing')}
                >
                  {t('branches.upgradePlan')}
                </Button>
              }
              style={{ marginTop: 10 }}
            />
          )}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button
            type="primary"
            icon={<PlusIcon size={13} weight="bold" />}
            onClick={openCreate}
            disabled={branchLimitReached}
          >
            {t('branches.newBranch')}
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
            {t('branches.statTotal')}
          </div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{total}</div>
        </div>
        <div className="card" style={{ padding: '14px 16px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>
            {t('branches.statWithAdmin')}
          </div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{branchAdmins.filter((user) => !!user.branchId).length}</div>
        </div>
        <div className="card" style={{ padding: '14px 16px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>
            {t('branches.statUnassigned')}
          </div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>{branchAdmins.filter((user) => !user.branchId).length}</div>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <DataTable<Branch>
          rowKey="id"
          dataSource={branches}
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
          emptyText={t('branches.empty')}
        />
      </div>

      <Modal
        title={editTarget ? t('branches.modalEdit') : t('branches.modalCreate')}
        open={branchModalOpen}
        onCancel={() => setBranchModalOpen(false)}
        onOk={handleBranchFormSubmit(submitBranchForm)}
        okText={editTarget ? t('common.save') : t('common.create')}
        confirmLoading={createMutation.isPending || updateMutation.isPending}
        destroyOnClose
      >
        <Form layout="vertical" autoComplete="off" style={{ marginTop: 16 }}>
          <Form.Item
            label={t('branches.labelName')}
            required
            validateStatus={branchErrors.name ? 'error' : undefined}
            help={branchErrors.name?.message}
          >
            <Controller
              name="name"
              control={branchControl}
              rules={{ required: t('branches.nameRequired') }}
              render={({ field }) => (
                <Input {...field} {...blockAutofill('store-branch-name')} placeholder={t('branches.namePlaceholder')} />
              )}
            />
          </Form.Item>
          <Form.Item label={t('branches.labelAddress')}>
            <Controller
              name="address"
              control={branchControl}
              render={({ field }) => (
                <Input
                  ref={field.ref}
                  onBlur={field.onBlur}
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  {...blockAutofill('store-branch-address')}
                  placeholder={t('branches.addressPlaceholder')}
                />
              )}
            />
          </Form.Item>
          <Form.Item
            label={t('common.phone')}
            validateStatus={branchErrors.phone ? 'error' : undefined}
            help={branchErrors.phone?.message}
          >
            <Controller
              name="phone"
              control={branchControl}
              rules={{
                validate: (value) => !value || isValidUzbekMobilePhone(value) || t('validation.phoneInvalid'),
              }}
              render={({ field }) => (
                <UzbekPhoneInput
                  ref={field.ref}
                  onBlur={field.onBlur}
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  status={branchErrors.phone ? 'error' : undefined}
                />
              )}
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`${t('branches.assignTitle')} — ${assignTarget?.name ?? ''}`}
        open={!!assignTarget}
        onCancel={() => setAssignTarget(null)}
        onOk={handleAssignFormSubmit(submitAssignForm)}
        okText={t('branches.assignBtn')}
        confirmLoading={assignMutation.isPending}
        destroyOnClose
      >
        <div style={{ marginBottom: 12, fontSize: 13, color: 'var(--ink-3)' }}>{t('branches.assignHint')}</div>
        <Form layout="vertical">
          <Form.Item label={t('branches.assignLabel')}>
            <Controller
              name="userId"
              control={assignControl}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onChange={field.onChange}
                  allowClear
                  placeholder={t('branches.assignPlaceholder')}
                  loading={usersLoading}
                  notFoundContent={usersLoading ? <SelectLoadingContent /> : undefined}
                  options={[
                    ...unassignedAdmins.map((user) => ({ value: user.id, label: `${user.name} (@${user.username})` })),
                    ...branchAdmins
                      .filter((user) => user.branchId && user.branchId !== assignTarget?.id)
                      .map((user) => {
                        //
                        const assignedTo = branches.find((branch) => branch.id === user.branchId)
                        return {
                          value: user.id,
                          label: `${user.name} (@${user.username}) · ${assignedTo?.name ?? t('common.otherBranch')}`,
                          disabled: true,
                        }
                      }),
                  ]}
                />
              )}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
