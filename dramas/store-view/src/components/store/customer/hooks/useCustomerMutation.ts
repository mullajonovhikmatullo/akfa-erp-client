import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { CustomerFlowApi } from '@store/store-stub'
import { getLocalizedApiErrorMessage } from '@store/store-shared'
import { analyticsKeys } from '../../analytics/hooks/analyticsKeys'
import { customerKeys } from './customerKeys'

type Translate = (key: string) => string

interface CustomerMutationOptions {
  showCreateSuccess?: boolean
}

export function useCustomerMutation(t: Translate, { showCreateSuccess = true }: CustomerMutationOptions = {}) {
  //
  const queryClient = useQueryClient()
  const invalidateCustomerData = () => {
    //
    queryClient.invalidateQueries({ queryKey: customerKeys.all })
    queryClient.invalidateQueries({ queryKey: analyticsKeys.all })
  }

  const linkCustomerBranch = useMutation({
    mutationFn: ({ customerId, branchId }: { customerId: string; branchId?: string }) =>
      CustomerFlowApi.linkCustomerBranch(customerId, branchId),
    onSuccess: invalidateCustomerData,
    onError: (error: unknown) => toast.error(getLocalizedApiErrorMessage(error, t, 'customers.linkError')),
  })

  const createCustomer = useMutation({
    mutationFn: CustomerFlowApi.createCustomer,
    onSuccess: () => {
      //
      invalidateCustomerData()
      if (showCreateSuccess) toast.success(t('customers.createSuccess'))
    },
    onError: (error: unknown) => toast.error(getLocalizedApiErrorMessage(error, t, 'customers.createError')),
  })

  const updateCustomer = useMutation({
    mutationFn: CustomerFlowApi.updateCustomer,
    onSuccess: () => {
      //
      invalidateCustomerData()
      toast.success(t('customers.updateSuccess'))
    },
    onError: (error: unknown) => toast.error(getLocalizedApiErrorMessage(error, t, 'customers.updateError')),
  })

  const deactivateCustomer = useMutation({
    mutationFn: CustomerFlowApi.deleteCustomer,
    onSuccess: async () => {
      //
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: customerKeys.all }),
        queryClient.invalidateQueries({ queryKey: analyticsKeys.all }),
      ])
      toast.success(t('customers.deleteSuccess'))
    },
    onError: (error: unknown) => {
      //
      toast.error(getLocalizedApiErrorMessage(error, t, 'customers.deleteError'))
    },
  })

  return { linkCustomerBranch, createCustomer, updateCustomer, deactivateCustomer }
}
