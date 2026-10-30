import { Suspense } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { levelInfo, totalXp } from '@/domain/progress.ts'
import { NAV_LABELS } from '@/i18n/uz.ts'
import { useAppStore } from '@/store/AppStore.tsx'
import { Icon, type IconName } from './Icon.tsx'
import { PageLoader } from './PageLoader.tsx'
import { ProgressBar, cx } from './ui.tsx'

const NAV: Array<{ to: string; label: string; icon: IconName }> = [
  { to: '/', label: NAV_LABELS.today, icon: 'home' },
  { to: '/workouts', label: NAV_LABELS.workouts, icon: 'dumbbell' },
  { to: '/progress', label: NAV_LABELS.progress, icon: 'chart' },
  { to: '/profile', label: NAV_LABELS.profile, icon: 'user' },
]

export const Logo = ({ className }: { className?: string }) => (
  <span className={cx('flex items-center gap-2.5', className)}>
    <svg viewBox="0 0 64 64" className="size-9" aria-hidden="true">
      <defs>
        <linearGradient id="logo-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#a855f7" />
          <stop offset="1" stopColor="#ef4444" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill="#12121a" stroke="rgb(255 255 255 / 0.08)" />
      <path d="M36 8 18 36h12l-4 20 20-30H34l2-18Z" fill="url(#logo-g)" />
    </svg>
    <span className="font-display text-[15px] leading-none font-extrabold tracking-[0.12em]">
      SOLO
      <span className="block text-[10px] font-medium tracking-[0.42em] text-volt-3">LEVELING</span>
    </span>
  </span>
)

export const AppLayout = () => {
  //
  const { state, persistError } = useAppStore()
  const location = useLocation()
  const info = levelInfo(totalXp(state.sessions, state.bonusXp))

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[1440px]">
      <a href="#main" className="sr-only z-50 rounded-xl bg-volt px-4 py-2 focus:not-sr-only focus:fixed focus:top-3 focus:left-3">
        Asosiy kontentga o‘tish
      </a>
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-line px-4 py-6 lg:flex xl:w-72">
        <Link to="/" className="px-2" aria-label="Bosh sahifa">
          <Logo />
        </Link>
        <nav aria-label="Asosiy navigatsiya" className="mt-10 flex flex-col gap-1">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                cx(
                  'group flex min-h-12 items-center gap-3 rounded-2xl px-4 text-[15px] font-medium transition',
                  isActive ? 'bg-volt/15 text-bone shadow-[inset_0_0_0_1px_rgb(139_92_246/0.35)]' : 'text-mist hover:bg-white/5 hover:text-bone',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon name={item.icon} className={isActive ? 'text-volt-3' : ''} />
                  {item.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto rounded-2xl border border-line bg-white/[0.02] p-4">
          <div className="flex items-center justify-between text-xs text-mist">
            <span>
              {info.rank}-rang · {info.level}-daraja
            </span>
            <span>
              {info.current}/{info.needed} XP
            </span>
          </div>
          <ProgressBar value={info.progress} label="Keyingi darajagacha" className="mt-2" />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {state.active && location.pathname !== '/session' ? (
          <Link
            to="/session"
            className="mx-4 mt-4 flex items-center justify-between gap-3 rounded-2xl border border-volt/40 bg-volt/12 px-4 py-3 text-sm lg:mx-8"
          >
            <span className="flex items-center gap-2">
              <span className="size-2 animate-pulse rounded-full bg-volt-2" aria-hidden="true" />
              Davom etayotgan mashg‘ulot: <b>{state.active.title}</b>
            </span>
            <Icon name="arrowRight" />
          </Link>
        ) : null}
        {persistError ? (
          <div role="alert" className="mx-4 mt-4 rounded-2xl border border-warn/30 bg-warn/10 px-4 py-3 text-sm text-warn lg:mx-8">
            Ma’lumotlarni qurilmaga saqlab bo‘lmadi (xususiy rejim yoki xotira to‘lgan bo‘lishi mumkin). Sahifani yopsangiz, o‘zgarishlar yo‘qolishi mumkin.
          </div>
        ) : null}
        <main id="main" className="flex-1 px-4 pt-5 pb-28 sm:px-6 lg:px-8 lg:pt-8 lg:pb-10">
          <Suspense fallback={<PageLoader />}>
            <div key={location.pathname} className="animate-rise">
              <Outlet />
            </div>
          </Suspense>
        </main>
      </div>

      <nav
        aria-label="Asosiy navigatsiya"
        className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-line bg-ink/85 px-2 pt-2 backdrop-blur-xl lg:hidden"
      >
        <ul className="mx-auto grid max-w-md grid-cols-4">
          {NAV.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  cx('flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl text-[11px] font-medium transition', isActive ? 'text-bone' : 'text-fog')
                }
              >
                {({ isActive }) => (
                  <>
                    <span className={cx('flex h-7 w-12 items-center justify-center rounded-full transition', isActive && 'bg-volt/20 text-volt-3')}>
                      <Icon name={item.icon} size={20} />
                    </span>
                    {item.label}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
