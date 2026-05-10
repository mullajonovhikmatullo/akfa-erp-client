import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import { useUIStore } from '@/app/stores/ui.store';
import { AppSidebar } from '@/widgets/app-sidebar';
import { AppHeader } from '@/widgets/app-header';

import { useSel } from '@/app/store.jsx';

export function DashboardLayout() {
  const sidebarCollapsed = useUIStore((s) => s.sidebarCollapsed);
  const mobileSidebarOpen = useUIStore((s) => s.mobileSidebarOpen);
  const closeMobileSidebar = useUIStore((s) => s.closeMobileSidebar);
  const branches = useSel((s: { branches: Array<{ id: string; name: string }> }) => s.branches);
  const location = useLocation();

  // Close mobile sidebar on route change
  useEffect(() => { closeMobileSidebar(); }, [location.pathname, closeMobileSidebar]);

  return (
    <div className={clsx('app-shell', sidebarCollapsed && 'app-shell--collapsed')}>
      {/* Mobile backdrop */}
      {mobileSidebarOpen && (
        <div className="mobile-backdrop" onClick={closeMobileSidebar} />
      )}

      <AppSidebar collapsed={sidebarCollapsed} mobileOpen={mobileSidebarOpen} />
      <div className="main">
        <AppHeader branches={branches} />
        <div className="page">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
