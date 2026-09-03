import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Alert, Button, Tooltip } from 'antd'
import { useNavigate } from 'react-router-dom'

import { toast } from 'sonner'
import { DataTable } from '@store/store-shared/ui/data-table'
import type { Branch, BranchPayload, User } from '@store/store-stub'
import { useUserMutation } from '../../admins/hooks/useUserMutation'
import { useUsersList } from '../../admins/hooks/useUsersList'
import { useBranchMutation } from '../hooks/useBranchMutation'
import { useBranchesPage } from '../hooks/useBranchesPage'
import {
  BranchAssignmentModal,
  type AssignBranchFormValues,
  type BranchAssignmentOption,
} from './view/BranchAssignmentModal'
import { BranchFormModal } from './view/BranchFormModal'
import { createBranchColumns } from './view/branchColumns'

type Translate = (key: string) => string

export interface BranchesListProps {
  t: Translate
  currentUser?: User | null
  isStoreOwner?: boolean
}

export function BranchesList({ t, currentUser, isStoreOwner = false }: BranchesListProps) {
  //
  const navigate = useNavigate()
  const { data: result, isLoading, isFetching, refetch, page, pageSize, onPageChange, rowIndex } = useBranchesPage()
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

  const assignmentOptions = useMemo<BranchAssignmentOption[]>(() => {
    //
    const availableOptions = branchAdmins
      .filter((user) => !user.branchId || user.branchId === assignTarget?.id)
      .map((user) => ({ value: user.id, label: `${user.name} (@${user.username})` }))
    const unavailableOptions = branchAdmins
      .filter((user) => user.branchId && user.branchId !== assignTarget?.id)
      .map((user) => {
        //
        const assignedTo = branches.find((branch) => branch.id === user.branchId)
        return {
          value: user.id,
          label: `${user.name} (@${user.username}) · ${assignedTo?.name ?? t('common.otherBranch')}`,
          disabled: true,
        }
      })

    return [...availableOptions, ...unavailableOptions]
  }, [assignTarget?.id, branchAdmins, branches, t])

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
              className="branch-limit-alert u-mt-10"
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
                  icon={<i className="icons-redirect icon-size-15" />}
                  onClick={() => navigate('/billing')}
                >
                  {t('branches.upgradePlan')}
                </Button>
              }

            />
          )}
        </div>
        <div className="u-flex u-gap-8">
          <Button
            type="primary"
            icon={<i className="icons-plus icon-size-13" />}
            onClick={openCreate}
            disabled={branchLimitReached}
          >
            {t('branches.newBranch')}
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
            {t('branches.statTotal')}
          </div>
          <div className="u-fs-24 u-fw-700">{total}</div>
        </div>
        <div className="card u-p-14-16" >
          <div className="u-text-muted u-fs-11 u-fw-700 u-tracking-wide u-mb-6 u-text-uppercase">
            {t('branches.statWithAdmin')}
          </div>
          <div className="u-fs-24 u-fw-700">{branchAdmins.filter((user) => !!user.branchId).length}</div>
        </div>
        <div className="card u-p-14-16" >
          <div className="u-text-muted u-fs-11 u-fw-700 u-tracking-wide u-mb-6 u-text-uppercase">
            {t('branches.statUnassigned')}
          </div>
          <div className="u-fs-24 u-fw-700">{branchAdmins.filter((user) => !user.branchId).length}</div>
        </div>
      </div>

      <div className="card u-overflow-hidden u-p-0" >
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

      <BranchFormModal
        t={t}
        open={branchModalOpen}
        editTarget={editTarget}
        control={branchControl}
        errors={branchErrors}
        pending={createMutation.isPending || updateMutation.isPending}
        onCancel={() => setBranchModalOpen(false)}
        onSubmit={handleBranchFormSubmit(submitBranchForm)}
      />

      <BranchAssignmentModal
        t={t}
        target={assignTarget}
        control={assignControl}
        options={assignmentOptions}
        loading={usersLoading}
        pending={assignMutation.isPending}
        onCancel={() => setAssignTarget(null)}
        onSubmit={handleAssignFormSubmit(submitAssignForm)}
      />
    </>
  )
}
