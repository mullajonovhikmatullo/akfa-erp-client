import type { StoreTranslator } from '@store/store-i18n'
import type { PaymentMethod, Product, SaleType } from '@store/store-stub'

export interface CartItem {
  _key: string
  productId: string
  product: Product
  quantity: number
  discountPercent: number
  listUnitPriceUzs: number
  unitPriceUzs: number
}

export type SaleFormValues = {
  branchId?: string
  saleType: SaleType
  customerId?: string
  paymentMethod: PaymentMethod
  paidAmount: number
  discountPercent: number | null
  debtDueDateIso?: string
  selectedProductId?: string
  cart: { key: string; productId: string; quantity: number; discountPercent?: number | null }[]
}

export const CART_GRID_COLUMNS = 'minmax(150px, 1fr) minmax(150px, 176px) minmax(150px, 160px) minmax(88px, 96px) minmax(104px, 128px) minmax(112px, 148px) 28px'

export interface SaleCartViewProps {
  t: StoreTranslator
  productSelectLoading: boolean
  sellableProducts: Product[]
  selectedProductIds: Set<string>
  stockByProductId: Map<string, number>
  addToCart: (productId: string) => void
  removeProduct: (productId: string) => void
  cart: CartItem[]
  saleType: SaleType
  changeQty: (key: string, delta: number) => void
  updateQty: (key: string, quantity: number | null) => void
  updateItemDiscount: (key: string, discountPercent: number | null) => void
  removeItem: (key: string) => void
  discountEnabled: boolean
}
