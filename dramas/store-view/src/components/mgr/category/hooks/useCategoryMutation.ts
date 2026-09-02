import { useMutation, useQueryClient } from '@tanstack/react-query'
import { CategoryFlowApi } from '@store/store-stub'
import { categoryKeys } from './categoryKeys'

export function useCategoryMutation() {
  //
  const queryClient = useQueryClient()
  const invalidateCategories = () => queryClient.invalidateQueries({ queryKey: categoryKeys.all })

  const createCategory = useMutation({
    mutationFn: CategoryFlowApi.createCategory,
    onSuccess: invalidateCategories,
  })

  const updateCategory = useMutation({
    mutationFn: CategoryFlowApi.updateCategory,
    onSuccess: invalidateCategories,
  })

  const deleteCategory = useMutation({
    mutationFn: CategoryFlowApi.deleteCategory,
    onSuccess: invalidateCategories,
  })

  return { createCategory, updateCategory, deleteCategory }
}
