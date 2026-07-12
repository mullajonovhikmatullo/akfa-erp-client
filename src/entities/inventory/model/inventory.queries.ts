import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { inventoryApi, type StockInPayload, type BatchFilters, type InventoryFilters } from '../api/inventory.api';
import { useT } from '@/shared/lib/i18n';

export const inventoryKeys = {
  all: ['inventory'] as const,
  list: (filters?: InventoryFilters) => [...inventoryKeys.all, 'list', filters] as const,
  batches: (filters?: BatchFilters) => [...inventoryKeys.all, 'batches', filters] as const,
  batchesPaginated: (page: number, pageSize: number, filters?: BatchFilters) =>
    [...inventoryKeys.all, 'batches', 'paginated', page, pageSize, filters] as const,
};

export function useInventoryRecords(filters?: InventoryFilters, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: inventoryKeys.list(filters),
    queryFn: () => inventoryApi.listCurrent(filters),
    enabled: options?.enabled ?? true,
  });
}

export function useStockBatches(filters?: BatchFilters, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: inventoryKeys.batches(filters),
    queryFn: () => inventoryApi.listBatches(filters),
    enabled: options?.enabled ?? true,
  });
}

export function useStockBatchesPage(page: number, pageSize: number, filters?: BatchFilters) {
  return useQuery({
    queryKey: inventoryKeys.batchesPaginated(page, pageSize, filters),
    queryFn: () => inventoryApi.listBatchesPaginated({ ...filters, page, pageSize }),
    staleTime: 2 * 60 * 1000,
  });
}

export function useStockInBatch() {
  const qc = useQueryClient();
  const t = useT();
  return useMutation({
    mutationFn: (items: StockInPayload[]) => inventoryApi.stockInBatch(items),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: inventoryKeys.all });
      toast.success(`${vars.length} ${t('stockIn.successSuffix')}`);
    },
    onError: (err: unknown) => {
      const error = err as {
        code?: string;
        message?: string;
        response?: { data?: { message?: string } };
      };
      const msg = error.response?.data?.message;
      const isTimeout = error.code === 'ECONNABORTED' || error.message?.includes('timeout');
      toast.error(isTimeout ? t('stockIn.timeoutError') : (msg ?? t('stockIn.error')));
    },
  });
}
