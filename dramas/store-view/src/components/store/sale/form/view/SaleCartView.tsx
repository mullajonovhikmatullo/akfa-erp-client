import { Controller } from 'react-hook-form'
import { Button, Empty, Select } from 'antd'

import { getSaleProductPrice } from '@store/store-shared/lib/product-pricing'
import { SelectLoadingContent } from '@store/store-shared/ui/select-loading-content'
import { AuthenticatedProductImage } from '../../../product'
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
      <div className="u-mb-14">
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
              className="u-w-full"
              loading={productSelectLoading}
              suffixIcon={productSelectLoading ? undefined : <i className="icons-plus icon-size-16" />}
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
      </div>
      {cart.length === 0 ? <Empty description={t('newSale.emptyCart')} image={Empty.PRESENTED_IMAGE_SIMPLE} className="u-p-24-0" /> : (
        <>
          <div className="sale-cart-grid sale-cart-grid--header">
            <div className="u-whitespace-nowrap">{t('newSale.colProduct')}</div><div className="u-whitespace-nowrap">{t('newSale.colQty')}</div><div className="u-text-right u-whitespace-nowrap">{t('newSale.colRemainingStock')}</div><div className="u-text-right u-whitespace-nowrap">{t('newSale.colUnitPrice')}</div><div className="u-text-right u-whitespace-nowrap">{t('newSale.colTotal')}</div><div />
          </div>
          {cart.map((item) => {
            //
            const originalPrice = getSaleProductPrice(item.product, saleType)
            const unitPriceUzs = unitPrice(item.product)
            const availableStock = stockByProductId.get(item.productId) ?? 0
            const remainingStock = Number(Math.max(0, availableStock - item.quantity).toFixed(4))
            const hasNoRemainingStock = remainingStock <= 0
            return <div key={item._key} className="sale-cart-grid sale-cart-grid--row"><div className="u-items-center u-flex u-gap-9 u-min-w-0"><AuthenticatedProductImage url={item.product.primaryThumbnailUrl ?? item.product.primaryImageUrl} alt={item.product.name} width={40} height={40} /><div className="u-min-w-0"><div className="u-fs-13 u-fw-600 u-overflow-hidden u-text-ellipsis u-whitespace-nowrap">{item.product.name}</div>{item.product.sku ? <div className="u-text-muted u-font-mono u-fs-11">{item.product.sku}</div> : null}</div></div><QuantityStepper value={item.quantity} max={availableStock} unitLabel={t(`units.${item.product.unit}`)} onMinus={() => changeQty(item._key, -1)} onPlus={() => changeQty(item._key, 1)} onChange={(value) => updateQty(item._key, value)} /><div className={`num sale-cart-stock${hasNoRemainingStock ? ' tone-danger' : ''}`}>{remainingStock.toLocaleString('ru-RU')} {t(`units.${item.product.unit}`)}</div><PriceCell original={originalPrice} uzs={unitPriceUzs} /><PriceCell original={{ ...originalPrice, amount: originalPrice.amount * Math.max(item.quantity, 0) }} uzs={Math.max(item.quantity, 0) * unitPriceUzs} strong /><Button size="small" type="text" danger icon={<i className="icons-trash icon-size-18" />} onClick={() => removeItem(item._key)} /></div>
          })}
        </>
      )}
    </>
  )
}
