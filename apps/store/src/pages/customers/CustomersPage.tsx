import { CustomersList } from '@store/store-view/customer'
import { useBranchScope } from '@/shared/hooks/useBranchScope'
import { useT } from '@/shared/lib/i18n'

export function CustomersPage() {
  //
  const t = useT()
  const { can, isStoreOwner, scopedBranchId } = useBranchScope()

  return <CustomersList t={t} canManage={can('customers:create')} isStoreOwner={isStoreOwner} branchId={scopedBranchId} />
}
