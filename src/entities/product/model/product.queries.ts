import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { productApi, type ProductListParams } from '../api/product.api';
import { categoryApi, type UpdateCategoryPayload } from '../api/category.api';

// ── Query keys ─────────────────────────────────────────────────────────────────
export const productKeys = {
  all: ['products'] as const,
  list: (filters?: ProductListParams) => ['products', 'list', filters ?? {}] as const,
  detail: (id: string) => ['products', 'detail', id] as const,
  inventory: (productId: string) => ['products', 'inventory', productId] as const,
};

export const categoryKeys = {
  all: ['categories'] as const,
  list: () => ['categories', 'list'] as const,
};

// ── Products ───────────────────────────────────────────────────────────────────
export function useProducts(filters?: ProductListParams) {
  return useQuery({
    queryKey: productKeys.list(filters),
    queryFn: () => productApi.list(filters),
  });
}

export function useProductsPage(params: ProductListParams & { page: number; pageSize: number }) {
  return useQuery({
    queryKey: [...productKeys.all, 'paginated', params] as const,
    queryFn: () => productApi.listPaginated(params),
  });
}

export function useProductDetail(id: string | null) {
  return useQuery({
    queryKey: productKeys.detail(id ?? ''),
    queryFn: () => productApi.getById(id!),
    enabled: Boolean(id),
  });
}

export function useProductInventory(productId: string | null) {
  return useQuery({
    queryKey: productKeys.inventory(productId ?? ''),
    queryFn: () => productApi.getInventory(productId!),
    enabled: Boolean(productId),
    staleTime: 30_000,
  });
}

// ── Mutations ──────────────────────────────────────────────────────────────────
export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: productApi.create,
    onSuccess: (product) => {
      qc.invalidateQueries({ queryKey: productKeys.all });
      toast.success(`"${product.name}" mahsulot qo'shildi`);
    },
    onError: (e: { response?: { data?: { message?: string } } }) => {
      toast.error(e.response?.data?.message ?? 'Mahsulot qo\'shishda xato');
    },
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof productApi.update>[1] }) =>
      productApi.update(id, payload),
    onSuccess: (product) => {
      qc.invalidateQueries({ queryKey: productKeys.all });
      toast.success(`"${product.name}" yangilandi`);
    },
    onError: (e: { response?: { data?: { message?: string } } }) => {
      toast.error(e.response?.data?.message ?? 'Yangilashda xato');
    },
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: productApi.remove,
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: productKeys.all });
      toast.success("Mahsulot o'chirildi");
    },
    onError: () => {
      toast.error("O'chirishda xato yuz berdi");
    },
  });
}

// ── Categories ─────────────────────────────────────────────────────────────────
export function useCategories(isActive?: boolean) {
  return useQuery({
    queryKey: [...categoryKeys.list(), isActive] as const,
    queryFn: () => categoryApi.list(isActive),
    staleTime: 1000 * 60 * 5,
  });
}

export function useCategoriesPage(page: number, pageSize: number, isActive?: boolean) {
  return useQuery({
    queryKey: [...categoryKeys.list(), 'paginated', page, pageSize, isActive] as const,
    queryFn: () => categoryApi.listPaginated({ page, pageSize, isActive }),
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: categoryApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: categoryKeys.all }),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCategoryPayload }) =>
      categoryApi.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: categoryKeys.all }),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: categoryApi.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: categoryKeys.all }),
  });
}
