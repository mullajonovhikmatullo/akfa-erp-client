import { NavLink } from 'react-router-dom';
import { LogOut, Moon, Search, Sun } from 'lucide-react';
import { useUIStore } from '../app/stores/uiStore';
import { readPlatformUser } from '../shared/auth/session';
import { cn } from '../shared/lib/cn';
import { Kbd } from '../shared/ui/display';
import { usePlatformDashboardSummary } from '../features/overview/hooks/usePlatformDashboardSummary';
import { navItems } from './navigation';
import { useSignOut } from './useSignOut';

export function BrandMark({ className }: { className?: string }) {
  //
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <div className="grid size-7 place-items-center rounded-lg bg-foreground text-[13px] font-bold text-background">M</div>
      <div className="grid leading-tight">
        <span className="text-sm font-semibold tracking-tight">Mavion</span>
        <span className="text-[11px] text-muted-foreground">Platform</span>
      </div>
    </div>
  );
}

interface SidebarProps {
  onOpenCommand: () => void;
  onNavigate?: () => void;
}

export function Sidebar({ onOpenCommand, onNavigate }: SidebarProps) {
  //
  const theme = useUIStore((state) => state.theme);
  const toggleTheme = useUIStore((state) => state.toggleTheme);
  const signOut = useSignOut();
  const user = readPlatformUser();
  const { data: summary } = usePlatformDashboardSummary();
  const badges: Record<string, number | undefined> = { '/payments': summary?.pendingPayments || undefined };

  return (
    <div className="flex h-full flex-col gap-4 px-3 py-4">
      <BrandMark className="px-2" />

      <button
        type="button"
        onClick={onOpenCommand}
        className="flex h-9 items-center gap-2 rounded-lg border border-border bg-surface px-2.5 text-[13px] text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground"
      >
        <Search className="size-4" />
        <span className="flex-1 text-left">Qidirish…</span>
        <Kbd>⌘K</Kbd>
      </button>

      <nav className="grid gap-0.5">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'group flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-[13px] font-medium transition-colors',
                isActive ? 'bg-surface text-foreground shadow-sm ring-1 ring-border' : 'text-muted-foreground hover:bg-surface-2 hover:text-foreground',
              )
            }
          >
            <item.icon className="size-4" />
            <span className="flex-1">{item.label}</span>
            {badges[item.path] ? (
              <span className="tabular grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1.5 text-[11px] font-semibold text-primary-foreground">
                {badges[item.path]}
              </span>
            ) : null}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto grid gap-1 border-t border-border pt-3">
        <button
          type="button"
          onClick={toggleTheme}
          className="flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-[13px] text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
        >
          {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
          {theme === 'dark' ? 'Yorug‘ rejim' : 'To‘q rejim'}
        </button>
        <div className="flex items-center gap-2.5 rounded-lg px-2.5 py-2">
          <div className="grid size-8 place-items-center rounded-full bg-surface-2 text-xs font-semibold">
            {(user?.name ?? 'P').slice(0, 1).toUpperCase()}
          </div>
          <div className="grid min-w-0 flex-1 leading-tight">
            <span className="truncate text-[13px] font-medium">{user?.name ?? 'Platform owner'}</span>
            <span className="truncate text-xs text-muted-foreground">@{user?.username}</span>
          </div>
          <button
            type="button"
            aria-label="Chiqish"
            title="Chiqish"
            onClick={() => void signOut()}
            className="grid size-8 place-items-center rounded-md text-muted-foreground hover:bg-surface-2 hover:text-danger"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
