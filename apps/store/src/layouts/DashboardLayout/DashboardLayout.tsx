import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import { useBranches } from '@store/store-view/branch';
import { useUIStore } from '@/app/stores/ui.store';
import { useAuthStore } from '@/entities/user';
import { AppHeader } from './AppHeader';
import { AppSidebar } from './AppSidebar';

export function DashboardLayout() {
  //
  const user = useAuthStore((s) => s.user);
  const sidebarCollapsed = useUIStore((s) => s.sidebarCollapsed);
  const mobileSidebarOpen = useUIStore((s) => s.mobileSidebarOpen);
  const closeMobileSidebar = useUIStore((s) => s.closeMobileSidebar);
  const activeBranchId = useUIStore((s) => s.activeBranchId);
  const setActiveBranch = useUIStore((s) => s.setActiveBranch);
  const { data: branches = [] } = useBranches();
  const location = useLocation();

  // Close mobile sidebar on route change
  useEffect(() => {
    //
     closeMobileSidebar(); }, [location.pathname, closeMobileSidebar]);

  useEffect(() => {
    //
    if (!user?.branchId) return;
    const hasUserBranch = branches.some((branch) => branch.id === user.branchId);
    if (hasUserBranch && activeBranchId !== user.branchId) {
      setActiveBranch(user.branchId);
    }
  }, [activeBranchId, branches, setActiveBranch, user?.branchId]);

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
