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

export function getSaleDraftScope(): string | null {
  //
  try {
    const raw = globalThis.sessionStorage?.getItem('store-auth')
    const user = raw ? JSON.parse(raw)?.state?.user : null
    if (typeof user?.id !== 'string' || typeof user?.storeId !== 'string') return null
    return `${encodeURIComponent(user.storeId)}:${encodeURIComponent(user.id)}`
  } catch {
    return null
  }
}

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

export function readSaleDraft(scope = getSaleDraftScope()): SaleDraftState {
  //
  const storage = getStorage()
  if (!storage || !scope) return initialSaleDraft

  try {
    const raw = storage.getItem(`${STORAGE_KEY}:${scope}`)
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

export function writeSaleDraft(values: SaleDraftState, scope = getSaleDraftScope()) {
  //
  const storage = getStorage()
  if (!storage || !scope || scope !== getSaleDraftScope()) return
  storage.setItem(`${STORAGE_KEY}:${scope}`, JSON.stringify({ state: values, version: 0 }))
}

export function clearSaleDraft(branchId?: string, scope = getSaleDraftScope()) {
  //
  writeSaleDraft({ ...initialSaleDraft, branchId }, scope)
}
