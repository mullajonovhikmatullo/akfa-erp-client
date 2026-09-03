import { ProductsList } from '@store/store-view/product'
import { useBranchScope } from '@/shared/hooks/useBranchScope'

export function ProductsPage() {
  //
  const { can, isStoreOwner, userBranchId, activeBranchId } = useBranchScope()

  return <ProductsList canManage={can('products:create')} isStoreOwner={isStoreOwner} userBranchId={userBranchId} activeBranchId={activeBranchId} />
}
