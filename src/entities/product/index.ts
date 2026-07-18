export { productApi } from './api/product.api';
export type { CreateProductPayload, UpdateProductPayload, ProductSummary } from './api/product.api';
export { categoryApi } from './api/category.api';
export type { CreateCategoryPayload, UpdateCategoryPayload, CategorySummary } from './api/category.api';
export {
  useProducts,
  useProductsPage,
  useProductSummary,
  useProductDetail,
  useProductInventory,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useCategories,
  useCategoriesPage,
  useCategorySummary,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  productKeys,
  categoryKeys,
} from './model/product.queries';
