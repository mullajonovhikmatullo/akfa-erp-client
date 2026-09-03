import type { StoreTranslator } from '@store/store-i18n'
import { Button, Popconfirm, Tag, Tooltip } from 'antd'

import { formatDate } from '@store/store-shared/lib/formatters'
import type { ColumnDef } from '@store/store-shared/ui/data-table'
import type { Branch, User } from '@store/store-stub'

type BranchColumnsOptions = {
  t: StoreTranslator
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
        <span className="u-text-muted u-fs-12 u-numeric-tabular">{rowIndex(index)}</span>
      ),
    },
    {
      title: t('nav.branches'),
      key: 'name',
      render: (_: unknown, branch: Branch) => {
        //
        const isMain = branch.name === 'Main Branch'
        return (
          <div className="u-items-center u-flex u-gap-8">
            <span className={`branch-icon${isMain ? ' branch-icon--main' : ''}`}>
              <i className="icons-building icon-size-16" />
            </span>
            <div>
              <div className="u-items-center u-flex u-gap-6">
                <span className="u-fw-600">{branch.name}</span>
                {isMain ? (
                  <span className="u-bg-warning-soft u-rounded-4 u-text-warning-dark u-fs-10 u-fw-700 u-tracking-normal u-lh-none u-p-2-5 u-text-uppercase">
                    {t('branches.mainBadge')}
                  </span>
                ) : null}
              </div>
              {branch.address ? <div className="u-text-muted u-fs-12">{branch.address}</div> : null}
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
      render: (value: string | null) => value ? <span className="u-fs-13">{value}</span> : <span className="u-text-quiet">—</span>,
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
            <div className="u-fs-13 u-fw-500">{admin.name}</div>
            <div className="u-text-muted u-fs-11-5">@{admin.username}</div>
          </div>
        ) : <Tag color="warning">{t('common.unassigned')}</Tag>
      },
    },
    {
      title: t('common.added'),
      dataIndex: 'createdAt',
      width: 120,
      responsiveHide: true,
      render: (value?: string) => value ? <span className="u-text-muted u-fs-12">{formatDate(value)}</span> : <span className="u-text-quiet">—</span>,
    },
    {
      title: '',
      key: 'actions',
      width: 110,
      fixed: 'right',
      render: (_: unknown, branch: Branch) => (
        <div className="u-flex u-gap-4">
          <Tooltip title={t('branches.assignTooltip')}>
            <Button size="small" type="text" icon={<i className="icons-user-add icon-size-13" />} onClick={(event) => { event.stopPropagation(); onAssign(branch) }} />
          </Tooltip>
          <Button size="small" type="text" icon={<i className="icons-pen-line icon-size-18" />} onClick={(event) => { event.stopPropagation(); onEdit(branch) }} />
          <Popconfirm
            title={t('common.deleteTitle')}
            description={t('branches.deleteDesc')}
            okText={t('common.delete')}
            cancelText={t('common.cancel')}
            okButtonProps={{ danger: true, loading: deleting && deletingId === branch.id }}
            onConfirm={(event) => { event?.stopPropagation(); onDelete(branch.id) }}
            onPopupClick={(event) => event.stopPropagation()}
          >
            <Button size="small" type="text" danger icon={<i className="icons-trash icon-size-18" />} loading={deleting && deletingId === branch.id} onClick={(event) => event.stopPropagation()} />
          </Popconfirm>
        </div>
      ),
    },
  ]
}
