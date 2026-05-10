import { NavLink, useLocation } from 'react-router-dom';
import * as icons from '@ant-design/icons';
import clsx from 'clsx';
import { useAuthStore } from '@/entities/user';
import { useUIStore } from '@/app/stores/ui.store';
import { getVisibleNavItems } from '../model/navConfig';
import type { Permission } from '@/shared/config/permissions';

const T: Record<string, string> = {
  'nav.dashboard': 'Dashboard',
  'nav.catalog': 'Catalog',
  'nav.products': 'Products',
  'nav.customers': 'Customers',
  'nav.operations': 'Operations',
  'nav.sales': 'Sales',
  'nav.purchases': 'Purchases',
  'nav.expenses': 'Expenses',
  'nav.transfers': 'Transfers',
  'nav.insights': 'Insights',
  'nav.analytics': 'Analytics',
  'nav.settings': 'Settings',
  'nav.admin': 'Administration',
  'nav.branches': 'Branches',
  'nav.admins': 'Admins',
  'nav.categories': 'Categories',
};

const t = (key: string) => T[key] ?? key;

interface AppSidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
}

export function AppSidebar({ collapsed, mobileOpen }: AppSidebarProps) {
  const can = useAuthStore((s) => s.can);
  const closeMobileSidebar = useUIStore((s) => s.closeMobileSidebar);
  const location = useLocation();
  const navGroups = getVisibleNavItems(can as (p: Permission) => boolean);

  return (
    <aside className={clsx('sidebar', collapsed && 'sidebar--collapsed', mobileOpen && 'sidebar--mobile-open')}>
      <div className="sidebar__brand">
        <span className="logo" />
        {!collapsed && (
          <span className="brand-name">
            AKFA <span className="brand-sub">ERP</span>
          </span>
        )}
      </div>

      <nav className="sidebar__nav">
        {navGroups.map((group, gi) => (
          <div key={gi} className="nav-group">
            {group.group && !collapsed && (
              <div className="nav-section">{t(group.group)}</div>
            )}
            {group.items.map((item) => {
              const Icon = (icons as unknown as Record<string, React.ComponentType>)[item.icon];
              const isActive =
                item.path === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(item.path);

              return (
                <NavLink
                  key={item.key}
                  to={item.path}
                  className={clsx('nav-item', isActive && 'active')}
                  title={collapsed ? t(item.labelKey) : undefined}
                  onClick={closeMobileSidebar}
                >
                  {Icon && <Icon />}
                  {!collapsed && <span>{t(item.labelKey)}</span>}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="sidebar__footer">
        {!collapsed && (
          <div className="version-tag">v1.0 · AKFA ERP</div>
        )}
      </div>
    </aside>
  );
}
