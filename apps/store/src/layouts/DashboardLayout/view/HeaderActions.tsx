import { StoreIcon } from '@store/store-shared/ui/store-icon'
import { Dropdown, Tooltip, type MenuProps } from 'antd'

import { useStoreT, type StoreLocale } from '@store/store-i18n'
import type { ExchangeRate, User } from '@store/store-stub'
import { UserAvatar } from './UserAvatar'

interface HeaderActionsProps {
  currentLangLabel: string
  exchangeRate?: ExchangeRate
  onOpenExchangeRate: () => void
  isDarkActive: boolean
  lang: StoreLocale
  languageMenuItems: MenuProps['items']
  onToggleTheme: () => void
  profileMenuItems: MenuProps['items']
  user: User | null
}

export function HeaderActions({
  currentLangLabel,
  exchangeRate,
  onOpenExchangeRate,
  isDarkActive,
  lang,
  languageMenuItems,
  onToggleTheme,
  profileMenuItems,
  user,
}: HeaderActionsProps) {
  //
  const t = useStoreT()

  return (
    <div className="topbar__actions">
      <Tooltip title={t('exchangeRate.change')} placement="bottom">
        <button type="button" className="tagpill info topbar__exchange topbar-hide-mobile" onClick={onOpenExchangeRate}>
          <StoreIcon name="finance-money" size={16} />
          {exchangeRate?.usdToUzsRate
            ? t('header.exchangeRate', { rate: exchangeRate.usdToUzsRate.toLocaleString('ru-RU', { maximumFractionDigits: 2 }).replace(/\s/g, ' ') })
            : t('exchangeRate.unavailable')}
          {exchangeRate ? (
            <span className="u-text-muted u-fs-11">· {t(exchangeRate.mode === 'CBU' ? 'exchangeRate.sourceCbu' : 'exchangeRate.sourceManual')}</span>
          ) : null}
        </button>
      </Tooltip>

      <Dropdown
        menu={{ items: languageMenuItems, selectedKeys: [lang] }}
        trigger={['click']}
        placement="bottomRight"
        overlayClassName="topbar-language-menu"
      >
        <button type="button" className="sidebar-toggle topbar__language topbar-hide-mobile">
          <StoreIcon name="globe" size={16} />
          {currentLangLabel}
        </button>
      </Dropdown>

      <Tooltip title={isDarkActive ? t('settings.themeLight') : t('settings.themeDark')} placement="bottom">
        <button
          type="button"
          onClick={onToggleTheme}
          className="sidebar-toggle topbar__icon-button topbar-hide-mobile"
        >
          {isDarkActive ? <StoreIcon name="sun" size={18} /> : <StoreIcon name="moon" size={18} />}
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
          <StoreIcon name="arrow-down" size={14} />
        </button>
      </Dropdown>
    </div>
  )
}
