import { Dropdown, Tooltip, type MenuProps } from 'antd'

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
        <i className="icons-finance-money icon-size-13" />
        1 USD = {exchangeRate.toLocaleString('ru-RU').replace(/,/g, ' ')} so&apos;m
      </span>

      <Dropdown
        menu={{ items: languageMenuItems, selectedKeys: [lang] }}
        trigger={['click']}
        placement="bottomRight"
        overlayClassName="topbar-language-menu"
      >
        <button type="button" className="sidebar-toggle topbar__language topbar-hide-mobile">
          <i className="icons-globe icon-size-16" />
          {currentLangLabel}
        </button>
      </Dropdown>

      <Tooltip title={isDarkActive ? t('settings.themeLight') : t('settings.themeDark')} placement="bottom">
        <button
          type="button"
          onClick={onToggleTheme}
          className="sidebar-toggle topbar__icon-button topbar-hide-mobile"
        >
          {isDarkActive ? <i className="icons-sun icon-size-20" /> : <i className="icons-moon icon-size-20" />}
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
          <i className="icons-arrow-down icon-size-12" />
        </button>
      </Dropdown>
    </div>
  )
}
