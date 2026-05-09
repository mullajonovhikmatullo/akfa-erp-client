import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { customerApi, type CustomerFilters, type CreateCustomerPayload, type UpdateCustomerPayload } from '../api/customer.api';

export const customerKeys = {
  all: ['customers'] as const,
  list: (filters?: CustomerFilters) => [...customerKeys.all, 'list', filters] as const,
  detail: (id: string) => [...customerKeys.all, 'detail', id] as const,
};

export function useCustomers(filters?: CustomerFilters) {
  return useQuery({
    queryKey: customerKeys.list(filters),
    queryFn: () => customerApi.list(filters),
  });
}

export function useCustomerDetail(id: string | null) {
  return useQuery({
    queryKey: customerKeys.detail(id!),
    queryFn: () => customerApi.getById(id!),
    enabled: Boolean(id),
  });
}

export function useCreateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCustomerPayload) => customerApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: customerKeys.all });
      toast.success("Mijoz muvaffaqiyatli qo'shildi");
    },
    onError: () => toast.error("Mijoz qo'shishda xatolik"),
  });
}

export function useUpdateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCustomerPayload }) =>
      customerApi.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: customerKeys.all });
      toast.success('Mijoz yangilandi');
    },
    onError: () => toast.error('Yangilashda xatolik'),
  });
}

export function useDeactivateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => customerApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: customerKeys.all });
      toast.success("Mijoz o'chirildi");
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg ?? "O'chirishda xatolik");
    },
  });
}
