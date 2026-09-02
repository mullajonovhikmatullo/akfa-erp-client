import { Button, Popconfirm, Tooltip } from 'antd'
import { EyeIcon, PencilSimpleIcon, TrashIcon } from '@phosphor-icons/react'
import { formatDate } from '@store/store-shared/lib/formatters'
import { MoneyDisplay } from '@store/store-shared/ui/money-display'
import { StatusBadge } from '@store/store-shared/ui/status-badge'
import type { Customer } from '@store/store-stub'
import type { ColumnDef } from '@store/store-shared/ui/data-table'

type CustomerColumnsOptions = {
  t: (key: string) => string
  rowIndex: (index: number) => number
  canManage: boolean
  deleting: boolean
  deletingId?: string
  onView: (customer: Customer) => void
  onEdit: (customer: Customer) => void
  onDelete: (id: string) => void
}

export function createCustomerColumns({
  t,
  rowIndex,
  canManage,
  deleting,
  deletingId,
  onView,
  onEdit,
  onDelete,
}: CustomerColumnsOptions): ColumnDef<Customer>[] {
  //
  return [
    {
      title: '#',
      key: '_idx',
      width: 40,
      render: (_: unknown, __: Customer, index: number) => (
        <span style={{ color: 'var(--ink-4)', fontSize: 11, fontVariantNumeric: 'tabular-nums' }}>{rowIndex(index)}</span>
      ),
    },
    {
      title: t('nav.customers'),
      key: 'fullName',
      render: (_: unknown, customer: Customer) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: '50%',
              background: 'var(--primary)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 11,
              fontWeight: 700,
              flexShrink: 0,
            }}
          >
            {customer.fullName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 600 }}>{customer.fullName}</div>
            {customer.address && <div style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>{customer.address}</div>}
          </div>
        </div>
      ),
    },
    {
      title: t('common.phone'),
      dataIndex: 'phone',
      width: 170,
      responsiveHide: true,
      render: (value: string | null) =>
        value ? <span className="num" style={{ fontSize: 13 }}>{value}</span> : <span style={{ color: 'var(--ink-4)' }}>—</span>,
    },
    {
      title: t('common.branch'),
      key: 'branch',
      width: 150,
      responsiveHide: true,
      render: (_: unknown, customer: Customer) => <StatusBadge tone="muted">{customer.branch.name}</StatusBadge>,
    },
    {
      title: t('customers.colBalance'),
      key: 'balance',
      width: 180,
      align: 'right',
      render: (_: unknown, customer: Customer) => {
        //
        const tone = customer.balance > 0 ? 'danger' : customer.balance < 0 ? 'success' : 'muted'
        const label = customer.balance > 0 ? t('customers.balanceDebt') : customer.balance < 0 ? t('customers.balanceCredit') : t('customers.balanceZero')
        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
            <span className="num" style={{ fontWeight: 700 }}>
              <MoneyDisplay amount={Math.abs(customer.balance)} currency="UZS" />
            </span>
            <StatusBadge tone={tone}>{label}</StatusBadge>
          </div>
        )
      },
    },
    {
      title: t('common.status'),
      dataIndex: 'isActive',
      width: 90,
      align: 'center',
      responsiveHide: true,
      render: (value: boolean) => value ? <StatusBadge tone="success" dot>{t('common.active')}</StatusBadge> : <StatusBadge tone="danger" dot>{t('common.inactive')}</StatusBadge>,
    },
    {
      title: t('common.added'),
      dataIndex: 'createdAt',
      width: 110,
      responsiveHide: true,
      render: (value: string) => <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>{formatDate(value)}</span>,
    },
    {
      title: '',
      key: 'actions',
      width: 90,
      fixed: 'right',
      render: (_: unknown, customer: Customer) => (
        <div style={{ display: 'flex', gap: 4 }}>
          <Tooltip title={t('common.view')}>
            <Button size="small" type="text" icon={<EyeIcon size={18} />} onClick={(event) => { event.stopPropagation(); onView(customer) }} />
          </Tooltip>
          {canManage ? (
            <>
              <Button size="small" type="text" icon={<PencilSimpleIcon size={18} />} onClick={(event) => { event.stopPropagation(); onEdit(customer) }} />
              <Popconfirm
                title={t('common.deleteTitle')}
                description={`"${customer.fullName}" ${t('customers.deactivateDesc')}`}
                okText={t('common.yesDelete')}
                cancelText={t('common.cancel')}
                okButtonProps={{ danger: true, loading: deleting && deletingId === customer.id }}
                onConfirm={(event) => { event?.stopPropagation(); onDelete(customer.id) }}
                onPopupClick={(event) => event.stopPropagation()}
              >
                <Button size="small" type="text" danger icon={<TrashIcon size={18} />} loading={deleting && deletingId === customer.id} onClick={(event) => event.stopPropagation()} />
              </Popconfirm>
            </>
          ) : null}
        </div>
      ),
    },
  ]
}
