import type { AppState } from '@/domain/types.ts'

const STORAGE_KEY = 'solo-leveling:v1'
export const STATE_VERSION = 1

export const initialState = (): AppState => ({
  version: STATE_VERSION,
  profile: null,
  plan: null,
  sessions: [],
  active: null,
  quests: { date: '', done: [] },
  bonusXp: 0,
  achievements: [],
  settings: { motion: 'system', prefer3D: true },
})

export const loadState = (): AppState => {
  //
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return initialState()
    const parsed = JSON.parse(raw) as Partial<AppState>
    if (parsed.version !== STATE_VERSION) return initialState()
    return { ...initialState(), ...parsed, settings: { ...initialState().settings, ...parsed.settings } }
  } catch {
    return initialState()
  }
}

export const saveState = (state: AppState): boolean => {
  //
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    return true
  } catch {
    return false
  }
}

export const clearState = () => {
  //
  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {}
}
