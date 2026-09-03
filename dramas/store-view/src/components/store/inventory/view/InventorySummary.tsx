import { MoneyDisplay } from '@store/store-shared/ui/money-display'
import { formatInventoryQuantity } from '../lib/inventory-rows'
import type { InventoryTotals, InventoryTranslate } from './types'

interface InventorySummaryProps {
  productCount: number
  totals: InventoryTotals
  stockValue: number
  t: InventoryTranslate
}

export function InventorySummary({ productCount, totals, stockValue, t }: InventorySummaryProps) {
  //
  return (
    <div className="inventory-summary">
      <div className="inventory-summary__card">
        <span>{t('inventory.products')}</span>
        <strong>{productCount.toLocaleString('uz-UZ')}</strong>
        <small>{t('inventory.productTypes')}</small>
      </div>
      <div className="inventory-summary__card">
        <span>{t('inventory.totalPieces')}</span>
        <strong>{formatInventoryQuantity(totals.PIECE)}</strong>
        <small>{t('units.PIECE')}</small>
      </div>
      <div className="inventory-summary__card">
        <span>{t('inventory.totalWeight')}</span>
        <strong>{formatInventoryQuantity(totals.KG)}</strong>
        <small>{t('units.KG')}</small>
      </div>
      <div className="inventory-summary__card">
        <span>{t('inventory.stockValue')}</span>
        <strong><MoneyDisplay amount={stockValue} currency="UZS" /></strong>
        <small>{t('inventory.stockValueHint')}</small>
      </div>
    </div>
  )
}

