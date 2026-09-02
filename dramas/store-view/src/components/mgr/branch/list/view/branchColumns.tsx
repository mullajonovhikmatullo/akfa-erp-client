import { Button, Popconfirm, Tag, Tooltip } from 'antd'
import { PencilSimpleIcon, StorefrontIcon, TrashIcon, UserPlusIcon } from '@phosphor-icons/react'
import { formatDate } from '@store/store-shared/lib/formatters'
import type { ColumnDef } from '@store/store-shared/ui/data-table'
import type { Branch, User } from '@store/store-stub'

type BranchColumnsOptions = {
  t: (key: string) => string
  rowIndex: (index: number) => number
  branchAdmins: User[]
  currentUser?: User | null
  isStoreOwner: boolean
  deleting: boolean
  deletingId?: string
  onAssign: (branch: Branch) => void
  onEdit: (branch: Branch) => void
  onDelete: (id: string) => void
}

export function createBranchColumns({
  t,
  rowIndex,
  branchAdmins,
  currentUser,
  isStoreOwner,
  deleting,
  deletingId,
  onAssign,
  onEdit,
  onDelete,
}: BranchColumnsOptions): ColumnDef<Branch>[] {
  //
  const getAssignedUser = (branchId: string) => {
    //
    const admin = branchAdmins.find((user) => user.branchId === branchId)
    if (admin) return admin
    if (isStoreOwner && currentUser?.branchId === branchId) return currentUser
    return null
  }

  return [
    {
      title: '#',
      key: 'index',
      width: 48,
      render: (_: unknown, __: Branch, index: number) => (
        <span style={{ fontSize: 12, color: 'var(--ink-3)', fontVariantNumeric: 'tabular-nums' }}>{rowIndex(index)}</span>
      ),
    },
    {
      title: t('nav.branches'),
      key: 'name',
      render: (_: unknown, branch: Branch) => {
        //
        const isMain = branch.name === 'Main Branch'
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                width: 26,
                height: 26,
                borderRadius: 6,
                flexShrink: 0,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: isMain ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'var(--primary)',
                color: '#fff',
                boxShadow: isMain ? '0 0 0 2px #fde68a' : undefined,
              }}
            >
              <StorefrontIcon size={16} weight="duotone" />
            </span>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontWeight: 600 }}>{branch.name}</span>
                {isMain ? (
                  <span style={{ fontSize: 10, fontWeight: 700, lineHeight: 1, padding: '2px 5px', borderRadius: 4, background: '#fef3c7', color: '#92400e', letterSpacing: '.04em', textTransform: 'uppercase' }}>
                    {t('branches.mainBadge')}
                  </span>
                ) : null}
              </div>
              {branch.address ? <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{branch.address}</div> : null}
            </div>
          </div>
        )
      },
    },
    {
      title: t('common.phone'),
      dataIndex: 'phone',
      width: 150,
      responsiveHide: true,
      render: (value: string | null) => value ? <span style={{ fontSize: 13 }}>{value}</span> : <span style={{ color: 'var(--ink-4)' }}>—</span>,
    },
    {
      title: t('admins.colAdmin'),
      key: 'admin',
      width: 200,
      render: (_: unknown, branch: Branch) => {
        //
        const admin = getAssignedUser(branch.id)
        return admin ? (
          <div>
            <div style={{ fontWeight: 500, fontSize: 13 }}>{admin.name}</div>
            <div style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>@{admin.username}</div>
          </div>
        ) : <Tag color="warning">{t('common.unassigned')}</Tag>
      },
    },
    {
      title: t('common.added'),
      dataIndex: 'createdAt',
      width: 120,
      responsiveHide: true,
      render: (value?: string) => value ? <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>{formatDate(value)}</span> : <span style={{ color: 'var(--ink-4)' }}>—</span>,
    },
    {
      title: '',
      key: 'actions',
      width: 110,
      fixed: 'right',
      render: (_: unknown, branch: Branch) => (
        <div style={{ display: 'flex', gap: 4 }}>
          <Tooltip title={t('branches.assignTooltip')}>
            <Button size="small" type="text" icon={<UserPlusIcon size={13} />} onClick={(event) => { event.stopPropagation(); onAssign(branch) }} />
          </Tooltip>
          <Button size="small" type="text" icon={<PencilSimpleIcon size={18} />} onClick={(event) => { event.stopPropagation(); onEdit(branch) }} />
          <Popconfirm
            title={t('common.deleteTitle')}
            description={t('branches.deleteDesc')}
            okText={t('common.delete')}
            cancelText={t('common.cancel')}
            okButtonProps={{ danger: true, loading: deleting && deletingId === branch.id }}
            onConfirm={(event) => { event?.stopPropagation(); onDelete(branch.id) }}
            onPopupClick={(event) => event.stopPropagation()}
          >
            <Button size="small" type="text" danger icon={<TrashIcon size={18} />} loading={deleting && deletingId === branch.id} onClick={(event) => event.stopPropagation()} />
          </Popconfirm>
        </div>
      ),
    },
  ]
}
