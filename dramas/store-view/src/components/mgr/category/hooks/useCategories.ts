import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CategoryFlowApi, CategorySeekApi } from '@store/store-stub'
import type { CreateCategoryPayload, UpdateCategoryPayload } from '@store/store-stub'

export const categoryKeys = {
  all: ['categories'] as const,
  list: () => ['categories', 'list'] as const,
  summary: () => ['categories', 'summary'] as const,
}

export function useCategories(isActive?: boolean) {
  //
  const { queryKey, queryFn } = CategorySeekApi.fetch.findCategories(isActive)

  return useQuery({
    queryKey,
    queryFn,
    staleTime: 1000 * 60 * 5,
  })
}

export function useCategoriesPage(page: number, pageSize: number, isActive?: boolean) {
  //
  const { queryKey, queryFn } = CategorySeekApi.fetch.findCategoriesPage({ page, pageSize, isActive })

  return useQuery({
    queryKey,
    queryFn,
    staleTime: 1000 * 60 * 5,
  })
}

export function useCategorySummary() {
  //
  const { queryKey, queryFn } = CategorySeekApi.fetch.findCategorySummary()

  return useQuery({
    queryKey,
    queryFn,
    staleTime: 1000 * 60 * 5,
  })
}

export function useCreateCategory() {
  //
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateCategoryPayload) => CategoryFlowApi.createCategory(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: categoryKeys.all }),
  })
}

export function useUpdateCategory() {
  //
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCategoryPayload }) =>
      CategoryFlowApi.updateCategory({ id, payload }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: categoryKeys.all }),
  })
}

export function useDeleteCategory() {
  //
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: CategoryFlowApi.deleteCategory,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: categoryKeys.all }),
  })
}
