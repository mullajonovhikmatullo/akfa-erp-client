import { useCallback, useEffect, useState } from 'react'
import { BillingSeekApi, type TenantPayment } from '@store/store-stub'
import type { ReceiptPreview } from '../view/types'

export function useBillingReceiptDetail(onError: (error: unknown) => void) {
  //
  const [openingReceiptId, setOpeningReceiptId] = useState<string | null>(null)
  const [preview, setPreview] = useState<ReceiptPreview | null>(null)

  useEffect(
    () => () => {
      //
      if (preview?.url) URL.revokeObjectURL(preview.url)
    },
    [preview?.url],
  )

  const openReceipt = useCallback(async (payment: TenantPayment) => {
    //
    if (!payment.receiptMedia) return
    setOpeningReceiptId(payment.receiptMedia.id)
    try {
      const blob = await BillingSeekApi.downloadMedia(payment.receiptMedia.id)
      setPreview({
        url: URL.createObjectURL(blob),
        fileName: payment.receiptMedia.fileName,
        mimeType: payment.receiptMedia.mimeType,
        note: payment.note,
      })
    } catch (error) {
      onError(error)
    } finally {
      setOpeningReceiptId(null)
    }
  }, [onError])

  return {
    openingReceiptId,
    preview,
    openReceipt,
    closePreview: () => setPreview(null),
  }
}

