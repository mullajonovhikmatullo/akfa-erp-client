import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  expenseApi,
  type ExpenseFilters,
  type CreateExpensePayload,
  type CreateExpenseCategoryPayload,
  type UpdateExpenseCategoryPayload,
} from '../api/expense.api';

export const expenseKeys = {
  all: ['expenses'] as const,
  list: (filters?: ExpenseFilters) => [...expenseKeys.all, 'list', filters] as const,
  categories: (includeInactive?: boolean) => [...expenseKeys.all, 'categories', includeInactive] as const,
};

export function useExpenses(filters?: ExpenseFilters) {
  return useQuery({
    queryKey: expenseKeys.list(filters),
    queryFn: () => expenseApi.list(filters),
  });
}

export function useExpenseCategories(includeInactive?: boolean) {
  return useQuery({
    queryKey: expenseKeys.categories(includeInactive),
    queryFn: () => expenseApi.listCategories(includeInactive),
  });
}

export function useCreateExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateExpensePayload) => expenseApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: expenseKeys.all });
      toast.success("Xarajat qayd qilindi");
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg ?? 'Xarajat qo\'shishda xatolik');
    },
  });
}

export function useDeleteExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => expenseApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: expenseKeys.all });
      toast.success("Xarajat o'chirildi");
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg ?? "O'chirishda xatolik");
    },
  });
}

export function useCreateExpenseCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateExpenseCategoryPayload) => expenseApi.createCategory(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: expenseKeys.categories() });
      toast.success("Kategoriya qo'shildi");
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg ?? 'Xatolik');
    },
  });
}

export function useUpdateExpenseCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateExpenseCategoryPayload }) =>
      expenseApi.updateCategory(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: expenseKeys.categories() });
      toast.success('Kategoriya yangilandi');
    },
  });
}

export function useDeleteExpenseCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => expenseApi.deleteCategory(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: expenseKeys.categories() });
      toast.success("Kategoriya o'chirildi");
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg ?? "O'chirishda xatolik");
    },
  });
}
