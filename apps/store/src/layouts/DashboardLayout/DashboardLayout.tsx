import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import { useBranchesList } from '@store/store-view/branch';
import { useUIStore } from '@/app/stores/ui.store';
import { useAuthStore } from '@/entities/user';
import { AppHeader } from './AppHeader';
import { AppSidebar } from './AppSidebar';
import { PastDueAlert, TrialBanner } from './view';

export function DashboardLayout() {
  //
  const user = useAuthStore((s) => s.user);
  const canManageBilling = useAuthStore((s) => s.can)('billing:manage');
  const sidebarCollapsed = useUIStore((s) => s.sidebarCollapsed);
  const mobileSidebarOpen = useUIStore((s) => s.mobileSidebarOpen);
  const closeMobileSidebar = useUIStore((s) => s.closeMobileSidebar);
  const activeBranchId = useUIStore((s) => s.activeBranchId);
  const setActiveBranch = useUIStore((s) => s.setActiveBranch);
  const { data: branches = [] } = useBranchesList();
  const location = useLocation();
  const trialEndsAt = user?.store?.status === 'TRIALING'
    ? (user.store.subscription?.trialEndsAt ?? user.store.trialEndsAt)
    : null;
  const trialDaysLeft = trialEndsAt
    ? Math.max(0, Math.ceil((new Date(trialEndsAt).getTime() - Date.now()) / 86_400_000))
    : 0;

  useEffect(() => {
    //
    closeMobileSidebar();
  }, [location.pathname, closeMobileSidebar]);

  useEffect(() => {
    //
    if (user?.role === 'store_owner') return;
    if (!user?.branchId) return;
    const hasUserBranch = branches.some((branch) => branch.id === user.branchId);
    if (hasUserBranch && activeBranchId !== user.branchId) {
      setActiveBranch(user.branchId);
    }
  }, [activeBranchId, branches, setActiveBranch, user?.branchId, user?.role]);

  return (
    <div className={clsx('app-shell', sidebarCollapsed && 'app-shell--collapsed')}>
      {mobileSidebarOpen && (
        <div className="mobile-backdrop" onClick={closeMobileSidebar} />
      )}

      <AppSidebar collapsed={sidebarCollapsed} mobileOpen={mobileSidebarOpen} />
      <div className="main">
        <AppHeader branches={branches} />
        {trialEndsAt ? (
          <TrialBanner daysLeft={trialDaysLeft} canManageBilling={canManageBilling} />
        ) : null}
        {user?.store?.status === 'PAST_DUE' ? (
          <PastDueAlert canManageBilling={canManageBilling} lifetime={user?.store?.plan?.billingType === 'LIFETIME'} />
        ) : null}
        <div className="page">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
