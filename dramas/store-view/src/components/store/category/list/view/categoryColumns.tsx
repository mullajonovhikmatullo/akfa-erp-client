import { Button, Popconfirm, Tag } from 'antd'

import { formatDate } from '@store/store-shared/lib/formatters'
import type { ColumnDef } from '@store/store-shared/ui/data-table'
import { StatusBadge } from '@store/store-shared/ui/status-badge'
import type { Category } from '@store/store-stub'
import { CategoryIcon } from './CategoryIcon'

interface CategoryColumnsOptions {
  t: (key: string) => string
  rowIndex: (index: number) => number
  statusFilter: 'all' | 'active' | 'inactive'
  deleting: boolean
  deletingId?: string
  onEdit: (category: Category) => void
  onDelete: (id: string) => void
}

export function createCategoryColumns({ t, rowIndex, statusFilter, deleting, deletingId, onEdit, onDelete }: CategoryColumnsOptions): ColumnDef<Category>[] {
  //
  return [
    {
      title: '#',
      key: '_idx',
      width: 40,
      render: (_: unknown, __: Category, index: number) => (
        <span className="u-text-quiet u-fs-11 u-numeric-tabular">{rowIndex(index)}</span>
      ),
    },
    {
      title: t('common.name'),
      key: 'name',
      render: (_: unknown, category: Category) => (
        <div className="u-items-center u-flex u-gap-8">
          <CategoryIcon name={category.name} />
          <div>
            <div className="u-fw-600">{category.name}</div>
            {category.description && <div className="u-text-muted u-fs-12 u-max-w-300">{category.description}</div>}
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
        category.createdAt ? <span className="u-text-muted u-fs-12">{formatDate(category.createdAt)}</span> : <span className="u-text-quiet">—</span>,
    },
    {
      title: '',
      key: 'actions',
      width: 90,
      fixed: 'right' as const,
      render: (_: unknown, category: Category) => (
        <div className="u-flex u-gap-4">
          <Button
            size="small"
            type="text"
            icon={<i className="icons-pen-line icon-size-18" />}
            onClick={(event) => {
              //
              event.stopPropagation()
              onEdit(category)
            }}
          />
          <Popconfirm
            title={t('categories.deleteTitle')}
            description={t('categories.deleteDesc')}
            okText={t('common.delete')}
            cancelText={t('common.cancel')}
            okButtonProps={{ danger: true, loading: deleting && deletingId === category.id }}
            onConfirm={(event) => {
              //
              event?.stopPropagation()
              onDelete(category.id)
            }}
            onPopupClick={(event) => event.stopPropagation()}
          >
            <Button
              size="small"
              type="text"
              danger
              icon={<i className="icons-trash icon-size-18" />}
              loading={deleting && deletingId === category.id}
              onClick={(event) => event.stopPropagation()}
            />
          </Popconfirm>
        </div>
      ),
    },
  ]
}
