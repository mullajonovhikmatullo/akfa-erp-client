import { Button, Popconfirm, Tag } from 'antd'
import { PencilSimpleIcon, TrashIcon } from '@phosphor-icons/react'
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
        category.createdAt ? <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>{formatDate(category.createdAt)}</span> : <span style={{ color: 'var(--ink-4)' }}>—</span>,
    },
    {
      title: '',
      key: 'actions',
      width: 90,
      fixed: 'right' as const,
      render: (_: unknown, category: Category) => (
        <div style={{ display: 'flex', gap: 4 }}>
          <Button
            size="small"
            type="text"
            icon={<PencilSimpleIcon size={18} />}
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
              icon={<TrashIcon size={18} />}
              loading={deleting && deletingId === category.id}
              onClick={(event) => event.stopPropagation()}
            />
          </Popconfirm>
        </div>
      ),
    },
  ]
}
