import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { PaymentMethod, SaleType } from '@/shared/types/domain';

export interface SaleDraftCartItem {
  key: string;
  productId: string;
  quantity: number;
}

interface SaleDraftState {
  branchId?: string;
  saleType: SaleType;
  customerId?: string;
  paymentMethod: PaymentMethod;
  paidAmount: number;
  debtDueDateIso?: string;
  cart: SaleDraftCartItem[];
}

interface SaleDraftActions {
  setBranchId: (branchId?: string) => void;
  setSaleType: (saleType: SaleType) => void;
  setCustomerId: (customerId?: string) => void;
  setPaymentMethod: (paymentMethod: PaymentMethod) => void;
  setPaidAmount: (paidAmount: number) => void;
  setDebtDueDateIso: (debtDueDateIso?: string) => void;
  setDraftValues: (values: Partial<SaleDraftState>) => void;
  addCartItem: (productId: string, quantity: number) => void;
  updateCartItemQuantity: (key: string, quantity: number) => void;
  removeCartItem: (key: string) => void;
  clearDraft: (branchId?: string) => void;
}

type SaleDraftStore = SaleDraftState & SaleDraftActions;

const initialDraft: SaleDraftState = {
  saleType: 'RETAIL',
  customerId: undefined,
  paymentMethod: 'CASH_UZS',
  paidAmount: 0,
  debtDueDateIso: undefined,
  cart: [],
};

function cartKey(productId: string) {
  return `${productId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export const useSaleDraftStore = create<SaleDraftStore>()(
  devtools(
    persist(
      (set) => ({
        ...initialDraft,

        setBranchId: (branchId) => set({ branchId }, false, 'saleDraft/setBranchId'),
        setSaleType: (saleType) => set({ saleType }, false, 'saleDraft/setSaleType'),
        setCustomerId: (customerId) => set({ customerId }, false, 'saleDraft/setCustomerId'),
        setPaymentMethod: (paymentMethod) => set({ paymentMethod }, false, 'saleDraft/setPaymentMethod'),
        setPaidAmount: (paidAmount) => set({ paidAmount }, false, 'saleDraft/setPaidAmount'),
        setDebtDueDateIso: (debtDueDateIso) => set({ debtDueDateIso }, false, 'saleDraft/setDebtDueDateIso'),
        setDraftValues: (values) =>
          set((state) => ({ ...state, ...values }), false, 'saleDraft/setDraftValues'),
        addCartItem: (productId, quantity) =>
          set(
            (state) => {
              if (state.cart.some((item) => item.productId === productId)) return state;
              return {
                cart: [
                  ...state.cart,
                  { key: cartKey(productId), productId, quantity },
                ],
              };
            },
            false,
            'saleDraft/addCartItem',
          ),
        updateCartItemQuantity: (key, quantity) =>
          set(
            (state) => ({
              cart: state.cart.map((item) =>
                item.key === key ? { ...item, quantity } : item,
              ),
            }),
            false,
            'saleDraft/updateCartItemQuantity',
          ),
        removeCartItem: (key) =>
          set(
            (state) => ({ cart: state.cart.filter((item) => item.key !== key) }),
            false,
            'saleDraft/removeCartItem',
          ),
        clearDraft: (branchId) =>
          set({ ...initialDraft, branchId }, false, 'saleDraft/clearDraft'),
      }),
      {
        name: 'akfa-sale-draft',
        partialize: (state) => ({
          branchId: state.branchId,
          saleType: state.saleType,
          customerId: state.customerId,
          paymentMethod: state.paymentMethod,
          paidAmount: state.paidAmount,
          debtDueDateIso: state.debtDueDateIso,
          cart: state.cart,
        }),
      },
    ),
    { name: 'SaleDraftStore' },
  ),
);
