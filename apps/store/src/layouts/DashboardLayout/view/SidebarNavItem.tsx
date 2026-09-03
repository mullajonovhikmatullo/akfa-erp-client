import { NavLink, useLocation } from 'react-router-dom'
import { Badge, Tooltip } from 'antd'

import clsx from 'clsx'
import { useStoreT } from '@store/store-i18n'
import type { NavItemDef } from '../navConfig'
import { SIDEBAR_ICONS } from './sidebarIcons'

interface SidebarNavItemProps {
  item: NavItemDef
  collapsed: boolean
  favorite: boolean
  onToggleFavorite: (key: string) => void
  onClick?: () => void
  badgeCount?: number
}

export function SidebarNavItem({
  item,
  collapsed,
  favorite,
  onToggleFavorite,
  onClick,
  badgeCount,
}: SidebarNavItemProps) {
  //
  const location = useLocation()
  const t = useStoreT()
  const active = item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path)
  const iconName = SIDEBAR_ICONS[item.icon]
  const label = t(item.labelKey)
  const showBadge = Boolean(badgeCount && badgeCount > 0)

  const content = (
    <NavLink to={item.path} className={clsx('sb-item', active && 'sb-item--active')} onClick={onClick}>
      <span className="sb-item__icon">
        {iconName ? <i className={`icons-${iconName} icon-size-18`} /> : null}
      </span>
      {collapsed && showBadge ? (
        <Badge count={badgeCount} overflowCount={200} className="sb-item__badge sb-item__badge--collapsed" />
      ) : null}
      {!collapsed ? (
        <>
          <span className="sb-item__label">{label}</span>
          {showBadge ? <Badge count={badgeCount} overflowCount={200} className="sb-item__badge" /> : null}
          <button
            className={clsx('sb-item__star', favorite && 'sb-item__star--on')}
            type="button"
            tabIndex={-1}
            onClick={(event) => {
              //
              event.preventDefault()
              event.stopPropagation()
              onToggleFavorite(item.key)
            }}
            aria-label={favorite ? t('sidebar.removeFavorite') : t('sidebar.addFavorite')}
          >
            <i className="icons-favourite icon-size-11" />
          </button>
        </>
      ) : null}
    </NavLink>
  )

  return collapsed ? (
    <Tooltip title={label} placement="right" mouseEnterDelay={0.15}>{content}</Tooltip>
  ) : content
}
