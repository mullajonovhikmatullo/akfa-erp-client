import type { Product } from '@store/store-stub'

export interface TransferCartItem {
  _key: string
  productId: string
  product: Product
  quantity: number
  unitCostUzs: number
}

export interface TransferFormValues {
  fromBranchId?: string
  toBranchId?: string
  note: string
  cart: TransferCartItem[]
}
