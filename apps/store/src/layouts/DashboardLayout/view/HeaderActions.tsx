import { Dropdown, Tooltip, type MenuProps } from 'antd'
import {
  CaretDownIcon,
  GlobeIcon,
  MoneyIcon,
  MoonIcon,
  SunIcon,
} from '@phosphor-icons/react'
import type { User } from '@store/store-stub'
import type { Lang } from '@/shared/lib/lang'
import { UserAvatar } from './UserAvatar'

interface HeaderActionsProps {
  currentLangLabel: string
  exchangeRate: number
  isDarkActive: boolean
  lang: Lang
  languageMenuItems: MenuProps['items']
  onToggleTheme: () => void
  profileMenuItems: MenuProps['items']
  t: (key: string) => string
  user: User | null
}

export function HeaderActions({
  currentLangLabel,
  exchangeRate,
  isDarkActive,
  lang,
  languageMenuItems,
  onToggleTheme,
  profileMenuItems,
  t,
  user,
}: HeaderActionsProps) {
  //
  return (
    <div className="topbar__actions">
      <span className="tagpill info topbar__exchange topbar-hide-mobile">
        <MoneyIcon size={13} weight="duotone" />
        1 USD = {exchangeRate.toLocaleString('ru-RU').replace(/,/g, ' ')} so&apos;m
      </span>

      <Dropdown
        menu={{ items: languageMenuItems, selectedKeys: [lang] }}
        trigger={['click']}
        placement="bottomRight"
        overlayClassName="topbar-language-menu"
      >
        <button type="button" className="sidebar-toggle topbar__language topbar-hide-mobile">
          <GlobeIcon size={16} />
          {currentLangLabel}
        </button>
      </Dropdown>

      <Tooltip title={isDarkActive ? t('settings.themeLight') : t('settings.themeDark')} placement="bottom">
        <button
          type="button"
          onClick={onToggleTheme}
          className="sidebar-toggle topbar__icon-button topbar-hide-mobile"
        >
          {isDarkActive ? <SunIcon size={20} /> : <MoonIcon size={20} />}
        </button>
      </Tooltip>

      <Dropdown
        menu={{ items: profileMenuItems }}
        trigger={['click']}
        placement="bottomRight"
        overlayClassName="profile-menu-popup"
        destroyOnHidden
      >
        <button className="profile-trigger topbar__profile" type="button">
          <UserAvatar name={user?.name} photo={user?.thumbnailPhoto} size={28} />
          <span className="profile-name">{user?.name?.split(' ')[0]}</span>
          <CaretDownIcon size={12} color="currentColor" />
        </button>
      </Dropdown>
    </div>
  )
}
