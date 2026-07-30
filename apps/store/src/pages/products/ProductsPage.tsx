import { ProductsList } from '@store/store-view/product'
import { useUIStore } from '@/app/stores/ui.store'
import { useCurrentUser } from '@/entities/user'
import { useT } from '@/shared/lib/i18n'

export function ProductsPage() {
  //
  const t = useT()
  const { can, isStoreOwner, branchId } = useCurrentUser()
  const activeBranchId = useUIStore((state) => state.activeBranchId)

  return <ProductsList t={t} canManage={can('products:create')} isStoreOwner={isStoreOwner} userBranchId={branchId} activeBranchId={activeBranchId} />
}
