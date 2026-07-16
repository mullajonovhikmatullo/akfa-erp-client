import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { transferApi, type TransferFilters, type CreateTransferPayload } from '../api/transfer.api';
import { analyticsKeys } from '@/entities/analytics';
import { inventoryKeys } from '@/entities/inventory';

export const transferKeys = {
  all: ['transfers'] as const,
  list: (filters?: TransferFilters) => [...transferKeys.all, 'list', filters] as const,
  detail: (id: string) => [...transferKeys.all, 'detail', id] as const,
};

export function useTransfers(filters?: TransferFilters, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: transferKeys.list(filters),
    queryFn: () => transferApi.list(filters),
    enabled: options?.enabled ?? true,
  });
}

export function useCreateTransfer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTransferPayload) => transferApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: transferKeys.all });
      qc.invalidateQueries({ queryKey: analyticsKeys.all });
      toast.success("Transfer yaratildi");
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg ?? 'Transferda xatolik');
    },
  });
}

export function useCompleteTransfer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => transferApi.complete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: transferKeys.all });
      qc.invalidateQueries({ queryKey: inventoryKeys.all });
      qc.invalidateQueries({ queryKey: analyticsKeys.all });
      toast.success('Transfer yakunlandi, ombor yangilandi');
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg ?? 'Yakunlashda xatolik');
    },
  });
}

export function useCancelTransfer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => transferApi.cancel(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: transferKeys.all });
      qc.invalidateQueries({ queryKey: analyticsKeys.all });
      toast.success("Transfer bekor qilindi");
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg ?? 'Bekor qilishda xatolik');
    },
  });
}
