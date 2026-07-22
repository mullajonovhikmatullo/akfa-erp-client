import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { CustomerFlowApi, CustomerSeekApi } from '@erp/store-buddy-stub'
import type { CreateCustomerPayload, CustomerFilters, UpdateCustomerPayload } from '@erp/store-buddy-stub'

export const customerKeys = {
  all: ['customers'] as const,
  list: (filters?: CustomerFilters) => [...customerKeys.all, 'list', filters] as const,
  detail: (id: string) => [...customerKeys.all, 'detail', id] as const,
}

export function useCustomers(filters?: CustomerFilters) {
  //
  const { queryKey, queryFn } = CustomerSeekApi.fetch.findCustomers(filters)

  return useQuery({
    queryKey,
    queryFn,
  })
}

export function useCustomerDetail(id: string | null) {
  //
  const query = id ? CustomerSeekApi.fetch.findCustomer(id) : null

  return useQuery({
    queryKey: query?.queryKey ?? customerKeys.detail(''),
    queryFn: query?.queryFn ?? (() => Promise.reject(new Error('Customer id is required'))),
    enabled: Boolean(id),
  })
}

export function useCreateCustomer() {
  //
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateCustomerPayload) => CustomerFlowApi.createCustomer(payload),
    onSuccess: () => {
      //
      queryClient.invalidateQueries({ queryKey: customerKeys.all })
      toast.success("Mijoz muvaffaqiyatli qo'shildi")
    },
    onError: () => toast.error("Mijoz qo'shishda xatolik"),
  })
}

export function useUpdateCustomer() {
  //
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCustomerPayload }) =>
      CustomerFlowApi.updateCustomer({ id, payload }),
    onSuccess: () => {
      //
      queryClient.invalidateQueries({ queryKey: customerKeys.all })
      toast.success('Mijoz yangilandi')
    },
    onError: () => toast.error('Yangilashda xatolik'),
  })
}

export function useDeactivateCustomer() {
  //
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => CustomerFlowApi.deleteCustomer(id),
    onSuccess: async () => {
      //
      await queryClient.invalidateQueries({ queryKey: customerKeys.all })
      toast.success("Mijoz o'chirildi")
    },
    onError: (error: unknown) => {
      //
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(message ?? "O'chirishda xatolik")
    },
  })
}
