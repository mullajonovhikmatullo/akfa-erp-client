import { NavLink, useLocation } from 'react-router-dom'
import { Badge, Tooltip } from 'antd'
import { StarIcon } from '@phosphor-icons/react'
import clsx from 'clsx'
import { useT } from '@/shared/lib/i18n'
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
  const t = useT()
  const active = item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path)
  const Icon = SIDEBAR_ICONS[item.icon]
  const label = t(`nav.${item.key}`)
  const showBadge = Boolean(badgeCount && badgeCount > 0)

  const content = (
    <NavLink to={item.path} className={clsx('sb-item', active && 'sb-item--active')} onClick={onClick}>
      <span className="sb-item__icon">
        {Icon ? <Icon size={18} weight={active ? 'fill' : 'regular'} /> : null}
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
            aria-label={favorite ? 'Sevimlilardan olib tashlash' : "Sevimlilarga qo'shish"}
          >
            <StarIcon size={11} weight={favorite ? 'fill' : 'regular'} />
          </button>
        </>
      ) : null}
    </NavLink>
  )

  return collapsed ? (
    <Tooltip title={label} placement="right" mouseEnterDelay={0.15}>{content}</Tooltip>
  ) : content
}
