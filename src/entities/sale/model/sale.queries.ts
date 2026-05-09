import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { saleApi, type SaleFilters, type CreateSalePayload, type AddPaymentPayload } from '../api/sale.api';
import { customerKeys } from '@/entities/customer';

export const saleKeys = {
  all: ['sales'] as const,
  list: (filters?: SaleFilters) => [...saleKeys.all, 'list', filters] as const,
  detail: (id: string) => [...saleKeys.all, 'detail', id] as const,
};

export function useSales(filters?: SaleFilters) {
  return useQuery({
    queryKey: saleKeys.list(filters),
    queryFn: () => saleApi.list(filters),
  });
}

export function useSaleDetail(id: string | null) {
  return useQuery({
    queryKey: saleKeys.detail(id!),
    queryFn: () => saleApi.getById(id!),
    enabled: Boolean(id),
  });
}

export function useCreateSale() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateSalePayload) => saleApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: saleKeys.all });
      qc.invalidateQueries({ queryKey: customerKeys.all });
      toast.success("Sotuv muvaffaqiyatli amalga oshirildi");
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg ?? 'Sotuvda xatolik');
    },
  });
}

export function useAddPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ saleId, payload }: { saleId: string; payload: AddPaymentPayload }) =>
      saleApi.addPayment(saleId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: saleKeys.all });
      qc.invalidateQueries({ queryKey: customerKeys.all });
      toast.success("To'lov qabul qilindi");
    },
    onError: () => toast.error("To'lovda xatolik"),
  });
}

export function useSetDebtDeadline() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ saleId, debtDueDate }: { saleId: string; debtDueDate: string | null }) =>
      saleApi.setDebtDeadline(saleId, debtDueDate),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: saleKeys.all });
      toast.success('Muddat yangilandi');
    },
  });
}
