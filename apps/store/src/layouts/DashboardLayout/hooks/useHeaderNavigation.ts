import { useLocation } from 'react-router-dom'
import { useT } from '@/shared/lib/i18n'
import { ALL_NAV_ITEMS, NAV_GROUPS_DEF } from '../navConfig'

export function useHeaderNavigation() {
  //
  const location = useLocation()
  const t = useT()
  const currentNav = ALL_NAV_ITEMS.find((item) => {
    //
    return item.path === '/'
      ? location.pathname === '/'
      : location.pathname.startsWith(item.path)
  })
  const currentGroup = NAV_GROUPS_DEF.find((group) =>
    group.items.some((item) => item.key === currentNav?.key),
  )

  return {
    groupLabel: currentGroup ? t(currentGroup.groupLabelKey) : t('nav.group.main'),
    pageLabel: currentNav ? t(`nav.${currentNav.key}`) : t('nav.dashboard'),
  }
}
