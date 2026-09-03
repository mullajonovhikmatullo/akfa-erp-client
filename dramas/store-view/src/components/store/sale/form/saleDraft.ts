import type { PaymentMethod, SaleType } from '@store/store-stub'

export interface SaleDraftCartItem {
  key: string
  productId: string
  quantity: number
}

export interface SaleDraftState {
  branchId?: string
  saleType: SaleType
  customerId?: string
  paymentMethod: PaymentMethod
  paidAmount: number
  debtDueDateIso?: string
  cart: SaleDraftCartItem[]
}

const STORAGE_KEY = 'store-sale-draft'

export const initialSaleDraft: SaleDraftState = {
  saleType: 'RETAIL',
  customerId: undefined,
  paymentMethod: 'CASH_UZS',
  paidAmount: 0,
  debtDueDateIso: undefined,
  cart: [],
}

function getStorage() {
  //
  return typeof window === 'undefined' ? null : window.localStorage
}

export function readSaleDraft(): SaleDraftState {
  //
  const storage = getStorage()
  if (!storage) return initialSaleDraft

  try {
    const raw = storage.getItem(STORAGE_KEY)
    if (!raw) return initialSaleDraft
    const parsed = JSON.parse(raw) as { state?: Partial<SaleDraftState> } | Partial<SaleDraftState>
    const state = ('state' in parsed ? (parsed.state ?? {}) : parsed) as Partial<SaleDraftState>
    return {
      ...initialSaleDraft,
      ...state,
      cart: Array.isArray(state?.cart) ? state.cart : [],
    }
  } catch {
    return initialSaleDraft
  }
}

export function writeSaleDraft(values: SaleDraftState) {
  //
  const storage = getStorage()
  if (!storage) return
  storage.setItem(STORAGE_KEY, JSON.stringify({ state: values, version: 0 }))
}

export function clearSaleDraft(branchId?: string) {
  //
  writeSaleDraft({ ...initialSaleDraft, branchId })
}
