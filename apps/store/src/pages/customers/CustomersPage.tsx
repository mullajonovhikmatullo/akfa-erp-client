import { CustomersList } from '@store/store-view/customer'
import { useCurrentUser } from '@/entities/user'
import { useT } from '@/shared/lib/i18n'

export function CustomersPage() {
  //
  const t = useT()
  const { can, isStoreOwner, branchId } = useCurrentUser()

  return <CustomersList t={t} canManage={can('customers:create')} isStoreOwner={isStoreOwner} branchId={branchId} />
}
