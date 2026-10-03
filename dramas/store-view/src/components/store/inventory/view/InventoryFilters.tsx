import { StoreIcon } from '@store/store-shared/ui/store-icon'
import { Input, Select } from 'antd'

import type { StockLevelQuantityFilter } from '@store/store-stub'
import type { InventoryTranslate } from './types'

interface InventoryFiltersProps {
  search: string
  quantityFilter: StockLevelQuantityFilter
  t: InventoryTranslate
  onSearchChange: (value: string) => void
  onQuantityFilterChange: (value: StockLevelQuantityFilter) => void
}

export function InventoryFilters({
  search,
  quantityFilter,
  t,
  onSearchChange,
  onQuantityFilterChange,
}: InventoryFiltersProps) {
  //
  return (
    <div className="inventory-panel__header">
      <div>
        <h2>{t('inventory.currentStock')}</h2>
        <span>{t('inventory.currentStockHint')}</span>
      </div>
      <div className="inventory-panel__filters">
        <Select<StockLevelQuantityFilter>
          value={quantityFilter}
          onChange={onQuantityFilterChange}
          options={[
            { value: 'all', label: t('inventory.filterAll') },
            { value: 'out', label: t('inventory.filterOut') },
            { value: 'low', label: t('inventory.filterLow') },
            { value: 'available', label: t('inventory.filterAvailable') },
          ]}
        />
        <Input
          allowClear
          value={search}
          prefix={<StoreIcon name="search" size={16} />}
          placeholder={t('inventory.searchPlaceholder')}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>
    </div>
  )
}

