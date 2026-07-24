import { AdminsList } from '@store/store-view/admins'
import { useT } from '@/shared/lib/i18n'

export function AdminsPage() {
  //
  const t = useT()

  return <AdminsList t={t} />
}
