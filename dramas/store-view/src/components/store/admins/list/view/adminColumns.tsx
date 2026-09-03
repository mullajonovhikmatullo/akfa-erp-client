import { Button, Popconfirm, Tag } from 'antd'

import { formatDate } from '@store/store-shared/lib/formatters'
import type { ColumnDef } from '@store/store-shared/ui/data-table'
import { StatusBadge } from '@store/store-shared/ui/status-badge'
import type { Branch, User } from '@store/store-stub'
import { AdminAvatar } from './AdminAvatar'

interface AdminColumnsOptions {
  t: (key: string) => string
  rowIndex: (index: number) => number
  branches: Branch[]
  deleting: boolean
  deletingId?: string
  onEdit: (user: User) => void
  onDelete: (id: string) => void
}

export function createAdminColumns({ t, rowIndex, branches, deleting, deletingId, onEdit, onDelete }: AdminColumnsOptions) {
  //
  const getBranch = (branchId: string | null | undefined) => branches.find((branch) => branch.id === branchId)

  return [
    {
      title: '#',
      key: '_idx',
      width: 40,
      render: (_: unknown, __: User, index: number) => (
        <span className="u-text-quiet u-fs-11 u-numeric-tabular">{rowIndex(index)}</span>
      ),
    },
    {
      title: t('admins.colAdmin'),
      key: 'name',
      render: (_: unknown, user: User) => (
        <div className="u-items-center u-flex u-gap-8">
          <AdminAvatar name={user.name} />
          <div>
            <div className="u-fw-600">{user.name}</div>
            <div className="u-text-muted u-fs-12">@{user.username}</div>
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
        user.createdAt ? <span className="u-text-muted u-fs-12">{formatDate(user.createdAt)}</span> : <span className="u-text-quiet">—</span>,
    },
    {
      title: '',
      key: 'actions',
      width: 90,
      fixed: 'right' as const,
      render: (_: unknown, user: User) => (
        <div className="u-flex u-gap-4">
          <Button
            size="small"
            type="text"
            icon={<i className="icons-pen-line icon-size-18" />}
            onClick={(event) => {
              //
              event.stopPropagation()
              onEdit(user)
            }}
          />
          <Popconfirm
            title={t('common.deleteTitle')}
            description={t('admins.deleteDesc')}
            okText={t('common.delete')}
            cancelText={t('common.cancel')}
            okButtonProps={{ danger: true, loading: deleting && deletingId === user.id }}
            onConfirm={(event) => {
              //
              event?.stopPropagation()
              onDelete(user.id)
            }}
            onPopupClick={(event) => event.stopPropagation()}
          >
            <Button
              size="small"
              type="text"
              danger
              icon={<i className="icons-trash icon-size-18" />}
              loading={deleting && deletingId === user.id}
              onClick={(event) => event.stopPropagation()}
            />
          </Popconfirm>
        </div>
      ),
    },
  ] satisfies ColumnDef<User>[]
}
