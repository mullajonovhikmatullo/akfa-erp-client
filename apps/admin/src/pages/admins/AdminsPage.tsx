import { AdminsList } from '@erp/store-buddy-view/admins'
import { useT } from '@/shared/lib/i18n'

export function AdminsPage() {
  //
  const t = useT()

  return <AdminsList t={t} />
}
