import { CustomersList } from '@erp/store-buddy-view/customer'
import { useCurrentUser } from '@/entities/user'
import { useT } from '@/shared/lib/i18n'

export function CustomersPage() {
  //
  const t = useT()
  const { can, isSuper, branchId } = useCurrentUser()

  return <CustomersList t={t} canManage={can('customers:create')} isSuper={isSuper} branchId={branchId} />
}
