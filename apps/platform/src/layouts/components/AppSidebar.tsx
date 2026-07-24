import { useMemo, useState } from 'react';
import { CaretDown } from '@phosphor-icons/react';
import clsx from 'clsx';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { primaryNavigationItems, secondaryNavigationItems } from '../../config/navigation';
import { routes } from '../../config/routes';
import type { NavigationItem } from '../../shared/types';

const itemHasActiveChild = (item: NavigationItem, pathname: string) =>
  item.children?.some((child) => child.path === pathname) ?? false;

const implementedPaths = new Set([
  routes.dashboard,
  routes.companies,
  routes.companiesActive,
  routes.companiesBlocked,
  routes.subscriptionPayments,
  routes.subscriptionDebts,
]);

export const AppSidebar = () => {
  //
  const location = useLocation();
  const navigate = useNavigate();
  const defaultOpenGroups = useMemo(
    () =>
      primaryNavigationItems.filter((item) => ['companies', 'subscriptions'].includes(item.id)).map((item) => item.id),
    [],
  );
  const [openGroups, setOpenGroups] = useState<string[]>(defaultOpenGroups);

  const handleNavigate = (item: NavigationItem) => {
    //
    if (!item.path) {
      return;
    }

    navigate(item.path);

    if (!implementedPaths.has(item.path)) {
      toast.info('Bu bo‘lim keyingi bosqichda qo‘shiladi');
    }
  };

  const toggleGroup = (id: string) => {
    //
    setOpenGroups((current) =>
      current.includes(id) ? current.filter((groupId) => groupId !== id) : [...current, id],
    );
  };

  const renderNavItem = (item: NavigationItem) => {
    //
    const hasChildren = Boolean(item.children?.length);
    const Icon = item.icon;
    const active = item.path === location.pathname || itemHasActiveChild(item, location.pathname);
    const isOpen = openGroups.includes(item.id);

    if (hasChildren) {
      const groupButton = (
        <button
          className={clsx('sidebar-nav__item', 'sidebar-nav__item--group', active && 'is-active')}
          type="button"
          aria-expanded={isOpen}
          onClick={() => toggleGroup(item.id)}
        >
          <Icon size={20} weight="duotone" aria-hidden="true" />
          <span>{item.label}</span>
          <CaretDown
            className={clsx('sidebar-nav__chevron', isOpen && 'is-open')}
            size={14}
            weight="bold"
            aria-hidden="true"
          />
        </button>
      );

      return (
        <div className="sidebar-nav__group" key={item.id}>
          {groupButton}
          {isOpen ? (
            <div className="sidebar-nav__nested">
              {item.children?.map((child) => {
                //
                const childActive = child.path === location.pathname;
                return (
                  <button
                    className={clsx('sidebar-nav__subitem', childActive && 'is-active')}
                    key={child.id}
                    type="button"
                    onClick={() => handleNavigate(child)}
                  >
                    {child.label}
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>
      );
    }

    const navButton = (
      <button
        className={clsx('sidebar-nav__item', active && 'is-active')}
        key={item.id}
        type="button"
        onClick={() => handleNavigate(item)}
      >
        <Icon size={20} weight="duotone" aria-hidden="true" />
        <span>{item.label}</span>
      </button>
    );

    return navButton;
  };

  return (
    <aside className="app-sidebar">
      <nav className="sidebar-nav" aria-label="Asosiy navigatsiya">
        <div className="sidebar-nav__main">{primaryNavigationItems.map(renderNavItem)}</div>
        <div className="sidebar-nav__bottom">{secondaryNavigationItems.map(renderNavItem)}</div>
      </nav>
    </aside>
  );
};
