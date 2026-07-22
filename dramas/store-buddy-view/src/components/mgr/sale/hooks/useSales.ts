import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { SaleFlowApi, SaleSeekApi } from '@erp/store-buddy-stub'
import type { AddPaymentPayload, CreateSalePayload, SaleFilters } from '@erp/store-buddy-stub'
import { customerKeys } from '../../customer/hooks/useCustomers'

export const saleKeys = {
  all: ['sales'] as const,
  list: (filters?: SaleFilters) => [...saleKeys.all, 'list', filters] as const,
  paginated: (page: number, pageSize: number, filters?: SaleFilters) => [...saleKeys.all, 'paginated', page, pageSize, filters] as const,
  detail: (id: string) => [...saleKeys.all, 'detail', id] as const,
}

export function useSales(filters?: SaleFilters, options?: { enabled?: boolean }) {
  //
  const { queryKey, queryFn } = SaleSeekApi.fetch.findSales(filters)

  return useQuery({
    queryKey,
    queryFn,
    enabled: options?.enabled ?? true,
  })
}

export function useSalesPage(page: number, pageSize: number, filters?: SaleFilters) {
  //
  const { queryKey, queryFn } = SaleSeekApi.fetch.findSalesPage({ ...filters, page, pageSize })

  return useQuery({
    queryKey,
    queryFn,
    staleTime: 2 * 60 * 1000,
  })
}

export function useSaleDetail(id: string | null) {
  //
  const query = id ? SaleSeekApi.fetch.findSale(id) : null

  return useQuery({
    queryKey: query?.queryKey ?? saleKeys.detail(''),
    queryFn: query?.queryFn ?? (() => Promise.reject(new Error('Sale id is required'))),
    enabled: Boolean(id),
  })
}

export function useCreateSale(t: (key: string) => string) {
  //
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateSalePayload) => SaleFlowApi.createSale(payload),
    onSuccess: () => {
      //
      queryClient.invalidateQueries({ queryKey: saleKeys.all })
      queryClient.invalidateQueries({ queryKey: customerKeys.all })
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
      toast.success(t('sales.createSuccess'))
    },
    onError: (error: unknown) => {
      //
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(message ?? t('sales.createError'))
    },
  })
}

export function useAddPayment(t: (key: string) => string) {
  //
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ saleId, payload }: { saleId: string; payload: AddPaymentPayload }) => SaleFlowApi.addPayment({ saleId, payload }),
    onSuccess: () => {
      //
      queryClient.invalidateQueries({ queryKey: saleKeys.all })
      queryClient.invalidateQueries({ queryKey: customerKeys.all })
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
      toast.success(t('sales.paymentSuccess'))
    },
    onError: () => toast.error(t('sales.paymentError')),
  })
}

export function useSetDebtDeadline(t: (key: string) => string) {
  //
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ saleId, debtDueDate }: { saleId: string; debtDueDate: string | null }) =>
      SaleFlowApi.setDebtDeadline({ saleId, debtDueDate }),
    onSuccess: () => {
      //
      queryClient.invalidateQueries({ queryKey: saleKeys.all })
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
      toast.success(t('sales.debtDeadlineSuccess'))
    },
  })
}
