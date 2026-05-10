export { productApi } from './api/product.api';
export type { CreateProductPayload, UpdateProductPayload } from './api/product.api';
export { categoryApi } from './api/category.api';
export type { CreateCategoryPayload, UpdateCategoryPayload } from './api/category.api';
export {
  useProducts,
  useProductDetail,
  useProductInventory,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  productKeys,
  categoryKeys,
} from './model/product.queries';
