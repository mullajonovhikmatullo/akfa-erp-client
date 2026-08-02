import { CustomersList } from '@store/store-view/customer'
import { useCurrentUser } from '@/entities/user'
import { useUIStore } from '@/app/stores/ui.store'
import { useT } from '@/shared/lib/i18n'

export function CustomersPage() {
  //
  const t = useT()
  const { can, isStoreOwner, branchId } = useCurrentUser()
  const activeBranchId = useUIStore((state) => state.activeBranchId)
  const scopedBranchId = isStoreOwner
    ? activeBranchId !== '__all__' ? activeBranchId : undefined
    : branchId ?? undefined

  return <CustomersList t={t} canManage={can('customers:create')} isStoreOwner={isStoreOwner} branchId={scopedBranchId} />
}
