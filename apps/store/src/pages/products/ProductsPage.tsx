import { ProductsList } from '@store/store-view/product'
import { ROUTES } from '@/shared/config/routes'
import { useBranchScope } from '@/shared/hooks/useBranchScope'
import { useOpenFromList } from '@/shared/hooks/useListReturn'

export function ProductsPage() {
  //
  const openFromList = useOpenFromList()
  const { can, isStoreOwner, userBranchId, activeBranchId } = useBranchScope()

  return (
    <ProductsList
      canManage={can('products:create')}
      isStoreOwner={isStoreOwner}
      userBranchId={userBranchId}
      activeBranchId={activeBranchId}
      onCreateProduct={() => openFromList(ROUTES.PRODUCT_NEW)}
      onEditProduct={(product) => openFromList(ROUTES.PRODUCT_EDIT.replace(':productId', product.id))}
    />
  )
}
