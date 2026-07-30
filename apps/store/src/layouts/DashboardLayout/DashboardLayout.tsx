import { useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Alert } from 'antd';
import { ClockCountdown } from '@phosphor-icons/react';
import clsx from 'clsx';
import { useBranches } from '@store/store-view/branch';
import { useUIStore } from '@/app/stores/ui.store';
import { useAuthStore } from '@/entities/user';
import { AppHeader } from './AppHeader';
import { AppSidebar } from './AppSidebar';
import { useT } from '@/shared/lib/i18n';
import { ROUTES } from '@/shared/config/routes';

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
  const t = useT();
  const trialEndsAt = user?.store?.status === 'TRIALING'
    ? (user.store.subscription?.trialEndsAt ?? user.store.trialEndsAt)
    : null;
  const trialDaysLeft = trialEndsAt
    ? Math.max(0, Math.ceil((new Date(trialEndsAt).getTime() - Date.now()) / 86_400_000))
    : 0;

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
        {trialEndsAt ? (
          <div className={`trial-banner${trialDaysLeft <= 3 ? ' trial-banner--urgent' : ''}`} role="status">
            <div className="trial-banner__pulse"><ClockCountdown size={22} weight="duotone" /></div>
            <div className="trial-banner__copy">
              <strong>{t('trial.active')}</strong>
              <span>{t('trial.description')}</span>
            </div>
            <div className="trial-banner__remaining">
              <strong>{trialDaysLeft}</strong>
              <span>{t('trial.daysLeft')}</span>
            </div>
            {user?.role === 'store_owner' ? (
              <Link className="trial-banner__action" to={ROUTES.BILLING}>
                {t('trial.paymentAction')}
              </Link>
            ) : null}
          </div>
        ) : null}
        {user?.store?.status === 'PAST_DUE' ? (
          <Alert
            type="warning"
            showIcon
            banner
            message={t('billing.overdueTitle')}
            description={t('billing.overdueDescription')}
            action={user?.role === 'store_owner' ? (
              <Link className="billing-alert-action" to={ROUTES.BILLING}>
                {t('billing.payButton')}
              </Link>
            ) : undefined}
          />
        ) : null}
        <div className="page">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
