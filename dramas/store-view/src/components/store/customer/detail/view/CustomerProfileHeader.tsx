import { StoreIcon } from '@store/store-shared/ui/store-icon'
import type { StoreTranslator } from '@store/store-i18n'
import { Button, Tooltip } from 'antd'
import { StatusBadge } from '@store/store-shared/ui/status-badge'
import type { CustomerDetail } from '@store/store-stub'

interface CustomerProfileHeaderProps {
  t: StoreTranslator
  customer: CustomerDetail
  refreshing: boolean
  canEdit: boolean
  onBack: () => void
  onEdit: () => void
  onRefresh: () => void
}

export function CustomerProfileHeader({ t, customer, refreshing, canEdit, onBack, onEdit, onRefresh }: CustomerProfileHeaderProps) {
  //
  return (
    <div className="customer-profile-head">
      <Button type="text" size="small" icon={<StoreIcon name="arrow-left" size={16} />} onClick={onBack} className="customer-profile-head__back">
        {t('customerDetail.backToList')}
      </Button>
      <div className="customer-profile-head__row">
        <div className="customer-profile-head__identity">
          <div className="customer-profile-head__avatar">{customer.fullName.charAt(0).toUpperCase()}</div>
          <div className="u-min-w-0">
            <h1>{customer.fullName}</h1>
            <div className="customer-profile-head__meta">
              {customer.phone ? <span className="u-font-mono">{customer.phone}</span> : null}
              <StatusBadge tone={customer.isActive ? 'success' : 'danger'} dot>
                {t(customer.isActive ? 'common.active' : 'common.inactive')}
              </StatusBadge>
            </div>
          </div>
        </div>
        <div className="u-flex u-gap-8">
          {canEdit ? (
            <Button icon={<StoreIcon name="pen-line" size={16} />} onClick={onEdit}>
              {t('common.edit')}
            </Button>
          ) : null}
          <Tooltip title={t('common.refresh')}>
            <Button icon={<StoreIcon name="reload" size={16} className={refreshing ? 'ph-icon-spin' : undefined} />} onClick={onRefresh} />
          </Tooltip>
        </div>
      </div>
    </div>
  )
}
