import type { Currency, Product } from '@store/store-stub'

export interface StockInCartItem {
  _key: string
  productId: string
  product: Product
  quantity: number
  currency: Currency
  costPrice: number
  wholesalePrice: number
  retailPrice: number
}

export interface StockInFormValues {
  branchId?: string
  cart: StockInCartItem[]
}
