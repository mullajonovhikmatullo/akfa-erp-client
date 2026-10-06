import { StoreIcon } from '@store/store-shared/ui/store-icon'
import { Button, Empty } from 'antd'

import { getSaleProductPrice } from '@store/store-shared/lib/product-pricing'
import { AuthenticatedProductImage } from '../../../product'
import { ProductChecklistSelect } from '../../../product/checklist/ProductChecklistSelect'
import { PriceCell, QuantityStepper } from './index'
import type { SaleCartViewProps } from './types'

export function SaleCartView({
  t,
  productSelectLoading,
  sellableProducts,
  selectedProductIds,
  stockByProductId,
  addToCart,
  removeProduct,
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
        <ProductChecklistSelect
          t={t}
          products={sellableProducts}
          selectedIds={[...selectedProductIds]}
          placeholder={t('newSale.productSearchPlaceholder')}
          loading={productSelectLoading}
          renderLeading={(product) => <AuthenticatedProductImage url={product.primaryThumbnailUrl ?? product.primaryImageUrl} alt={product.name} width={34} height={34} />}
          renderTrailing={(product) => (
            <span className="u-text-muted u-shrink-0 u-fs-12">
              {t('newSale.availableStock')}: {(stockByProductId.get(product.id) ?? 0).toLocaleString('ru-RU')} {t(`units.${product.unit}`)}
            </span>
          )}
          onAdd={addToCart}
          onRemove={removeProduct}
        />
      </div>
      {cart.length === 0 ? <Empty description={t('newSale.emptyCart')} image={Empty.PRESENTED_IMAGE_SIMPLE} className="u-p-24-0" /> : (
        <>
          <div className="sale-cart-grid sale-cart-grid--header">
            <div>{t('newSale.colProduct')}</div><div>{t('newSale.colQty')}</div><div className="u-text-right">{t('newSale.colRemainingStock')}</div><div className="u-text-right">{t('newSale.colUnitPrice')}</div><div className="u-text-right">{t('newSale.colTotal')}</div><div />
          </div>
          {cart.map((item) => {
            //
            const originalPrice = getSaleProductPrice(item.product, saleType)
            const unitPriceUzs = unitPrice(item.product)
            const availableStock = stockByProductId.get(item.productId) ?? 0
            const remainingStock = Number(Math.max(0, availableStock - item.quantity).toFixed(4))
            const hasNoRemainingStock = remainingStock <= 0
            return <div key={item._key} className="sale-cart-grid sale-cart-grid--row"><div className="u-items-center u-flex u-gap-9 u-min-w-0"><AuthenticatedProductImage url={item.product.primaryThumbnailUrl ?? item.product.primaryImageUrl} alt={item.product.name} width={40} height={40} /><div className="u-min-w-0"><div className="sale-cart-name" title={item.product.name}>{item.product.name}</div>{item.product.sku ? <div className="u-text-muted u-font-mono u-fs-11">{item.product.sku}</div> : null}</div></div><QuantityStepper value={item.quantity} max={availableStock} unitLabel={t(`units.${item.product.unit}`)} onMinus={() => changeQty(item._key, -1)} onPlus={() => changeQty(item._key, 1)} onChange={(value) => updateQty(item._key, value)} /><div className={`num sale-cart-stock${hasNoRemainingStock ? ' tone-danger' : ''}`}>{remainingStock.toLocaleString('ru-RU')} {t(`units.${item.product.unit}`)}</div><PriceCell original={originalPrice} uzs={unitPriceUzs} /><PriceCell original={{ ...originalPrice, amount: originalPrice.amount * Math.max(item.quantity, 0) }} uzs={Math.max(item.quantity, 0) * unitPriceUzs} strong /><Button size="small" type="text" danger icon={<StoreIcon name="trash" size={16} />} onClick={() => removeItem(item._key)} /></div>
          })}
        </>
      )}
    </>
  )
}
