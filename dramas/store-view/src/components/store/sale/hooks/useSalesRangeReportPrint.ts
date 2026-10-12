import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getLocalizedApiErrorMessage } from '@store/store-shared'
import type { StoreTranslator } from '@store/store-i18n'
import { SaleSeekApi } from '@store/store-stub'
import type { SaleReportQuery } from '@store/store-stub'
import { printSalesReport } from '../list/view/printSalesReport'

export function useSalesRangeReportPrint(t: StoreTranslator) {
  //
  const queryClient = useQueryClient()
  const [isPrinting, setIsPrinting] = useState(false)

  async function print(query: SaleReportQuery, periodLabel: string, filters: string[]) {
    //
    setIsPrinting(true)
    try {
      const report = await queryClient.fetchQuery({ ...SaleSeekApi.fetch.findSalesReport(query), staleTime: 0 })
      printSalesReport({ t, report, periodLabel, filters })
    } catch (error) {
      toast.error(getLocalizedApiErrorMessage(error, t, 'sales.reportError'))
    } finally {
      setIsPrinting(false)
    }
  }

  return { print, isPrinting }
}
