import type { Product } from '@store/store-stub'

export interface TransferCartItem {
  _key: string
  productId: string
  product: Product
  quantity: number
  unitCostUzs: number
}
