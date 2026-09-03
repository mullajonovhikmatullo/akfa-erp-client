import type { StoreTranslator } from '@store/store-i18n'
import type { ProductUnit } from '@store/store-stub'

export type StockRow = {
  productId: string
  name: string
  sku: string | null
  primaryThumbnailUrl: string | null
  unit: ProductUnit
  quantity: number
  branches: Set<string>
  updatedAt: string
  lowStockThreshold: number | null
}

export type QuantityFilter = 'all' | 'out' | 'low' | 'available'

export type InventoryTotals = Record<ProductUnit, number>

export type InventoryTranslate = StoreTranslator

