import { Suspense, lazy } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AppLayout } from '@/components/AppLayout.tsx'
import { PageLoader } from '@/components/PageLoader.tsx'
import { useMotionAttribute } from '@/lib/motion.ts'
import { useAppStore } from '@/store/AppStore.tsx'
import { TodayPage } from '@/pages/today/TodayPage.tsx'

const OnboardingPage = lazy(() => import('@/pages/onboarding/OnboardingPage.tsx'))
const WorkoutsPage = lazy(() => import('@/pages/workouts/WorkoutsPage.tsx'))
const SessionPage = lazy(() => import('@/pages/session/SessionPage.tsx'))
const ProgressPage = lazy(() => import('@/pages/progress/ProgressPage.tsx'))
const ProfilePage = lazy(() => import('@/pages/profile/ProfilePage.tsx'))

export const App = () => {
  //
  useMotionAttribute()
  const { state } = useAppStore()
  const location = useLocation()
  const onboarded = Boolean(state.profile && state.plan)

  if (!onboarded) {
    return (
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/welcome" element={<OnboardingPage />} />
          <Route path="*" element={<Navigate to="/welcome" replace />} />
        </Routes>
      </Suspense>
    )
  }

  return (
    <Routes location={location}>
      <Route
        path="/session"
        element={
          <Suspense fallback={<PageLoader />}>
            <SessionPage />
          </Suspense>
        }
      />
      <Route element={<AppLayout />}>
        <Route index element={<TodayPage />} />
        <Route path="/workouts" element={<WorkoutsPage />} />
        <Route path="/progress" element={<ProgressPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
