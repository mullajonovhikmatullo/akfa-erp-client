import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { saleApi, type SaleFilters, type CreateSalePayload, type AddPaymentPayload } from '../api/sale.api';
import { analyticsKeys } from '@/entities/analytics';
import { customerKeys } from '@/entities/customer';
import { inventoryKeys } from '@/entities/inventory';
import { useT } from '@/shared/lib/i18n';

export const saleKeys = {
  all: ['sales'] as const,
  list: (filters?: SaleFilters) => [...saleKeys.all, 'list', filters] as const,
  paginated: (page: number, pageSize: number, filters?: SaleFilters) =>
    [...saleKeys.all, 'paginated', page, pageSize, filters] as const,
  detail: (id: string) => [...saleKeys.all, 'detail', id] as const,
};

export function useSales(filters?: SaleFilters, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: saleKeys.list(filters),
    queryFn: () => saleApi.list(filters),
    enabled: options?.enabled ?? true,
  });
}

export function useSalesPage(page: number, pageSize: number, filters?: SaleFilters) {
  return useQuery({
    queryKey: saleKeys.paginated(page, pageSize, filters),
    queryFn: () => saleApi.listPaginated({ ...filters, page, pageSize }),
    staleTime: 2 * 60 * 1000,
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
  const t = useT();
  return useMutation({
    mutationFn: (payload: CreateSalePayload) => saleApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: saleKeys.all });
      qc.invalidateQueries({ queryKey: customerKeys.all });
      qc.invalidateQueries({ queryKey: inventoryKeys.all });
      qc.invalidateQueries({ queryKey: analyticsKeys.all });
      toast.success(t('sales.createSuccess'));
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg ?? t('sales.createError'));
    },
  });
}

export function useAddPayment() {
  const qc = useQueryClient();
  const t = useT();
  return useMutation({
    mutationFn: ({ saleId, payload }: { saleId: string; payload: AddPaymentPayload }) =>
      saleApi.addPayment(saleId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: saleKeys.all });
      qc.invalidateQueries({ queryKey: customerKeys.all });
      qc.invalidateQueries({ queryKey: analyticsKeys.all });
      toast.success(t('sales.paymentSuccess'));
    },
    onError: () => toast.error(t('sales.paymentError')),
  });
}

export function useSetDebtDeadline() {
  const qc = useQueryClient();
  const t = useT();
  return useMutation({
    mutationFn: ({ saleId, debtDueDate }: { saleId: string; debtDueDate: string | null }) =>
      saleApi.setDebtDeadline(saleId, debtDueDate),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: saleKeys.all });
      qc.invalidateQueries({ queryKey: analyticsKeys.all });
      toast.success(t('sales.debtDeadlineSuccess'));
    },
  });
}
