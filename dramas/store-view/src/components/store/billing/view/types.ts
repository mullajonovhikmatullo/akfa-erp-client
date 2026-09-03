import type { StoreTranslator } from '@store/store-i18n'
export type BillingTranslate = StoreTranslator

export type PaymentFormValues = {
  note?: string
}

export type ReceiptPreview = {
  url: string
  fileName: string
  mimeType: string
  note: string | null
}

