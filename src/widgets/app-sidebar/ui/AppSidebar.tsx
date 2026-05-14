import { useState, useRef, useMemo, useCallback } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Tooltip } from 'antd';
import {
  StarFilled,
  StarOutlined,
  RightOutlined,
  PushpinFilled,
} from '@ant-design/icons';
import * as icons from '@ant-design/icons';
import clsx from 'clsx';
import { useAuthStore } from '@/entities/user';
import { useUIStore } from '@/app/stores/ui.store';
import {
  getVisibleNavGroups,
  ALL_NAV_ITEMS,
  type NavGroupDef,
  type NavItemDef,
} from '../model/navConfig';
import type { Permission } from '@/shared/config/permissions';

interface AppSidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
}

// ─── Accordion item height animation hook ────────────────────────────────────
function useAccordionHeight(isOpen: boolean) {
  const [height, setHeight] = useState<number>(0);
  const roRef = useRef<ResizeObserver | null>(null);

  // Callback ref: re-runs whenever the element mounts or unmounts,
  // which includes the collapse→expand transition where useEffect(fn,[]) would miss it.
  const ref = useCallback((el: HTMLDivElement | null) => {
    roRef.current?.disconnect();
    roRef.current = null;
    if (!el) return;
    const measure = () => setHeight(el.scrollHeight);
    measure();
    roRef.current = new ResizeObserver(measure);
    roRef.current.observe(el);
  }, []);

  return { ref, style: { height: isOpen ? height : 0 } };
}

// ─── Single nav item ──────────────────────────────────────────────────────────
function NavItem({
  item,
  collapsed,
  isFav,
  onToggleFav,
  onClick,
}: {
  item: NavItemDef;
  collapsed: boolean;
  isFav: boolean;
  onToggleFav: (key: string) => void;
  onClick?: () => void;
}) {
  const location = useLocation();
  const isActive =
    item.path === '/'
      ? location.pathname === '/'
      : location.pathname.startsWith(item.path);

  const Icon = (icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[item.icon];

  const inner = (
    <NavLink
      to={item.path}
      className={clsx('sb-item', isActive && 'sb-item--active')}
      onClick={onClick}
    >
      <span className="sb-item__icon">
        {Icon && <Icon />}
      </span>
      {!collapsed && (
        <>
          <span className="sb-item__label">{item.label}</span>
          <button
            className={clsx('sb-item__star', isFav && 'sb-item__star--on')}
            type="button"
            tabIndex={-1}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleFav(item.key); }}
            aria-label={isFav ? 'Sevimlilardan olib tashlash' : 'Sevimlilarga qo\'shish'}
          >
            {isFav ? <StarFilled /> : <StarOutlined />}
          </button>
        </>
      )}
    </NavLink>
  );

  if (collapsed) {
    return (
      <Tooltip title={item.label} placement="right" mouseEnterDelay={0.15}>
        {inner}
      </Tooltip>
    );
  }

  return inner;
}

// ─── Accordion group ──────────────────────────────────────────────────────────
function AccordionGroup({
  group,
  isOpen,
  onToggle,
  collapsed,
  favorites,
  onToggleFav,
  onItemClick,
}: {
  group: NavGroupDef;
  isOpen: boolean;
  onToggle: () => void;
  collapsed: boolean;
  favorites: string[];
  onToggleFav: (key: string) => void;
  onItemClick?: () => void;
}) {
  const { ref, style } = useAccordionHeight(isOpen);

  if (collapsed) {
    return (
      <div className="sb-group sb-group--collapsed">
        <div className="sb-group__divider" />
        {group.items.map((item) => (
          <NavItem
            key={item.key}
            item={item}
            collapsed
            isFav={favorites.includes(item.key)}
            onToggleFav={onToggleFav}
            onClick={onItemClick}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={clsx('sb-group', isOpen && 'sb-group--open')}>
      <button className="sb-group__header" type="button" onClick={onToggle}>
        <span className="sb-group__label">{group.groupLabel}</span>
        <RightOutlined className={clsx('sb-group__chevron', isOpen && 'sb-group__chevron--open')} />
      </button>
      <div className="sb-group__items" style={style}>
        <div ref={ref} className="sb-group__items-inner">
          {group.items.map((item) => (
            <NavItem
              key={item.key}
              item={item}
              collapsed={false}
              isFav={favorites.includes(item.key)}
              onToggleFav={onToggleFav}
              onClick={onItemClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Favorites section ────────────────────────────────────────────────────────
function FavoritesSection({
  favKeys,
  collapsed,
  onToggleFav,
  onItemClick,
}: {
  favKeys: string[];
  collapsed: boolean;
  onToggleFav: (key: string) => void;
  onItemClick?: () => void;
}) {
  const favItems = useMemo(
    () => ALL_NAV_ITEMS.filter((item) => favKeys.includes(item.key)),
    [favKeys],
  );

  if (favItems.length === 0) return null;

  if (collapsed) {
    return (
      <div className="sb-group sb-group--collapsed">
        <div className="sb-group__divider" />
        {favItems.map((item) => (
          <NavItem
            key={item.key}
            item={item}
            collapsed
            isFav
            onToggleFav={onToggleFav}
            onClick={onItemClick}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="sb-fav-section">
      <div className="sb-fav-section__header">
        <PushpinFilled className="sb-fav-section__pin" />
        <span>ТЕЗКОР КИРИШ</span>
      </div>
      <div className="sb-group__items-inner">
        {favItems.map((item) => (
          <NavItem
            key={item.key}
            item={item}
            collapsed={false}
            isFav
            onToggleFav={onToggleFav}
            onClick={onItemClick}
          />
        ))}
      </div>
      <div className="sb-fav-section__divider" />
    </div>
  );
}

// ─── Main sidebar ─────────────────────────────────────────────────────────────
export function AppSidebar({ collapsed, mobileOpen }: AppSidebarProps) {
  const can = useAuthStore((s) => s.can);
  const closeMobileSidebar = useUIStore((s) => s.closeMobileSidebar);
  const favorites = useUIStore((s) => s.sidebarFavorites);
  const toggleFavorite = useUIStore((s) => s.toggleFavorite);

  const visibleGroups = useMemo(
    () => getVisibleNavGroups(can as (p: Permission) => boolean),
    [can],
  );

  // All groups open by default
  const [openGroupKeys, setOpenGroupKeys] = useState<Set<string>>(
    () => new Set(visibleGroups.map((g) => g.groupKey)),
  );

  const handleGroupToggle = useCallback((key: string) => {
    setOpenGroupKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  return (
    <aside
      className={clsx(
        'sidebar sb-root',
        collapsed && 'sidebar--collapsed sb-root--collapsed',
        mobileOpen && 'sidebar--mobile-open',
      )}
    >
      {/* Brand */}
      <div className="sb-brand">
        <span className="sb-logo" />
        {!collapsed && (
          <span className="sb-brand__name">
            AKFA <span className="sb-brand__sub">ERP</span>
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="sb-nav">
        <FavoritesSection
          favKeys={favorites}
          collapsed={collapsed}
          onToggleFav={toggleFavorite}
          onItemClick={closeMobileSidebar}
        />
        {visibleGroups.map((group) => (
          <AccordionGroup
            key={group.groupKey}
            group={group}
            isOpen={openGroupKeys.has(group.groupKey)}
            onToggle={() => handleGroupToggle(group.groupKey)}
            collapsed={collapsed}
            favorites={favorites}
            onToggleFav={toggleFavorite}
            onItemClick={closeMobileSidebar}
          />
        ))}
      </nav>

      {/* Footer */}
      <div className="sb-footer">
        {!collapsed && (
          <span className="sb-footer__version">v1.0 · AKFA ERP</span>
        )}
      </div>
    </aside>
  );
}
