import { useCallback, useMemo, useState } from 'react'
import { ArrowLineLeftIcon, ArrowLineRightIcon } from '@phosphor-icons/react'
import clsx from 'clsx'
import { useTransfersList } from '@store/store-view/transfer'
import { MavionBrand } from '@store/store-view/auth'
import { useAuthStore } from '@/entities/user'
import { useUIStore } from '@/app/stores/ui.store'
import type { Permission } from '@/shared/config/permissions'
import { getVisibleNavGroups } from './navConfig'
import { SidebarFavorites, SidebarGroup } from './view'

interface AppSidebarProps {
  collapsed: boolean
  mobileOpen: boolean
}

export function AppSidebar({ collapsed, mobileOpen }: AppSidebarProps) {
  //
  const can = useAuthStore((state) => state.can)
  const closeMobileSidebar = useUIStore((state) => state.closeMobileSidebar)
  const favorites = useUIStore((state) => state.sidebarFavorites)
  const toggleFavorite = useUIStore((state) => state.toggleFavorite)
  const toggleSidebar = useUIStore((state) => state.toggleSidebar)
  const visibleGroups = useMemo(
    () => getVisibleNavGroups(can as (permission: Permission) => boolean),
    [can],
  )
  const canViewTransfers = can('transfers:view')
  const { data: pendingTransfers = [] } = useTransfersList(
    { status: 'PENDING', limit: 200 },
    { enabled: canViewTransfers },
  )
  const badgeCounts = useMemo(
    () => ({ transfers: pendingTransfers.length }),
    [pendingTransfers.length],
  )
  const [openGroupKeys, setOpenGroupKeys] = useState<Set<string>>(
    () => new Set(visibleGroups.map((group) => group.groupKey)),
  )

  const handleGroupToggle = useCallback((key: string) => {
    //
    setOpenGroupKeys((current) => {
      //
      const next = new Set(current)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }, [])

  return (
    <aside
      className={clsx(
        'sidebar sb-root',
        collapsed && 'sidebar--collapsed sb-root--collapsed',
        mobileOpen && 'sidebar--mobile-open',
      )}
    >
      <div className="sb-brand">
        <MavionBrand compact />
        <button
          className="sidebar-toggle sb-brand__toggle"
          onClick={toggleSidebar}
          type="button"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ArrowLineRightIcon size={16} /> : <ArrowLineLeftIcon size={16} />}
        </button>
      </div>

      <nav className="sb-nav">
        <SidebarFavorites
          favoriteKeys={favorites}
          collapsed={collapsed}
          onToggleFavorite={toggleFavorite}
          onItemClick={closeMobileSidebar}
          badgeCounts={badgeCounts}
        />
        {visibleGroups.map((group) => (
          <SidebarGroup
            key={group.groupKey}
            group={group}
            open={openGroupKeys.has(group.groupKey)}
            collapsed={collapsed}
            favorites={favorites}
            onToggle={() => handleGroupToggle(group.groupKey)}
            onToggleFavorite={toggleFavorite}
            onItemClick={closeMobileSidebar}
            badgeCounts={badgeCounts}
          />
        ))}
      </nav>

      <div className="sb-footer">
        {!collapsed ? <span className="sb-footer__version">v1.0 · Mavion</span> : null}
      </div>
    </aside>
  )
}
