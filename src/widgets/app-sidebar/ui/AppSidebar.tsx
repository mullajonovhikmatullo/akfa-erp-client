import { NavLink, useLocation } from 'react-router-dom';
import * as icons from '@ant-design/icons';
import clsx from 'clsx';
import { useAuthStore } from '@/entities/user';
import { getVisibleNavItems } from '../model/navConfig';
import type { Permission } from '@/shared/config/permissions';

// Inline translation map — replace with i18n hook when integrated
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
};

const t = (key: string) => T[key] ?? key;

export function AppSidebar({ collapsed }: { collapsed: boolean }) {
  const can = useAuthStore((s) => s.can);
  const location = useLocation();
  const navGroups = getVisibleNavItems(can as (p: Permission) => boolean);

  return (
    <aside className={clsx('sidebar', collapsed && 'sidebar--collapsed')}>
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
