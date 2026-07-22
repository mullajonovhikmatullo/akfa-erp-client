import { ProductsList } from '@erp/store-buddy-view/product'
import { useUIStore } from '@/app/stores/ui.store'
import { useCurrentUser } from '@/entities/user'
import { useT } from '@/shared/lib/i18n'

export function ProductsPage() {
  //
  const t = useT()
  const { can, isSuper, branchId } = useCurrentUser()
  const activeBranchId = useUIStore((state) => state.activeBranchId)

  return <ProductsList t={t} canManage={can('products:create')} isSuper={isSuper} userBranchId={branchId} activeBranchId={activeBranchId} />
}
