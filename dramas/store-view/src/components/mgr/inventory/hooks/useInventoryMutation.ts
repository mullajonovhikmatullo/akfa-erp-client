import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { InventoryFlowApi } from '@store/store-stub'
import type { StockInPayload } from '@store/store-stub'
import { getLocalizedApiErrorMessage } from '@store/store-shared'
import { inventoryKeys } from './inventoryKeys'

export function useInventoryMutation(t: (key: string) => string) {
  //
  const queryClient = useQueryClient()

  const stockInBatch = useMutation({
    mutationFn: (items: StockInPayload[]) => InventoryFlowApi.stockInBatch(items),
    onSuccess: (_, variables) => {
      //
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all })
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast.success(`${variables.length} ${t('stockIn.successSuffix')}`)
    },
    onError: (error: unknown) => {
      //
      const typedError = error as { code?: string; message?: string; response?: { data?: { message?: string } } }
      const isTimeout = typedError.code === 'ECONNABORTED' || typedError.message?.includes('timeout')
      toast.error(isTimeout ? t('stockIn.timeoutError') : getLocalizedApiErrorMessage(error, t, 'stockIn.error'))
    },
  })

  return { stockInBatch }
}
