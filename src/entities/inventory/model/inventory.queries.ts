import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { inventoryApi, type StockInPayload, type BatchFilters } from '../api/inventory.api';

export const inventoryKeys = {
  all: ['inventory'] as const,
  batches: (filters?: BatchFilters) => [...inventoryKeys.all, 'batches', filters] as const,
  batchesPaginated: (page: number, pageSize: number, filters?: BatchFilters) =>
    [...inventoryKeys.all, 'batches', 'paginated', page, pageSize, filters] as const,
};

export function useStockBatches(filters?: BatchFilters) {
  return useQuery({
    queryKey: inventoryKeys.batches(filters),
    queryFn: () => inventoryApi.listBatches(filters),
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
  return useMutation({
    mutationFn: (items: StockInPayload[]) =>
      Promise.all(items.map((p) => inventoryApi.stockIn(p))),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: inventoryKeys.all });
      toast.success(`${vars.length} ta mahsulot omborga qabul qilindi`);
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg ?? 'Kirimda xatolik yuz berdi');
    },
  });
}
