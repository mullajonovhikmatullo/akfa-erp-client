import type { PlatformUser } from './platform-user'

export const isPlatformOwner = (user: PlatformUser | null) =>
  user?.rawRole === 'PLATFORM_OWNER' || user?.role === 'platform_owner'
