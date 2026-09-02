import type { MenuProps } from 'antd'
import { GearIcon, SignOutIcon, UserCircleIcon } from '@phosphor-icons/react'
import type { Branch, User } from '@store/store-stub'
import type { Lang } from '@/shared/lib/lang'
import { LANGUAGE_OPTIONS } from '../headerConfig'
import { UserAvatar } from './UserAvatar'

interface HeaderMenuItemsOptions {
  lang: Lang
  onLanguageChange: (lang: Lang) => void
  onLogout: () => void
  onOpenProfile: () => void
  onOpenSettings: () => void
  t: (key: string) => string
  user: User | null
  userBranch?: Branch
}

export function createHeaderMenuItems({
  lang,
  onLanguageChange,
  onLogout,
  onOpenProfile,
  onOpenSettings,
  t,
  user,
  userBranch,
}: HeaderMenuItemsOptions) {
  //
  const languageMenuItems: MenuProps['items'] = LANGUAGE_OPTIONS.map((option) => ({
    key: option.value,
    label: option.label,
    onClick: () => onLanguageChange(option.value),
  }))
  const userRoleLabel = user?.role ? t(`role.${user.role}`) : ''
  const profileMenuItems: MenuProps['items'] = [
    {
      key: 'header',
      type: 'group',
      label: (
        <div className="profile-menu__summary">
          <UserAvatar name={user?.name} photo={user?.thumbnailPhoto} size={40} />
          <div className="profile-menu__identity">
            <div className="profile-menu__name">{user?.name}</div>
            <div className="profile-menu__meta">
              <span className="profile-menu__role">{userRoleLabel}</span>
              <span className="profile-menu__branch">
                {userBranch?.name?.split(' — ')[0] ?? t('header.allBranches')}
              </span>
            </div>
          </div>
        </div>
      ),
    },
    { type: 'divider' },
    {
      key: 'profile',
      icon: <UserCircleIcon size={18} />,
      label: t('header.profile'),
      onClick: onOpenProfile,
    },
    {
      key: 'settings',
      icon: <GearIcon size={18} />,
      label: t('header.settings'),
      onClick: onOpenSettings,
    },
    {
      key: 'logout',
      icon: <SignOutIcon size={18} />,
      label: <span style={{ color: 'var(--danger)' }}>{t('header.logout')}</span>,
      onClick: onLogout,
    },
  ]
  const currentLangLabel = LANGUAGE_OPTIONS.find((option) => option.value === lang)?.label ?? 'UZ'

  return { currentLangLabel, languageMenuItems, profileMenuItems }
}
