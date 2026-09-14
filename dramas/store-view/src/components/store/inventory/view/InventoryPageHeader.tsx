import { StoreIcon } from '@store/store-shared/ui/store-icon'
import { Button } from 'antd'

import type { InventoryTranslate } from './types'

export function InventoryPageHeader({
  t,
  refreshing,
  onRefresh,
}: {
  t: InventoryTranslate
  refreshing: boolean
  onRefresh: () => void
}) {
  //
  return (
    <div className="page-head inventory-page__head">
      <div>
        <h1>{t('inventory.title')}</h1>
        <div className="sub">{t('inventory.subtitle')}</div>
      </div>
      <Button icon={<StoreIcon name="reload" size={16} />} loading={refreshing} onClick={onRefresh}>
        {t('common.refresh')}
      </Button>
    </div>
  )
}

