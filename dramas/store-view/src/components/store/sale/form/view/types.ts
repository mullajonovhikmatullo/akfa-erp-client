import type { Control } from 'react-hook-form'
import type { PaymentMethod, Product, SaleType } from '@store/store-stub'

export interface CartItem {
  _key: string
  productId: string
  product: Product
  quantity: number
}

export type SaleFormValues = {
  branchId?: string
  saleType: SaleType
  customerId?: string
  paymentMethod: PaymentMethod
  paidAmount: number
  debtDueDateIso?: string
  selectedProductId?: string
  cart: { key: string; productId: string; quantity: number }[]
}

export const CART_GRID_COLUMNS = 'minmax(170px, 1fr) minmax(188px, 220px) minmax(90px, 120px) minmax(126px, 150px) minmax(150px, 178px) 28px'

export interface SaleCartViewProps {
  t: (key: string) => string
  control: Control<SaleFormValues>
  productSelectKey: number
  productSelectLoading: boolean
  sellableProducts: Product[]
  selectedProductIds: Set<string>
  stockByProductId: Map<string, number>
  addToCart: (productId: string) => void
  cart: CartItem[]
  saleType: SaleType
  unitPrice: (product: Product) => number
  changeQty: (key: string, delta: number) => void
  updateQty: (key: string, quantity: number | null) => void
  removeItem: (key: string) => void
}
