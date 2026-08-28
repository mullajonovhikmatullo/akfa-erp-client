export type {
  PaymentBranch,
  PaymentCurrency,
  PaymentReceiptMedia,
  PaymentStatus,
  StoreStatus,
  SubmitTenantPaymentPayload,
  TenantBillingSummary,
  TenantPayment,
} from '../../../contracts/backend.generated'

export interface PublicBillingPlan {
  code: string
  name: string
  monthlyPriceUzs: number
  maxBranches: number | null
  maxUsers: number | null
  maxProducts: number | null
}
