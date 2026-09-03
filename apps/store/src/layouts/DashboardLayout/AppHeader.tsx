import { useNavigate } from 'react-router-dom'

import type { Branch } from '@store/store-stub'
import { queryClient } from '@/app/providers/query/queryClient'
import { useUIStore } from '@/app/stores/ui.store'
import { useAuthStore } from '@/entities/user'
import { ROUTES } from '@/shared/config/routes'
import { useStoreT } from '@store/store-i18n'
import { useHeaderBranchSelection } from './hooks/useHeaderBranchSelection'
import { useHeaderNavigation } from './hooks/useHeaderNavigation'
import { useHeaderTheme } from './hooks/useHeaderTheme'
import { createHeaderMenuItems, HeaderActions, HeaderBranchControl } from './view'

interface AppHeaderProps {
  branches: Branch[]
}

export function AppHeader({ branches }: AppHeaderProps) {
  //
  const navigate = useNavigate()
  const t = useStoreT()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const exchangeRate = useUIStore((state) => state.exchangeRate)
  const sidebarCollapsed = useUIStore((state) => state.sidebarCollapsed)
  const toggleSidebar = useUIStore((state) => state.toggleSidebar)
  const toggleMobileSidebar = useUIStore((state) => state.toggleMobileSidebar)
  const lang = useUIStore((state) => state.lang)
  const setLang = useUIStore((state) => state.setLang)
  const { groupLabel, pageLabel } = useHeaderNavigation()
  const { isDarkActive, toggleTheme } = useHeaderTheme()
  const {
    activeBranch,
    control,
    isStoreOwner,
    setActiveBranch,
    userBranch,
  } = useHeaderBranchSelection(branches)

  function toggleNavigation() {
    //
    if (window.innerWidth < 768) {
      toggleMobileSidebar()
      return
    }

    toggleSidebar()
  }

  async function handleLogout() {
    //
    await queryClient.cancelQueries()
    queryClient.clear()
    logout()
    navigate(ROUTES.LOGIN)
  }

  const { currentLangLabel, languageMenuItems, profileMenuItems } = createHeaderMenuItems({
    lang,
    onLanguageChange: setLang,
    onLogout: handleLogout,
    onOpenProfile: () => navigate(ROUTES.PROFILE),
    onOpenSettings: () => navigate(ROUTES.SETTINGS),
    t,
    user,
    userBranch,
  })

  return (
    <header className="topbar">
      <div className="topbar__inner">
        <button className="sidebar-toggle topbar-sidebar-toggle" onClick={toggleNavigation} type="button">
          {sidebarCollapsed ? <i className="icons-chevron-right icon-size-20" /> : <i className="icons-chevron-left icon-size-20" />}
        </button>

        <div className="topbar__page-context">
          <span className="topbar__section-label">{groupLabel}</span>
          <strong className="topbar__page-title">{pageLabel}</strong>
        </div>

        <div className="topbar__branch-control">
          <HeaderBranchControl
            activeBranch={activeBranch}
            branches={branches}
            control={control}
            isStoreOwner={isStoreOwner}
            onBranchChange={setActiveBranch}
            userBranch={userBranch}
          />
        </div>

        <div className="grow" />

        <HeaderActions
          currentLangLabel={currentLangLabel}
          exchangeRate={exchangeRate}
          isDarkActive={isDarkActive}
          lang={lang}
          languageMenuItems={languageMenuItems}
          onToggleTheme={toggleTheme}
          profileMenuItems={profileMenuItems}
          user={user}
        />
      </div>
    </header>
  )
}
