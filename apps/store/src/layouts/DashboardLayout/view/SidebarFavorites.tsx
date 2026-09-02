import { useMemo } from 'react'

import { useT } from '@/shared/lib/i18n'
import { ALL_NAV_ITEMS } from '../navConfig'
import { SidebarNavItem } from './SidebarNavItem'

interface SidebarFavoritesProps {
  favoriteKeys: string[]
  collapsed: boolean
  badgeCounts?: Record<string, number>
  onToggleFavorite: (key: string) => void
  onItemClick?: () => void
}

export function SidebarFavorites({
  favoriteKeys,
  collapsed,
  badgeCounts,
  onToggleFavorite,
  onItemClick,
}: SidebarFavoritesProps) {
  //
  const t = useT()
  const items = useMemo(
    () => ALL_NAV_ITEMS.filter((item) => favoriteKeys.includes(item.key)),
    [favoriteKeys],
  )

  if (items.length === 0) return null

  if (collapsed) {
    return (
      <div className="sb-group sb-group--collapsed">
        <div className="sb-group__divider" />
        {items.map((item) => (
          <SidebarNavItem
            key={item.key}
            item={item}
            collapsed
            favorite
            onToggleFavorite={onToggleFavorite}
            onClick={onItemClick}
            badgeCount={badgeCounts?.[item.key]}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="sb-fav-section">
      <div className="sb-fav-section__header">
        <i className="icons-pin icon-size-9 sb-fav-section__pin" />
        <span>{t('header.quickAccess')}</span>
      </div>
      <div className="sb-group__items-inner">
        {items.map((item) => (
          <SidebarNavItem
            key={item.key}
            item={item}
            collapsed={false}
            favorite
            onToggleFavorite={onToggleFavorite}
            onClick={onItemClick}
            badgeCount={badgeCounts?.[item.key]}
          />
        ))}
      </div>
      <div className="sb-fav-section__divider" />
    </div>
  )
}
