import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { CustomerFlowApi } from '@store/store-stub'
import type { CreateCustomerPayload, UpdateCustomerPayload } from '@store/store-stub'
import { getLocalizedApiErrorMessage } from '@store/store-shared'
import { customerKeys } from './customerKeys'

type Translate = (key: string) => string

export function useCustomerMutation(t: Translate) {
  //
  const queryClient = useQueryClient()

  const linkCustomerBranch = useMutation({
    mutationFn: ({ customerId, branchId }: { customerId: string; branchId?: string }) =>
      CustomerFlowApi.linkCustomerBranch(customerId, branchId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: customerKeys.all }),
    onError: (error: unknown) => toast.error(getLocalizedApiErrorMessage(error, t, 'customers.linkError')),
  })

  const createCustomer = useMutation({
    mutationFn: (payload: CreateCustomerPayload) => CustomerFlowApi.createCustomer(payload),
    onSuccess: () => {
      //
      queryClient.invalidateQueries({ queryKey: customerKeys.all })
      toast.success(t('customers.createSuccess'))
    },
    onError: (error: unknown) => toast.error(getLocalizedApiErrorMessage(error, t, 'customers.createError')),
  })

  const updateCustomer = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCustomerPayload }) =>
      CustomerFlowApi.updateCustomer({ id, payload }),
    onSuccess: () => {
      //
      queryClient.invalidateQueries({ queryKey: customerKeys.all })
      toast.success(t('customers.updateSuccess'))
    },
    onError: (error: unknown) => toast.error(getLocalizedApiErrorMessage(error, t, 'customers.updateError')),
  })

  const deactivateCustomer = useMutation({
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

  return { linkCustomerBranch, createCustomer, updateCustomer, deactivateCustomer }
}
