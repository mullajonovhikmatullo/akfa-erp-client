import { useMutation, useQueryClient } from '@tanstack/react-query'
import { CategoryFlowApi } from '@store/store-stub'
import type { CreateCategoryPayload, UpdateCategoryPayload } from '@store/store-stub'
import { categoryKeys } from './categoryKeys'

export function useCategoryMutation() {
  //
  const queryClient = useQueryClient()
  const invalidateCategories = () => queryClient.invalidateQueries({ queryKey: categoryKeys.all })

  const createCategory = useMutation({
    mutationFn: (payload: CreateCategoryPayload) => CategoryFlowApi.createCategory(payload),
    onSuccess: invalidateCategories,
  })

  const updateCategory = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCategoryPayload }) =>
      CategoryFlowApi.updateCategory({ id, payload }),
    onSuccess: invalidateCategories,
  })

  const deleteCategory = useMutation({
    mutationFn: CategoryFlowApi.deleteCategory,
    onSuccess: invalidateCategories,
  })

  return { createCategory, updateCategory, deleteCategory }
}
