import { getExercise } from './exercises.ts'
import { MUSCLE_IDS } from './muscles.ts'
import type { ExerciseLog, MuscleId, Plan, SessionLog, WorkoutTemplate } from './types.ts'

const DAY_MS = 24 * 60 * 60 * 1000

export const dayKey = (date: Date): string => {
  //
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export const weekdayIndex = (date: Date): number => (date.getDay() + 6) % 7

export const startOfWeek = (date: Date): Date => {
  //
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  start.setDate(start.getDate() - weekdayIndex(start))
  return start
}

export const WEEKDAYS_SHORT = ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya']
export const WEEKDAYS_LONG = ['Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba', 'Yakshanba']
export const MONTHS = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr']

export const formatDate = (iso: string): string => {
  //
  const date = new Date(iso)
  return `${date.getDate()}-${MONTHS[date.getMonth()]?.toLowerCase() ?? ''}`
}

export const formatDuration = (seconds: number): string => {
  //
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `${minutes} daq`
  return `${Math.floor(minutes / 60)} soat ${minutes % 60} daq`
}

export const sessionXp = (exercises: ExerciseLog[]): number => {
  //
  const doneExercises = exercises.filter((item) => item.status !== 'skipped').length
  const doneSets = exercises.reduce((total, item) => total + item.sets.filter((set) => set.done).length, 0)
  return Math.min(250, 40 + doneExercises * 8 + doneSets * 2)
}

export const QUEST_XP = 15

export const xpForLevel = (level: number): number => 50 * (level - 1) * level

export interface LevelInfo {
  level: number
  rank: string
  rankTitle: string
  totalXp: number
  current: number
  needed: number
  progress: number
}

const RANKS: Array<{ min: number; rank: string; title: string }> = [
  { min: 50, rank: 'S', title: 'Afsonaviy ovchi' },
  { min: 35, rank: 'A', title: 'Elita ovchi' },
  { min: 20, rank: 'B', title: 'Tajribali ovchi' },
  { min: 10, rank: 'C', title: 'Mohir ovchi' },
  { min: 5, rank: 'D', title: 'O‘sayotgan ovchi' },
  { min: 1, rank: 'E', title: 'Yangi uyg‘ongan' },
]

export const levelInfo = (totalXp: number): LevelInfo => {
  //
  let level = 1
  while (totalXp >= xpForLevel(level + 1)) level += 1
  const base = xpForLevel(level)
  const next = xpForLevel(level + 1)
  const rank = RANKS.find((item) => level >= item.min) ?? RANKS[RANKS.length - 1]!
  return {
    level,
    rank: rank.rank,
    rankTitle: rank.title,
    totalXp,
    current: totalXp - base,
    needed: next - base,
    progress: (totalXp - base) / (next - base),
  }
}

export const totalXp = (sessions: SessionLog[], bonusXp: number): number =>
  sessions.reduce((total, item) => total + item.xp, 0) + bonusXp

export type TodayState =
  | { kind: 'done'; session: SessionLog; next: WorkoutTemplate | undefined }
  | { kind: 'train'; workout: WorkoutTemplate }
  | { kind: 'rest'; next: WorkoutTemplate | undefined; nextDay: number | null; reason: string }

export const nextTrainingDay = (plan: Plan, from: Date): number | null => {
  //
  const today = weekdayIndex(from)
  for (let offset = 1; offset <= 7; offset += 1) {
    const candidate = (today + offset) % 7
    if (plan.trainingDays.includes(candidate)) return candidate
  }
  return null
}

export const resolveToday = (plan: Plan, sessions: SessionLog[], now = new Date()): TodayState => {
  //
  const key = dayKey(now)
  const next = plan.workouts[plan.cursor % Math.max(1, plan.workouts.length)]
  const doneToday = sessions.find((item) => dayKey(new Date(item.finishedAt)) === key)
  if (doneToday) {
    return { kind: 'done', session: doneToday, next }
  }
  if (plan.trainingDays.includes(weekdayIndex(now)) && next) {
    return { kind: 'train', workout: next }
  }
  const yesterday = dayKey(new Date(now.getTime() - DAY_MS))
  const trainedYesterday = sessions.some((item) => dayKey(new Date(item.finishedAt)) === yesterday)
  const reason = trainedYesterday
    ? 'Kecha mashq qildingiz — mushaklar dam olish paytida tiklanadi va kuchayadi.'
    : 'Rejangizda bugun dam olish kuni. Muntazam dam olish jarohat xavfini kamaytiradi.'
  return { kind: 'rest', next, nextDay: nextTrainingDay(plan, now), reason }
}

export const weekActivity = (sessions: SessionLog[], now = new Date()): Array<{ day: number; date: Date; sessions: SessionLog[] }> => {
  //
  const start = startOfWeek(now)
  return Array.from({ length: 7 }, (_, day) => {
    const date = new Date(start.getTime())
    date.setDate(start.getDate() + day)
    const key = dayKey(date)
    return { day, date, sessions: sessions.filter((item) => dayKey(new Date(item.finishedAt)) === key) }
  })
}

export const weeklyCounts = (sessions: SessionLog[], weeks: number, now = new Date()) => {
  //
  const current = startOfWeek(now)
  return Array.from({ length: weeks }, (_, index) => {
    const start = new Date(current.getTime())
    start.setDate(current.getDate() - (weeks - 1 - index) * 7)
    const end = new Date(start.getTime())
    end.setDate(start.getDate() + 7)
    const inWeek = sessions.filter((item) => {
      const time = new Date(item.finishedAt).getTime()
      return time >= start.getTime() && time < end.getTime()
    })
    return {
      start,
      count: inWeek.length,
      minutes: Math.round(inWeek.reduce((total, item) => total + item.durationSec, 0) / 60),
    }
  })
}

export const consistencyWeeks = (sessions: SessionLog[], target: number, now = new Date()): number => {
  //
  const weeks = weeklyCounts(sessions, 52, now)
  const goal = Math.max(1, target)
  const current = weeks[weeks.length - 1]
  let streak = current && current.count >= goal ? 1 : 0
  for (let index = weeks.length - 2; index >= 0; index -= 1) {
    if ((weeks[index]?.count ?? 0) >= goal) streak += 1
    else break
  }
  return streak
}

export interface Totals {
  sessions: number
  minutes: number
  sets: number
  reps: number
  thisWeek: number
  thisMonth: number
  avgDifficulty: number | null
}

export const totals = (sessions: SessionLog[], now = new Date()): Totals => {
  //
  const weekStart = startOfWeek(now).getTime()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime()
  let sets = 0
  let reps = 0
  for (const session of sessions) {
    for (const exercise of session.exercises) {
      for (const set of exercise.sets) {
        if (!set.done) continue
        sets += 1
        reps += set.reps ?? 0
      }
    }
  }
  return {
    sessions: sessions.length,
    minutes: Math.round(sessions.reduce((total, item) => total + item.durationSec, 0) / 60),
    sets,
    reps,
    thisWeek: sessions.filter((item) => new Date(item.finishedAt).getTime() >= weekStart).length,
    thisMonth: sessions.filter((item) => new Date(item.finishedAt).getTime() >= monthStart).length,
    avgDifficulty:
      sessions.length === 0 ? null : sessions.reduce((total, item) => total + item.feedback.difficulty, 0) / sessions.length,
  }
}

export type MuscleLoad = Record<MuscleId, number>

export const emptyLoad = (): MuscleLoad =>
  Object.fromEntries(MUSCLE_IDS.map((id) => [id, 0])) as MuscleLoad

const normalize = (load: MuscleLoad): MuscleLoad => {
  //
  const max = Math.max(0, ...Object.values(load))
  if (max === 0) return load
  return Object.fromEntries(Object.entries(load).map(([id, value]) => [id, value / max])) as MuscleLoad
}

export const workoutLoad = (workout: WorkoutTemplate | undefined): MuscleLoad => {
  //
  const load = emptyLoad()
  if (!workout) return load
  for (const item of workout.items) {
    const exercise = getExercise(item.exerciseId)
    if (!exercise) continue
    for (const id of exercise.primary) load[id] += item.sets
    for (const id of exercise.secondary) load[id] += item.sets * 0.45
  }
  return normalize(load)
}

export const recentLoad = (sessions: SessionLog[], days: number, now = new Date()): MuscleLoad => {
  //
  const load = emptyLoad()
  const since = now.getTime() - days * DAY_MS
  for (const session of sessions) {
    if (new Date(session.finishedAt).getTime() < since) continue
    for (const log of session.exercises) {
      const exercise = getExercise(log.exerciseId)
      if (!exercise) continue
      const done = log.sets.filter((set) => set.done).length
      for (const id of exercise.primary) load[id] += done
      for (const id of exercise.secondary) load[id] += done * 0.45
    }
  }
  return normalize(load)
}

export const muscleHistory = (sessions: SessionLog[], muscle: MuscleId) =>
  sessions
    .map((session) => {
      const sets = session.exercises.reduce((total, log) => {
        const exercise = getExercise(log.exerciseId)
        if (!exercise || !(exercise.primary.includes(muscle) || exercise.secondary.includes(muscle))) return total
        return total + log.sets.filter((set) => set.done).length
      }, 0)
      return { session, sets }
    })
    .filter((item) => item.sets > 0)
    .sort((a, b) => b.session.finishedAt.localeCompare(a.session.finishedAt))

export interface ExerciseTrendPoint {
  date: string
  bestReps: number | null
  bestSeconds: number | null
  bestWeight: number | null
  volume: number
}

export const exerciseTrend = (sessions: SessionLog[], exerciseId: string): ExerciseTrendPoint[] =>
  [...sessions]
    .sort((a, b) => a.finishedAt.localeCompare(b.finishedAt))
    .flatMap((session) => {
      const logs = session.exercises.filter((log) => log.exerciseId === exerciseId)
      const sets = logs.flatMap((log) => log.sets.filter((set) => set.done))
      if (sets.length === 0) return []
      const best = (values: Array<number | null>) => {
        const valid = values.filter((value): value is number => value !== null)
        return valid.length > 0 ? Math.max(...valid) : null
      }
      return [
        {
          date: session.finishedAt,
          bestReps: best(sets.map((set) => set.reps)),
          bestSeconds: best(sets.map((set) => set.seconds)),
          bestWeight: best(sets.map((set) => set.weightKg)),
          volume: sets.reduce((total, set) => total + (set.reps ?? 0) * (set.weightKg ?? 1), 0),
        },
      ]
    })

export const loggedExerciseIds = (sessions: SessionLog[]): string[] => {
  //
  const counts = new Map<string, number>()
  for (const session of sessions) {
    for (const log of session.exercises) {
      if (log.sets.some((set) => set.done)) counts.set(log.exerciseId, (counts.get(log.exerciseId) ?? 0) + 1)
    }
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([id]) => id)
}

export interface QuestDef {
  id: string
  title: string
  hint: string
}

export const QUEST_POOL: QuestDef[] = [
  { id: 'walk', title: '15 daqiqa piyoda yuring', hint: 'Ochiq havoda bo‘lsa yanada yaxshi.' },
  { id: 'water', title: 'Kun davomida yetarli suv iching', hint: 'Chanqoqni kutmang — yoningizda suv tursin.' },
  { id: 'stretch', title: '5 daqiqa cho‘zilish', hint: 'Yelka, bel va son orqasiga e’tibor bering.' },
  { id: 'sleep', title: '7–9 soat uxlashni rejalashtiring', hint: 'Tiklanish uyqu paytida sodir bo‘ladi.' },
  { id: 'posture', title: 'Har soatda qaddingizni rostlang', hint: 'Yelkalarni orqaga, iyakni biroz ichkariga.' },
  { id: 'stairs', title: 'Lift o‘rniga zinadan foydalaning', hint: 'Kichik qadamlar — katta natija.' },
  { id: 'breath', title: '3 daqiqa chuqur nafas mashqi', hint: '4 soniya nafas oling, 6 soniya chiqaring.' },
  { id: 'protein', title: 'Har ovqatda oqsilli mahsulot qo‘shing', hint: 'Tuxum, go‘sht, dukkaklilar, qatiq.' },
  { id: 'screen', title: 'Uxlashdan 30 daqiqa oldin ekransiz', hint: 'Sifatli uyqu — kuchli ertangi kun.' },
]

export const questsFor = (date: Date): QuestDef[] => {
  //
  const seed = Math.floor(new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() / DAY_MS)
  const picked: QuestDef[] = []
  for (let step = 0; picked.length < 3; step += 1) {
    const quest = QUEST_POOL[(seed * 7 + step * 4) % QUEST_POOL.length]
    if (quest && !picked.includes(quest)) picked.push(quest)
  }
  return picked
}

export interface AchievementDef {
  id: string
  title: string
  description: string
  icon: string
  check: (context: { sessions: SessionLog[]; totals: Totals; level: number; consistency: number }) => boolean
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: 'first', title: 'Uyg‘onish', description: 'Birinchi mashg‘ulotni yakunlang', icon: 'spark', check: (c) => c.totals.sessions >= 1 },
  { id: 'five', title: 'Ritm topildi', description: '5 ta mashg‘ulot', icon: 'flame', check: (c) => c.totals.sessions >= 5 },
  { id: 'ten', title: 'Temir intizom', description: '10 ta mashg‘ulot', icon: 'shield', check: (c) => c.totals.sessions >= 10 },
  { id: 'twentyfive', title: 'Darvoza ochildi', description: '25 ta mashg‘ulot', icon: 'gate', check: (c) => c.totals.sessions >= 25 },
  { id: 'hour', title: 'Bir soat ter', description: 'Jami 60 daqiqa mashg‘ulot', icon: 'clock', check: (c) => c.totals.minutes >= 60 },
  { id: 'reps500', title: '500 takror', description: 'Jami 500 takrorlash', icon: 'bolt', check: (c) => c.totals.reps >= 500 },
  { id: 'reps2000', title: '2000 takror', description: 'Jami 2000 takrorlash', icon: 'bolt', check: (c) => c.totals.reps >= 2000 },
  { id: 'weeks2', title: 'Barqaror haftalar', description: '2 hafta ketma-ket haftalik maqsad', icon: 'calendar', check: (c) => c.consistency >= 2 },
  { id: 'weeks4', title: 'Bir oylik intizom', description: '4 hafta ketma-ket haftalik maqsad', icon: 'crown', check: (c) => c.consistency >= 4 },
  { id: 'level5', title: 'D-rang', description: '5-darajaga yeting', icon: 'star', check: (c) => c.level >= 5 },
  { id: 'level10', title: 'C-rang', description: '10-darajaga yeting', icon: 'star', check: (c) => c.level >= 10 },
  {
    id: 'honest',
    title: 'Tanani tinglovchi',
    description: 'Mashg‘ulot so‘ngida holatingizni halol qayd eting',
    icon: 'heart',
    check: (c) => c.sessions.some((item) => item.feedback.note.trim().length > 0 || item.feedback.discomfort !== 'none'),
  },
]

export const unlockedAchievements = (sessions: SessionLog[], bonusXp: number, target: number, now = new Date()): string[] => {
  //
  const context = {
    sessions,
    totals: totals(sessions, now),
    level: levelInfo(totalXp(sessions, bonusXp)).level,
    consistency: consistencyWeeks(sessions, target, now),
  }
  return ACHIEVEMENTS.filter((item) => item.check(context)).map((item) => item.id)
}
