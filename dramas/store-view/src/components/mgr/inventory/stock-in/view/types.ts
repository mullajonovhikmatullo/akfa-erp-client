import type { Product } from '@store/store-stub'

export interface StockInCartItem {
  _key: string
  productId: string
  product: Product
  quantity: number
  costPriceUzs: number
  costPriceUsd?: number
}
