import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getLocalizedApiErrorMessage } from '@store/store-shared'
import type { StoreLocale, StoreTranslator } from '@store/store-i18n'
import { SaleSeekApi } from '@store/store-stub'
import { printSaleInvoice } from '../print/printSaleInvoice'

export function useSaleInvoicePrint(t: StoreTranslator) {
  //
  const queryClient = useQueryClient()
  const [isPrinting, setIsPrinting] = useState(false)

  async function print(saleId: string, locale: StoreLocale) {
    //
    setIsPrinting(true)
    try {
      const invoice = await queryClient.fetchQuery({ ...SaleSeekApi.fetch.findSaleInvoice(saleId), staleTime: 0 })
      printSaleInvoice(locale, invoice)
    } catch (error) {
      toast.error(getLocalizedApiErrorMessage(error, t, 'invoice.error'))
    } finally {
      setIsPrinting(false)
    }
  }

  return { print, isPrinting }
}
