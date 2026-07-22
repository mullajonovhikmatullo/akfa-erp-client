import { ProfilePanel } from '@erp/store-buddy-view/profile'
import { useAuthStore } from '@/entities/user'
import { useT } from '@/shared/lib/i18n'

export function ProfilePage() {
  //
  const t = useT()
  const user = useAuthStore((state) => state.user)
  const setUser = useAuthStore((state) => state.setUser)

  return <ProfilePanel t={t} user={user} onUserUpdated={setUser} />
}
