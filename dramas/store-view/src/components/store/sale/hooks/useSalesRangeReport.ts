import { useQuery } from '@tanstack/react-query'
import { SaleSeekApi } from '@store/store-stub'
import type { SaleReportQuery } from '@store/store-stub'
import { saleKeys } from './saleKeys'

export function useSalesRangeReport(params: SaleReportQuery | null) {
  //
  const query = params ? SaleSeekApi.fetch.findSalesReport(params) : null

  return useQuery({
    queryKey: query?.queryKey ?? saleKeys.report(),
    queryFn: query?.queryFn ?? (() => Promise.reject(new Error('Report range is required'))),
    enabled: Boolean(params),
    staleTime: 0,
  })
}
