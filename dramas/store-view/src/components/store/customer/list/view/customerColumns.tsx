import type { StoreTranslator } from '@store/store-i18n'
import { Button, Popconfirm, Tooltip } from 'antd'

import { formatDate } from '@store/store-shared/lib/formatters'
import { MoneyDisplay } from '@store/store-shared/ui/money-display'
import { StatusBadge } from '@store/store-shared/ui/status-badge'
import type { Customer } from '@store/store-stub'
import type { ColumnDef } from '@store/store-shared/ui/data-table'

type CustomerColumnsOptions = {
  t: StoreTranslator
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
        <span className="u-text-quiet u-fs-11 u-numeric-tabular">{rowIndex(index)}</span>
      ),
    },
    {
      title: t('nav.customers'),
      key: 'fullName',
      render: (_: unknown, customer: Customer) => (
        <div className="u-items-center u-flex u-gap-8">
          <div
            className="u-items-center u-bg-primary u-rounded-full u-text-white u-flex u-shrink-0 u-fs-11 u-fw-700 u-h-26 u-justify-center u-w-26"
          >
            {customer.fullName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="u-fw-600">{customer.fullName}</div>
            {customer.address && <div className="u-text-muted u-fs-11-5">{customer.address}</div>}
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
        value ? <span className="num u-fs-13" >{value}</span> : <span className="u-text-quiet">—</span>,
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
          <div className="u-items-end u-flex u-flex-col u-gap-3">
            <span className="num u-fw-700" >
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
      render: (value: string) => <span className="u-text-muted u-fs-12">{formatDate(value)}</span>,
    },
    {
      title: '',
      key: 'actions',
      width: 90,
      fixed: 'right',
      render: (_: unknown, customer: Customer) => (
        <div className="u-flex u-gap-4">
          <Tooltip title={t('common.view')}>
            <Button size="small" type="text" icon={<i className="icons-eye icon-size-18" />} onClick={(event) => { event.stopPropagation(); onView(customer) }} />
          </Tooltip>
          {canManage ? (
            <>
              <Button size="small" type="text" icon={<i className="icons-pen-line icon-size-18" />} onClick={(event) => { event.stopPropagation(); onEdit(customer) }} />
              <Popconfirm
                title={t('common.deleteTitle')}
                description={`"${customer.fullName}" ${t('customers.deactivateDesc')}`}
                okText={t('common.yesDelete')}
                cancelText={t('common.cancel')}
                okButtonProps={{ danger: true, loading: deleting && deletingId === customer.id }}
                onConfirm={(event) => { event?.stopPropagation(); onDelete(customer.id) }}
                onPopupClick={(event) => event.stopPropagation()}
              >
                <Button size="small" type="text" danger icon={<i className="icons-trash icon-size-18" />} loading={deleting && deletingId === customer.id} onClick={(event) => event.stopPropagation()} />
              </Popconfirm>
            </>
          ) : null}
        </div>
      ),
    },
  ]
}
