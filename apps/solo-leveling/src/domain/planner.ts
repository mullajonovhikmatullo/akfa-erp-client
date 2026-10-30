import { EXERCISES, getExercise } from './exercises.ts'
import type {
  Equipment,
  Exercise,
  Goal,
  Limitation,
  MovementPattern,
  Plan,
  PlanAdjustment,
  Prescription,
  Profile,
  WorkoutIntensity,
  WorkoutTemplate,
} from './types.ts'

export const ALL_EQUIPMENT: Equipment[] = ['dumbbells', 'pullupBar', 'bands', 'bench', 'kettlebell', 'barbell', 'machines']

const MEDICAL_LIMITATIONS: Limitation[] = ['heart', 'pressure', 'pregnancy', 'recentSurgery', 'other']

export const MAX_PHASE = 6

export interface SafetyAssessment {
  mode: 'normal' | 'gentle'
  consultSpecialist: boolean
  allowed: boolean
  reasons: string[]
}

export const MIN_AGE = 13

export const assessSafety = (profile: Pick<Profile, 'age' | 'limitations'>): SafetyAssessment => {
  //
  const reasons: string[] = []
  let gentle = false
  let consult = false

  if (profile.age < MIN_AGE) {
    return {
      mode: 'gentle',
      consultSpecialist: true,
      allowed: false,
      reasons: [`Ilova ${MIN_AGE} yoshdan katta foydalanuvchilar uchun mo‘ljallangan. Mashg‘ulotni ota-ona va shifokor bilan rejalashtiring.`],
    }
  }
  if (profile.age < 16) {
    gentle = true
    reasons.push('16 yoshgacha og‘ir vaznlar o‘rniga o‘z vazni bilan texnikaga urg‘u beriladi.')
  }
  if (profile.age >= 65) {
    gentle = true
    consult = true
    reasons.push('65 yoshdan keyin yangi mashg‘ulotni shifokor bilan kelishib boshlash tavsiya etiladi.')
  }
  const medical = profile.limitations.filter((item) => MEDICAL_LIMITATIONS.includes(item))
  if (medical.length > 0) {
    gentle = true
    consult = true
    reasons.push('Ko‘rsatilgan salomatlik holati sabab reja yengil rejimda tuzildi. Yuklamani oshirishdan oldin mutaxassis bilan maslahatlashing.')
  }
  const joints = profile.limitations.filter((item) => !MEDICAL_LIMITATIONS.includes(item))
  if (joints.length > 0) {
    reasons.push('Jarohatlangan joyga yuk beruvchi mashqlar rejadan chiqarildi. Og‘riq sezsangiz, mashqni to‘xtating.')
  }

  return { mode: gentle ? 'gentle' : 'normal', consultSpecialist: consult, allowed: true, reasons }
}

export const availableEquipment = (profile: Pick<Profile, 'location' | 'equipment'>): Equipment[] =>
  profile.location === 'gym' ? ALL_EQUIPMENT : profile.equipment

const levelCap = (profile: Profile, mode: SafetyAssessment['mode']): number => {
  //
  if (mode === 'gentle') {
    return 1
  }
  if (profile.level === 'advanced') {
    return 3
  }
  if (profile.level === 'intermediate' || profile.experience === '1to3' || profile.experience === 'gt3') {
    return 2
  }
  return 1
}

export const isExerciseAllowed = (exercise: Exercise, profile: Profile, mode = assessSafety(profile).mode): boolean => {
  //
  const equipment = availableEquipment(profile)
  if (!exercise.equipment.every((item) => equipment.includes(item))) {
    return false
  }
  if (exercise.avoidWith.some((item) => profile.limitations.includes(item))) {
    return false
  }
  if (mode === 'gentle' && (exercise.impact || exercise.difficulty > 1)) {
    return false
  }
  return true
}

const pickForPattern = (pattern: MovementPattern, profile: Profile, mode: SafetyAssessment['mode'], used: Set<string>, variant: number) => {
  //
  const cap = levelCap(profile, mode)
  const candidates = EXERCISES.filter(
    (item) => item.pattern === pattern && !used.has(item.id) && item.difficulty <= cap && isExerciseAllowed(item, profile, mode),
  )
  if (candidates.length === 0) {
    return undefined
  }
  const prefersLoad = profile.goal === 'strength' || profile.goal === 'muscle'
  const ranked = [...candidates].sort((a, b) => {
    const score = (item: Exercise) =>
      item.difficulty * 10 +
      (prefersLoad && item.usesWeight ? 6 : 0) +
      item.equipment.length * 2 +
      (item.kind === 'reps' ? 1 : 0) +
      (item.easierId ? (mode === 'gentle' ? -2 : 2) : 0)
    return score(b) - score(a)
  })
  return ranked[Math.min(variant, ranked.length - 1)]
}

interface DayBlueprint {
  key: string
  title: string
  focus: string
  patterns: MovementPattern[]
}

const FULL_A: DayBlueprint = {
  key: 'full-a',
  title: 'Butun tana · A',
  focus: 'Oyoq, ko‘krak, orqa va qorin',
  patterns: ['squat', 'pushH', 'pullH', 'hinge', 'core', 'pushV', 'calves', 'arms'],
}
const FULL_B: DayBlueprint = {
  key: 'full-b',
  title: 'Butun tana · B',
  focus: 'Hamla, tortish, yelka va qorin',
  patterns: ['lunge', 'pullV', 'pushV', 'hinge', 'core', 'pushH', 'arms', 'calves'],
}
const FULL_C: DayBlueprint = {
  key: 'full-c',
  title: 'Butun tana · C',
  focus: 'Kuch va chidamlilik aralashmasi',
  patterns: ['squat', 'pullH', 'pushH', 'lunge', 'core', 'cardio', 'arms', 'calves'],
}
const UPPER: DayBlueprint = {
  key: 'upper',
  title: 'Yuqori tana',
  focus: 'Ko‘krak, orqa, yelka va qo‘llar',
  patterns: ['pushH', 'pullH', 'pushV', 'pullV', 'arms', 'core', 'arms'],
}
const LOWER: DayBlueprint = {
  key: 'lower',
  title: 'Pastki tana',
  focus: 'Son, dumba, boldir va qorin',
  patterns: ['squat', 'hinge', 'lunge', 'calves', 'core', 'cardio'],
}
const PUSH: DayBlueprint = {
  key: 'push',
  title: 'Itarish kuni',
  focus: 'Ko‘krak, yelka va triceps',
  patterns: ['pushH', 'pushV', 'pushH', 'arms', 'core', 'cardio'],
}
const PULL: DayBlueprint = {
  key: 'pull',
  title: 'Tortish kuni',
  focus: 'Orqa, biceps va bilak',
  patterns: ['pullV', 'pullH', 'pullH', 'arms', 'core', 'mobility'],
}
const LEGS: DayBlueprint = {
  key: 'legs',
  title: 'Oyoq kuni',
  focus: 'Son, dumba va boldir',
  patterns: ['squat', 'hinge', 'lunge', 'calves', 'core', 'cardio'],
}
const CONDITIONING: DayBlueprint = {
  key: 'conditioning',
  title: 'Chidamlilik sxemasi',
  focus: 'Yurak-qon tomir va butun tana',
  patterns: ['cardio', 'squat', 'pushH', 'cardio', 'core', 'lunge', 'mobility'],
}

const blueprintsFor = (days: number, goal: Goal): DayBlueprint[] => {
  //
  const endurance = goal === 'endurance' || goal === 'weight'
  if (days <= 2) {
    return [FULL_A, FULL_B]
  }
  if (days === 3) {
    return endurance ? [FULL_A, CONDITIONING, FULL_B] : [FULL_A, FULL_B, FULL_C]
  }
  if (days === 4) {
    return endurance ? [UPPER, LOWER, CONDITIONING, FULL_A] : [UPPER, LOWER, { ...UPPER, key: 'upper-2' }, { ...LOWER, key: 'lower-2' }]
  }
  if (days === 5) {
    return [PUSH, PULL, LEGS, endurance ? CONDITIONING : UPPER, LOWER]
  }
  return [PUSH, PULL, LEGS, { ...PUSH, key: 'push-2' }, { ...PULL, key: 'pull-2' }, { ...LEGS, key: 'legs-2' }]
}

export const TRAINING_DAY_PRESETS: Record<number, number[]> = {
  2: [0, 3],
  3: [0, 2, 4],
  4: [0, 1, 3, 4],
  5: [0, 1, 2, 4, 5],
  6: [0, 1, 2, 3, 4, 5],
}

const exerciseCountFor = (minutes: number): number => {
  //
  if (minutes <= 20) return 4
  if (minutes <= 30) return 5
  if (minutes <= 45) return 6
  return 7
}

interface Dose {
  sets: number
  reps: number
  seconds: number
  restSec: number
}

const baseDose = (goal: Goal, profile: Profile): Dose => {
  //
  const novice = profile.level === 'beginner'
  switch (goal) {
    case 'strength':
      return novice ? { sets: 3, reps: 8, seconds: 25, restSec: 90 } : { sets: 4, reps: 6, seconds: 30, restSec: 120 }
    case 'muscle':
      return { sets: 3, reps: 10, seconds: 30, restSec: 75 }
    case 'endurance':
      return { sets: novice ? 2 : 3, reps: 15, seconds: 40, restSec: 45 }
    case 'weight':
      return { sets: novice ? 2 : 3, reps: 12, seconds: 35, restSec: 45 }
    default:
      return { sets: novice ? 2 : 3, reps: 10, seconds: 30, restSec: 60 }
  }
}

export const prescribe = (exercise: Exercise, profile: Profile, phase: number, mode: SafetyAssessment['mode']): Prescription => {
  //
  const dose = baseDose(profile.goal, profile)
  const gentle = mode === 'gentle'
  const sets = Math.min(5, (gentle ? 2 : dose.sets) + (phase >= 3 && !gentle ? 1 : 0))
  const repsBase = gentle ? Math.min(dose.reps, 10) : dose.reps
  const reps = Math.min(repsBase + phase, repsBase + 6)
  const secondsBase = gentle ? 20 : dose.seconds
  const seconds = Math.min(secondsBase + phase * 5, 75)
  const restSec = gentle ? Math.max(dose.restSec, 75) : dose.restSec
  const isCardio = exercise.pattern === 'cardio' || exercise.pattern === 'mobility'
  return {
    exerciseId: exercise.id,
    sets: isCardio ? Math.max(2, sets - 1) : sets,
    reps: exercise.kind === 'reps' ? reps : null,
    seconds: exercise.kind === 'time' ? seconds : null,
    restSec: isCardio ? Math.min(restSec, 45) : restSec,
  }
}

export const estimateMinutes = (items: Prescription[]): number => {
  //
  const seconds = items.reduce((total, item) => {
    const work = item.seconds ?? (item.reps ?? 10) * 3.5
    return total + item.sets * work + Math.max(0, item.sets - 1) * item.restSec + 45
  }, 0)
  return Math.max(10, Math.round((seconds + 300) / 60))
}

const intensityFor = (mode: SafetyAssessment['mode'], phase: number, goal: Goal): WorkoutIntensity => {
  //
  if (mode === 'gentle') return 'light'
  if (phase >= 4 || goal === 'strength') return 'hard'
  return phase <= 0 ? 'light' : 'moderate'
}

export const buildWorkouts = (profile: Profile, phase: number, mode: SafetyAssessment['mode']): WorkoutTemplate[] => {
  //
  const count = exerciseCountFor(profile.minutesPerSession)
  return blueprintsFor(profile.daysPerWeek, profile.goal).map((blueprint, dayIndex) => {
    const used = new Set<string>()
    const items: Prescription[] = []
    const variant = blueprint.key.endsWith('-2') ? 1 : 0
    for (const pattern of blueprint.patterns) {
      if (items.length >= count) break
      const picked = pickForPattern(pattern, profile, mode, used, variant)
      if (!picked) continue
      used.add(picked.id)
      items.push(prescribe(picked, profile, phase, mode))
    }
    while (items.length > 1 && estimateMinutes(items) > profile.minutesPerSession + 5) {
      items.pop()
    }
    return {
      id: `${blueprint.key}-${dayIndex}`,
      title: blueprint.title,
      focus: blueprint.focus,
      items,
      estMinutes: estimateMinutes(items),
      intensity: intensityFor(mode, phase, profile.goal),
    }
  })
}

export const startingPhase = (profile: Profile): number => {
  //
  if (profile.level === 'advanced') return 2
  if (profile.level === 'intermediate') return 1
  return 0
}

export const buildPlan = (profile: Profile, now = new Date()): Plan => {
  //
  const safety = assessSafety(profile)
  const phase = safety.mode === 'gentle' ? 0 : startingPhase(profile)
  const days = Math.min(6, Math.max(2, profile.daysPerWeek))
  const adjustments: PlanAdjustment[] = [
    {
      date: now.toISOString(),
      kind: safety.mode === 'gentle' ? 'safety' : 'start',
      message:
        safety.mode === 'gentle'
          ? 'Reja ehtiyotkor (yengil) rejimda tuzildi: faqat sakrashsiz va past qiyinlikdagi mashqlar.'
          : 'Dastlabki reja maqsadingiz, tajribangiz va jihozlaringiz asosida tuzildi.',
    },
  ]
  return {
    createdAt: now.toISOString(),
    phase,
    safetyMode: safety.mode,
    trainingDays: TRAINING_DAY_PRESETS[days] ?? [0, 2, 4],
    workouts: buildWorkouts({ ...profile, daysPerWeek: days }, phase, safety.mode),
    cursor: 0,
    adjustments,
  }
}

export const rebuildPlan = (plan: Plan, profile: Profile, phase: number, adjustment: PlanAdjustment | null, forceGentle = false): Plan => {
  //
  const safety = assessSafety(profile)
  const mode = forceGentle ? 'gentle' : safety.mode
  const days = Math.min(6, Math.max(2, profile.daysPerWeek))
  const workouts = buildWorkouts({ ...profile, daysPerWeek: days }, phase, mode)
  return {
    ...plan,
    phase,
    safetyMode: mode,
    trainingDays: TRAINING_DAY_PRESETS[days] ?? plan.trainingDays,
    workouts,
    cursor: plan.cursor % Math.max(1, workouts.length),
    adjustments: adjustment ? [adjustment, ...plan.adjustments].slice(0, 30) : plan.adjustments,
  }
}

export const alternativesFor = (exerciseId: string, profile: Profile, mode: SafetyAssessment['mode']): Exercise[] => {
  //
  const current = getExercise(exerciseId)
  if (!current) return []
  const pool = EXERCISES.filter(
    (item) => item.id !== current.id && item.pattern === current.pattern && isExerciseAllowed(item, profile, mode),
  )
  return pool.sort((a, b) => a.difficulty - b.difficulty || a.equipment.length - b.equipment.length)
}

export const easierFor = (exerciseId: string, profile: Profile, mode: SafetyAssessment['mode']): Exercise | undefined => {
  //
  let cursor = getExercise(exerciseId)?.easierId
  while (cursor) {
    const candidate = getExercise(cursor)
    if (!candidate) return undefined
    if (isExerciseAllowed(candidate, profile, mode)) return candidate
    cursor = candidate.easierId
  }
  return undefined
}
