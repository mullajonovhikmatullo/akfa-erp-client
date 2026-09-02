import { Controller } from 'react-hook-form'
import { Button, Empty, Select } from 'antd'
import { PlusIcon, TrashIcon } from '@phosphor-icons/react'
import { getSaleProductPrice } from '@store/store-shared/lib/product-pricing'
import { SelectLoadingContent } from '@store/store-shared/ui/select-loading-content'
import { AuthenticatedProductImage } from '../../../product'
import { PriceCell, QuantityStepper } from './index'
import { CART_GRID_COLUMNS, type SaleCartViewProps } from './types'

export function SaleCartView({
  t,
  control,
  productSelectKey,
  productSelectLoading,
  sellableProducts,
  selectedProductIds,
  stockByProductId,
  addToCart,
  cart,
  saleType,
  unitPrice,
  changeQty,
  updateQty,
  removeItem,
}: SaleCartViewProps) {
  //
  return (
    <>
      <div style={{ marginBottom: 14 }}>
        <Controller
          name="selectedProductId"
          control={control}
          render={({ field }) => (
            <Select
              key={productSelectKey}
              showSearch
              optionFilterProp="searchText"
              value={field.value}
              onChange={(value) => { field.onChange(value); addToCart(value) }}
              placeholder={t('newSale.productSearchPlaceholder')}
              style={{ width: '100%' }}
              loading={productSelectLoading}
              suffixIcon={productSelectLoading ? undefined : <PlusIcon size={16} />}
              notFoundContent={productSelectLoading ? <SelectLoadingContent /> : undefined}
              options={sellableProducts.filter((product) => !selectedProductIds.has(product.id)).map((product) => {
                //
                const stock = stockByProductId.get(product.id) ?? 0
                return {
                  value: product.id,
                  searchText: [product.sku, product.name].filter(Boolean).join(' '),
                  label: <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}><div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}><AuthenticatedProductImage url={product.primaryThumbnailUrl ?? product.primaryImageUrl} alt={product.name} width={34} height={34} /><div style={{ minWidth: 0 }}><div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name}</div>{product.sku ? <div style={{ fontSize: 11, color: 'var(--ink-3)', fontFamily: 'monospace' }}>{product.sku}</div> : null}</div></div><span style={{ flexShrink: 0, fontSize: 12, color: 'var(--ink-3)' }}>{t('newSale.availableStock')}: {stock.toLocaleString('ru-RU')} {t(`units.${product.unit}`)}</span></div>,
                }
              })}
            />
          )}
        />
      </div>
      {cart.length === 0 ? <Empty description={t('newSale.emptyCart')} image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ padding: '24px 0' }} /> : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: CART_GRID_COLUMNS, gap: 8, padding: '6px 10px', fontSize: 11, fontWeight: 700, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '.04em', borderBottom: '1px solid var(--border)', marginBottom: 6 }}>
            <div style={{ whiteSpace: 'nowrap' }}>{t('newSale.colProduct')}</div><div style={{ whiteSpace: 'nowrap' }}>{t('newSale.colQty')}</div><div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>{t('newSale.colRemainingStock')}</div><div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>{t('newSale.colUnitPrice')}</div><div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>{t('newSale.colTotal')}</div><div />
          </div>
          {cart.map((item) => {
            //
            const originalPrice = getSaleProductPrice(item.product, saleType)
            const unitPriceUzs = unitPrice(item.product)
            const availableStock = stockByProductId.get(item.productId) ?? 0
            const remainingStock = Number(Math.max(0, availableStock - item.quantity).toFixed(4))
            const hasNoRemainingStock = remainingStock <= 0
            return <div key={item._key} style={{ display: 'grid', gridTemplateColumns: CART_GRID_COLUMNS, gap: 8, alignItems: 'center', padding: '8px 10px', borderBottom: '1px solid var(--border)' }}><div style={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: 0 }}><AuthenticatedProductImage url={item.product.primaryThumbnailUrl ?? item.product.primaryImageUrl} alt={item.product.name} width={40} height={40} /><div style={{ minWidth: 0 }}><div style={{ fontWeight: 600, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.product.name}</div>{item.product.sku ? <div style={{ fontSize: 11, color: 'var(--ink-3)', fontFamily: 'monospace' }}>{item.product.sku}</div> : null}</div></div><QuantityStepper value={item.quantity} max={availableStock} unitLabel={t(`units.${item.product.unit}`)} onMinus={() => changeQty(item._key, -1)} onPlus={() => changeQty(item._key, 1)} onChange={(value) => updateQty(item._key, value)} /><div className="num" style={{ color: hasNoRemainingStock ? 'var(--danger)' : 'var(--ink-2)', fontSize: 13, fontWeight: 700, textAlign: 'right', whiteSpace: 'nowrap' }}>{remainingStock.toLocaleString('ru-RU')} {t(`units.${item.product.unit}`)}</div><PriceCell original={originalPrice} uzs={unitPriceUzs} /><PriceCell original={{ ...originalPrice, amount: originalPrice.amount * Math.max(item.quantity, 0) }} uzs={Math.max(item.quantity, 0) * unitPriceUzs} strong /><Button size="small" type="text" danger icon={<TrashIcon size={18} />} onClick={() => removeItem(item._key)} /></div>
          })}
        </>
      )}
    </>
  )
}
