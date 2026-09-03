import { CustomersList } from '@store/store-view/customer'
import { useBranchScope } from '@/shared/hooks/useBranchScope'

export function CustomersPage() {
  //
  const { can, isStoreOwner, scopedBranchId } = useBranchScope()

  return <CustomersList canManage={can('customers:create')} isStoreOwner={isStoreOwner} branchId={scopedBranchId} />
}
