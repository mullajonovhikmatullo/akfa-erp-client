import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { CustomerFlowApi, CustomerSeekApi } from '@store/store-stub'
import type { CreateCustomerPayload, CustomerFilters, UpdateCustomerPayload } from '@store/store-stub'
import { getLocalizedApiErrorMessage } from '@store/store-shared/lib/api-error'

type Translate = (key: string) => string

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

export function useCustomerPhoneCheck(phone: string, branchId?: string, enabled = true) {
  const { queryKey, queryFn } = CustomerSeekApi.fetch.checkCustomerPhone(phone, branchId)
  return useQuery({ queryKey, queryFn, enabled: enabled && Boolean(phone) && Boolean(branchId), staleTime: 0 })
}

export function useLinkCustomerBranch(t: Translate) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ customerId, branchId }: { customerId: string; branchId?: string }) =>
      CustomerFlowApi.linkCustomerBranch(customerId, branchId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: customerKeys.all }),
    onError: (error: unknown) => toast.error(getLocalizedApiErrorMessage(error, t, 'customers.linkError')),
  })
}

export function useCreateCustomer(t: Translate) {
  //
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateCustomerPayload) => CustomerFlowApi.createCustomer(payload),
    onSuccess: () => {
      //
      queryClient.invalidateQueries({ queryKey: customerKeys.all })
      toast.success(t('customers.createSuccess'))
    },
    onError: (error: unknown) => {
      toast.error(getLocalizedApiErrorMessage(error, t, 'customers.createError'))
    },
  })
}

export function useUpdateCustomer(t: Translate) {
  //
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCustomerPayload }) =>
      CustomerFlowApi.updateCustomer({ id, payload }),
    onSuccess: () => {
      //
      queryClient.invalidateQueries({ queryKey: customerKeys.all })
      toast.success(t('customers.updateSuccess'))
    },
    onError: (error: unknown) => toast.error(getLocalizedApiErrorMessage(error, t, 'customers.updateError')),
  })
}

export function useDeactivateCustomer(t: Translate) {
  //
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => CustomerFlowApi.deleteCustomer(id),
    onSuccess: async () => {
      //
      await queryClient.invalidateQueries({ queryKey: customerKeys.all })
      toast.success(t('customers.deleteSuccess'))
    },
    onError: (error: unknown) => {
      //
      toast.error(getLocalizedApiErrorMessage(error, t, 'customers.deleteError'))
    },
  })
}
