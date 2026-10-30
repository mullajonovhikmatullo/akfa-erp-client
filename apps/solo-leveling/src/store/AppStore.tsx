import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { adaptAfterSession } from '@/domain/adaptation.ts'
import { buildPlan, rebuildPlan } from '@/domain/planner.ts'
import { QUEST_XP, dayKey, levelInfo, sessionXp, totalXp, unlockedAchievements } from '@/domain/progress.ts'
import type {
  ActiveSession,
  AppState,
  PlanAdjustment,
  Profile,
  SessionFeedback,
  SessionLog,
  Settings,
  WorkoutTemplate,
} from '@/domain/types.ts'
import { clearState, initialState, loadState, saveState } from './storage.ts'

export interface FinishResult {
  session: SessionLog
  adjustment: PlanAdjustment
  levelBefore: number
  levelAfter: number
  newAchievements: string[]
}

interface AppStore {
  state: AppState
  persistError: boolean
  completeOnboarding: (profile: Profile) => void
  updateProfile: (profile: Profile) => void
  startSession: (workout: WorkoutTemplate) => void
  updateActive: (active: ActiveSession) => void
  cancelSession: () => void
  finishSession: (feedback: SessionFeedback) => FinishResult | null
  toggleQuest: (id: string) => void
  updateSettings: (patch: Partial<Settings>) => void
  deleteHealthData: () => void
  resetAll: () => void
}

const AppStoreContext = createContext<AppStore | null>(null)

const newId = () => (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`)

const targetDays = (state: AppState) => state.plan?.trainingDays.length ?? 3

export const AppStoreProvider = ({ children }: { children: ReactNode }) => {
  //
  const [state, setState] = useState<AppState>(loadState)
  const [persistError, setPersistError] = useState(false)
  const stateRef = useRef(state)
  stateRef.current = state

  useEffect(() => {
    setPersistError(!saveState(state))
  }, [state])

  const completeOnboarding = useCallback((profile: Profile) => {
    setState((current) => ({ ...current, profile, plan: buildPlan(profile), active: null }))
  }, [])

  const updateProfile = useCallback((profile: Profile) => {
    setState((current) => {
      if (!current.plan) return { ...current, profile, plan: buildPlan(profile) }
      const adjustment: PlanAdjustment = {
        date: new Date().toISOString(),
        kind: 'profile',
        message: 'Profil yangilandi — reja yangi ma’lumotlarga moslab qayta tuzildi.',
      }
      return { ...current, profile, plan: rebuildPlan(current.plan, profile, current.plan.phase, adjustment) }
    })
  }, [])

  const startSession = useCallback((workout: WorkoutTemplate) => {
    setState((current) => ({
      ...current,
      active: {
        workoutId: workout.id,
        title: workout.title,
        startedAt: new Date().toISOString(),
        index: 0,
        exercises: workout.items.map((item) => ({
          exerciseId: item.exerciseId,
          plannedExerciseId: item.exerciseId,
          status: 'partial' as const,
          restSec: item.restSec,
          sets: Array.from({ length: item.sets }, () => ({ reps: item.reps, seconds: item.seconds, weightKg: null, done: false })),
        })),
      },
    }))
  }, [])

  const updateActive = useCallback((active: ActiveSession) => {
    setState((current) => ({ ...current, active }))
  }, [])

  const cancelSession = useCallback(() => {
    setState((current) => ({ ...current, active: null }))
  }, [])

  const finishSession = useCallback((feedback: SessionFeedback): FinishResult | null => {
    const current = stateRef.current
    if (!current.active || !current.plan || !current.profile) return null
    const finishedAt = new Date()
    const exercises = current.active.exercises.map((log) => {
      const done = log.sets.filter((set) => set.done).length
      const status = done === 0 ? ('skipped' as const) : done === log.sets.length ? ('done' as const) : ('partial' as const)
      return { ...log, status }
    })
    const session: SessionLog = {
      id: newId(),
      workoutId: current.active.workoutId,
      title: current.active.title,
      startedAt: current.active.startedAt,
      finishedAt: finishedAt.toISOString(),
      durationSec: Math.max(60, Math.round((finishedAt.getTime() - new Date(current.active.startedAt).getTime()) / 1000)),
      exercises,
      feedback,
      xp: sessionXp(exercises),
    }
    const sessions = [session, ...current.sessions]
    const { plan, adjustment } = adaptAfterSession(current.plan, current.profile, sessions, finishedAt)
    const levelBefore = levelInfo(totalXp(current.sessions, current.bonusXp)).level
    const levelAfter = levelInfo(totalXp(sessions, current.bonusXp)).level
    const unlocked = unlockedAchievements(sessions, current.bonusXp, plan.trainingDays.length, finishedAt)
    const newAchievements = unlocked.filter((id) => !current.achievements.includes(id))
    const next: AppState = {
      ...current,
      sessions,
      plan,
      active: null,
      achievements: [...current.achievements, ...newAchievements],
    }
    stateRef.current = next
    setState(next)
    return { session, adjustment, levelBefore, levelAfter, newAchievements }
  }, [])

  const toggleQuest = useCallback((id: string) => {
    setState((current) => {
      const today = dayKey(new Date())
      const done = current.quests.date === today ? current.quests.done : []
      const isDone = done.includes(id)
      const bonusXp = Math.max(0, current.bonusXp + (isDone ? -QUEST_XP : QUEST_XP))
      const unlocked = unlockedAchievements(current.sessions, bonusXp, targetDays(current))
      return {
        ...current,
        bonusXp,
        quests: { date: today, done: isDone ? done.filter((item) => item !== id) : [...done, id] },
        achievements: [...new Set([...current.achievements, ...unlocked])],
      }
    })
  }, [])

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setState((current) => ({ ...current, settings: { ...current.settings, ...patch } }))
  }, [])

  const deleteHealthData = useCallback(() => {
    setState((current) => {
      if (!current.profile) return current
      const profile: Profile = {
        ...current.profile,
        heightCm: null,
        weightKg: null,
        limitations: [],
        limitationNote: '',
        updatedAt: new Date().toISOString(),
      }
      const sessions = current.sessions.map((item) => ({ ...item, feedback: { ...item.feedback, discomfort: 'none' as const, note: '' } }))
      const adjustment: PlanAdjustment = {
        date: new Date().toISOString(),
        kind: 'profile',
        message: 'Sog‘liq ma’lumotlari o‘chirildi. Reja qayta tuzildi — ehtiyot bo‘ling va o‘zingizni kuzatib boring.',
      }
      const plan = current.plan ? rebuildPlan(current.plan, profile, current.plan.phase, adjustment) : buildPlan(profile)
      return { ...current, profile, sessions, plan }
    })
  }, [])

  const resetAll = useCallback(() => {
    clearState()
    setState(initialState())
  }, [])

  const value = useMemo<AppStore>(
    () => ({
      state,
      persistError,
      completeOnboarding,
      updateProfile,
      startSession,
      updateActive,
      cancelSession,
      finishSession,
      toggleQuest,
      updateSettings,
      deleteHealthData,
      resetAll,
    }),
    [state, persistError, completeOnboarding, updateProfile, startSession, updateActive, cancelSession, finishSession, toggleQuest, updateSettings, deleteHealthData, resetAll],
  )

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>
}

export const useAppStore = (): AppStore => {
  //
  const store = useContext(AppStoreContext)
  if (!store) throw new Error('useAppStore must be used inside AppStoreProvider')
  return store
}
