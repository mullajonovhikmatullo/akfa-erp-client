import { ProfilePanel } from '@store/store-view/profile'
import { useAuthStore } from '@/entities/user'

export function ProfilePage() {
  //
  const user = useAuthStore((state) => state.user)
  const setUser = useAuthStore((state) => state.setUser)

  return <ProfilePanel user={user} onUserUpdated={setUser} />
}
