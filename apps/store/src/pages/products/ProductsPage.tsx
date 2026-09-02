import { ProductsList } from '@store/store-view/product'
import { useBranchScope } from '@/shared/hooks/useBranchScope'
import { useT } from '@/shared/lib/i18n'

export function ProductsPage() {
  //
  const t = useT()
  const { can, isStoreOwner, userBranchId, activeBranchId } = useBranchScope()

  return <ProductsList t={t} canManage={can('products:create')} isStoreOwner={isStoreOwner} userBranchId={userBranchId} activeBranchId={activeBranchId} />
}
