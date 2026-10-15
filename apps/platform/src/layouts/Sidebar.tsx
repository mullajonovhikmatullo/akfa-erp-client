import { NavLink } from 'react-router-dom';
import { LogOut, Moon, Search, Sun } from 'lucide-react';
import { useUIStore } from '../app/stores/uiStore';
import { readPlatformUser } from '../shared/auth/session';
import { cn } from '../shared/lib/cn';
import { Button } from '../shared/ui/button';
import { Kbd } from '../shared/ui/display';
import { Logo } from '../shared/ui/logo';
import { usePlatformDashboardSummary } from '../features/overview/hooks/usePlatformDashboardSummary';
import { navItems } from './navigation';

export function BrandMark({ className, size = 22 }: { className?: string; size?: number }) {
  //
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Logo size={size} />
      <span className="rounded-md bg-surface-2 px-1.5 py-0.5 text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
        Platform
      </span>
    </div>
  );
}

export function ThemeToggle({ className }: { className?: string }) {
  //
  const theme = useUIStore((state) => state.theme);
  const toggleTheme = useUIStore((state) => state.toggleTheme);
  const label = theme === 'dark' ? 'Yorug‘ rejim' : 'To‘q rejim';
  return (
    <Button variant="ghost" size="icon" aria-label={label} title={label} onClick={toggleTheme} className={className}>
      {theme === 'dark' ? <Sun /> : <Moon />}
    </Button>
  );
}

interface SidebarProps {
  onOpenCommand: () => void;
  onNavigate?: () => void;
}

export function Sidebar({ onOpenCommand, onNavigate }: SidebarProps) {
  //
  const askSignOut = useUIStore((state) => state.setSignOutConfirmOpen);
  const user = readPlatformUser();
  const { data: summary } = usePlatformDashboardSummary();
  const badges: Record<string, number | undefined> = { '/payments': summary?.pendingPayments || undefined };

  return (
    <div className="flex h-full flex-col gap-4 px-3 py-4">
      <div className="flex items-center justify-between gap-2 pl-2">
        <BrandMark />
        <ThemeToggle />
      </div>

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

      <div className="mt-auto border-t border-border pt-3">
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
            onClick={() => askSignOut(true)}
            className="grid size-8 place-items-center rounded-md text-muted-foreground hover:bg-surface-2 hover:text-danger"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
