export type BillingTranslate = (key: string) => string

export type PaymentFormValues = {
  note?: string
}

export type ReceiptPreview = {
  url: string
  fileName: string
  mimeType: string
  note: string | null
}

