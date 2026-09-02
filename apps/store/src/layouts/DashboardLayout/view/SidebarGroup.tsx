
import clsx from 'clsx'
import { useT } from '@/shared/lib/i18n'
import type { NavGroupDef } from '../navConfig'
import { SidebarNavItem } from './SidebarNavItem'

interface SidebarGroupProps {
  group: NavGroupDef
  open: boolean
  collapsed: boolean
  favorites: string[]
  badgeCounts?: Record<string, number>
  onToggle: () => void
  onToggleFavorite: (key: string) => void
  onItemClick?: () => void
}

export function SidebarGroup({
  group,
  open,
  collapsed,
  favorites,
  badgeCounts,
  onToggle,
  onToggleFavorite,
  onItemClick,
}: SidebarGroupProps) {
  //
  const t = useT()

  if (collapsed) {
    return (
      <div className="sb-group sb-group--collapsed">
        <div className="sb-group__divider" />
        {group.items.map((item) => (
          <SidebarNavItem
            key={item.key}
            item={item}
            collapsed
            favorite={favorites.includes(item.key)}
            onToggleFavorite={onToggleFavorite}
            onClick={onItemClick}
            badgeCount={badgeCounts?.[item.key]}
          />
        ))}
      </div>
    )
  }

  return (
    <div className={clsx('sb-group', open && 'sb-group--open')}>
      <button className="sb-group__header" type="button" onClick={onToggle}>
        <span className="sb-group__label">{t(group.groupLabelKey)}</span>
        <i className={['icons-chevron-right icon-size-9', clsx('sb-group__chevron', open && 'sb-group__chevron--open')].filter(Boolean).join(' ')} />
      </button>
      <div className="sb-group__items">
        <div className="sb-group__items-inner">
          {group.items.map((item) => (
            <SidebarNavItem
              key={item.key}
              item={item}
              collapsed={false}
              favorite={favorites.includes(item.key)}
              onToggleFavorite={onToggleFavorite}
              onClick={onItemClick}
              badgeCount={badgeCounts?.[item.key]}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
