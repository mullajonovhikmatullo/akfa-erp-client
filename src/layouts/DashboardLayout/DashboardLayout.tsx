import { Outlet } from 'react-router-dom';
import clsx from 'clsx';
import { useUIStore } from '@/app/stores/ui.store';
import { AppSidebar } from '@/widgets/app-sidebar';
import { AppHeader } from '@/widgets/app-header';

// Branches come from the legacy store for now; will move to React Query when API is wired
import { useSel } from '@/app/store.jsx';

export function DashboardLayout() {
  const sidebarCollapsed = useUIStore((s) => s.sidebarCollapsed);
  const branches = useSel((s: { branches: Array<{ id: string; name: string }> }) => s.branches);

  return (
    <div className={clsx('app-shell', sidebarCollapsed && 'app-shell--collapsed')}>
      <AppSidebar collapsed={sidebarCollapsed} />
      <div className="main">
        <AppHeader branches={branches} />
        <div className="page">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
