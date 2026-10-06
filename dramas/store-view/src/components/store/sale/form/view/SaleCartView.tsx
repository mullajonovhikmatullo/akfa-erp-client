import { StoreIcon } from '@store/store-shared/ui/store-icon'
import { Controller } from 'react-hook-form'
import { Button, Checkbox, Empty, Select, Tooltip } from 'antd'

import { getSaleProductPrice } from '@store/store-shared/lib/product-pricing'
import { SelectLoadingContent } from '@store/store-shared/ui/select-loading-content'
import { AuthenticatedProductImage } from '../../../product'
import { CartBulkBar } from '../../../shared/view/CartBulkBar'
import { PriceCell, QuantityStepper } from './index'
import type { SaleCartViewProps } from './types'

export function SaleCartView({
  t,
  control,
  productSelectKey,
  productSelectLoading,
  sellableProducts,
  selectedProductIds,
  stockByProductId,
  addToCart,
  onOpenPicker,
  selectedCartKeys,
  onSelectCartKeys,
  onRemoveSelected,
  cart,
  saleType,
  unitPrice,
  changeQty,
  updateQty,
  removeItem,
}: SaleCartViewProps) {
  //
  const selectedKeys = new Set(selectedCartKeys)
  const allSelected = cart.length > 0 && cart.every((item) => selectedKeys.has(item._key))
  const someSelected = !allSelected && cart.some((item) => selectedKeys.has(item._key))

  function toggleItem(key: string, checked: boolean) {
    //
    onSelectCartKeys(checked ? [...selectedCartKeys, key] : selectedCartKeys.filter((selected) => selected !== key))
  }

  return (
    <>
      <div className="u-flex u-gap-8 u-mb-14">
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
              className="u-flex-1 u-min-w-0"
              loading={productSelectLoading}
              suffixIcon={productSelectLoading ? undefined : <StoreIcon name="plus" size={16} />}
              notFoundContent={productSelectLoading ? <SelectLoadingContent /> : undefined}
              options={sellableProducts.filter((product) => !selectedProductIds.has(product.id)).map((product) => {
                //
                const stock = stockByProductId.get(product.id) ?? 0
                return {
                  value: product.id,
                  searchText: [product.sku, product.name].filter(Boolean).join(' '),
                  label: <div className="u-items-center u-flex u-gap-12 u-justify-between"><div className="u-items-center u-flex u-gap-8 u-min-w-0"><AuthenticatedProductImage url={product.primaryThumbnailUrl ?? product.primaryImageUrl} alt={product.name} width={34} height={34} /><div className="u-min-w-0"><div className="u-fw-600 u-overflow-hidden u-text-ellipsis u-whitespace-nowrap">{product.name}</div>{product.sku ? <div className="u-text-muted u-font-mono u-fs-11">{product.sku}</div> : null}</div></div><span className="u-text-muted u-shrink-0 u-fs-12">{t('newSale.availableStock')}: {stock.toLocaleString('ru-RU')} {t(`units.${product.unit}`)}</span></div>,
                }
              })}
            />
          )}
        />
        <Tooltip title={t('productPicker.openHint')}>
          <Button icon={<StoreIcon name="circle-check" size={16} />} onClick={onOpenPicker}>
            {t('productPicker.openButton')}
          </Button>
        </Tooltip>
      </div>
      {cart.length === 0 ? <Empty description={t('newSale.emptyCart')} image={Empty.PRESENTED_IMAGE_SIMPLE} className="u-p-24-0" /> : (
        <>
          <CartBulkBar t={t} count={selectedCartKeys.length} onClearSelection={() => onSelectCartKeys([])} onRemove={onRemoveSelected} />
          <div className="sale-cart-grid sale-cart-grid--header">
            <Checkbox
              checked={allSelected}
              indeterminate={someSelected}
              aria-label={t('productPicker.selectAll')}
              onChange={(event) => onSelectCartKeys(event.target.checked ? cart.map((item) => item._key) : [])}
            />
            <div>{t('newSale.colProduct')}</div><div>{t('newSale.colQty')}</div><div className="u-text-right">{t('newSale.colRemainingStock')}</div><div className="u-text-right">{t('newSale.colUnitPrice')}</div><div className="u-text-right">{t('newSale.colTotal')}</div><div />
          </div>
          {cart.map((item) => {
            //
            const originalPrice = getSaleProductPrice(item.product, saleType)
            const unitPriceUzs = unitPrice(item.product)
            const availableStock = stockByProductId.get(item.productId) ?? 0
            const remainingStock = Number(Math.max(0, availableStock - item.quantity).toFixed(4))
            const hasNoRemainingStock = remainingStock <= 0
            return <div key={item._key} className={`sale-cart-grid sale-cart-grid--row${selectedKeys.has(item._key) ? ' is-selected' : ''}`}><Checkbox checked={selectedKeys.has(item._key)} aria-label={item.product.name} onChange={(event) => toggleItem(item._key, event.target.checked)} /><div className="u-items-center u-flex u-gap-9 u-min-w-0"><AuthenticatedProductImage url={item.product.primaryThumbnailUrl ?? item.product.primaryImageUrl} alt={item.product.name} width={40} height={40} /><div className="u-min-w-0"><div className="sale-cart-name" title={item.product.name}>{item.product.name}</div>{item.product.sku ? <div className="u-text-muted u-font-mono u-fs-11">{item.product.sku}</div> : null}</div></div><QuantityStepper value={item.quantity} max={availableStock} unitLabel={t(`units.${item.product.unit}`)} onMinus={() => changeQty(item._key, -1)} onPlus={() => changeQty(item._key, 1)} onChange={(value) => updateQty(item._key, value)} /><div className={`num sale-cart-stock${hasNoRemainingStock ? ' tone-danger' : ''}`}>{remainingStock.toLocaleString('ru-RU')} {t(`units.${item.product.unit}`)}</div><PriceCell original={originalPrice} uzs={unitPriceUzs} /><PriceCell original={{ ...originalPrice, amount: originalPrice.amount * Math.max(item.quantity, 0) }} uzs={Math.max(item.quantity, 0) * unitPriceUzs} strong /><Button size="small" type="text" danger icon={<StoreIcon name="trash" size={16} />} onClick={() => removeItem(item._key)} /></div>
          })}
        </>
      )}
    </>
  )
}
