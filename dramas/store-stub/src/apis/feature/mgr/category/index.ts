import { http } from '@store/store-shared'
import type { ApiResponse } from '@store/store-shared'
import type {
  Category,
  CategoryPage,
  CategoryPageQuery,
  CategorySummary,
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from '../../../../models/domain/category'

const findCategories = (isActive?: boolean) =>
  http
    .get<ApiResponse<Category[]>>('/products/categories', {
      params: isActive !== undefined ? { isActive } : undefined,
    })
    .then((response) => response.data.data)

const findCategoriesPage = (params: CategoryPageQuery) =>
  http
    .get<ApiResponse<CategoryPage>>('/products/categories', {
      params,
    })
    .then((response) => response.data.data)

const findCategorySummary = () =>
  http.get<ApiResponse<CategorySummary>>('/products/categories/summary').then((response) => ({
    totalActive: Number(response.data.data.totalActive),
    totalInactive: Number(response.data.data.totalInactive),
  }))

const createCategory = (payload: CreateCategoryPayload) =>
  http.post<ApiResponse<Category>>('/products/categories', payload).then((response) => response.data.data)

const updateCategory = ({ id, payload }: { id: string; payload: UpdateCategoryPayload }) =>
  http.patch<ApiResponse<Category>>(`/products/categories/${id}`, payload).then((response) => response.data.data)

const deleteCategory = (id: string) => http.delete(`/products/categories/${id}`)

export const CategorySeekApi = {
  findCategories,
  findCategoriesPage,
  findCategorySummary,
  fetch: {
    findCategories: (isActive?: boolean) => ({
      queryKey: ['categories', 'findCategories', isActive] as const,
      queryFn: () => findCategories(isActive),
    }),
    findCategoriesPage: (params: CategoryPageQuery) => ({
      queryKey: ['categories', 'findCategories', 'paginated', params.page, params.pageSize, params.isActive] as const,
      queryFn: () => findCategoriesPage(params),
    }),
    findCategorySummary: () => ({
      queryKey: ['categories', 'summary'] as const,
      queryFn: findCategorySummary,
    }),
  },
}

export const CategoryFlowApi = {
  createCategory,
  updateCategory,
  deleteCategory,
}

export const categoryApi = {
  list: findCategories,
  listPaginated: findCategoriesPage,
  summary: findCategorySummary,
  create: createCategory,
  update: (id: string, payload: UpdateCategoryPayload) => updateCategory({ id, payload }),
  remove: deleteCategory,
}
