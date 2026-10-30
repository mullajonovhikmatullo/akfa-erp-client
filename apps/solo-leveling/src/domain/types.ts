export type Sex = 'male' | 'female'
export type FitnessLevel = 'beginner' | 'intermediate' | 'advanced'
export type Experience = 'none' | 'lt1' | '1to3' | 'gt3'
export type Goal = 'strength' | 'muscle' | 'endurance' | 'general' | 'weight'
export type TrainingLocation = 'home' | 'gym'
export type Equipment = 'dumbbells' | 'pullupBar' | 'bands' | 'bench' | 'kettlebell' | 'barbell' | 'machines'
export type Limitation =
  | 'knee'
  | 'back'
  | 'shoulder'
  | 'wrist'
  | 'heart'
  | 'pressure'
  | 'pregnancy'
  | 'recentSurgery'
  | 'other'

export type MuscleId =
  | 'chest'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'abs'
  | 'obliques'
  | 'quads'
  | 'hamstrings'
  | 'glutes'
  | 'calves'
  | 'traps'
  | 'upperBack'
  | 'lats'
  | 'lowerBack'

export type MovementPattern =
  | 'squat'
  | 'lunge'
  | 'hinge'
  | 'pushH'
  | 'pushV'
  | 'pullH'
  | 'pullV'
  | 'core'
  | 'arms'
  | 'calves'
  | 'cardio'
  | 'mobility'

export type DemoKind =
  | 'squat'
  | 'lunge'
  | 'hinge'
  | 'pushup'
  | 'press'
  | 'row'
  | 'pullup'
  | 'plank'
  | 'crunch'
  | 'curl'
  | 'calf'
  | 'cardio'
  | 'bridge'
  | 'stretch'

export interface Profile {
  name: string
  age: number
  sex: Sex
  heightCm: number | null
  weightKg: number | null
  level: FitnessLevel
  experience: Experience
  goal: Goal
  location: TrainingLocation
  equipment: Equipment[]
  daysPerWeek: number
  minutesPerSession: number
  limitations: Limitation[]
  limitationNote: string
  createdAt: string
  updatedAt: string
}

export interface Exercise {
  id: string
  name: string
  description: string
  pattern: MovementPattern
  primary: MuscleId[]
  secondary: MuscleId[]
  equipment: Equipment[]
  difficulty: 1 | 2 | 3
  kind: 'reps' | 'time'
  usesWeight: boolean
  impact: boolean
  avoidWith: Limitation[]
  easierId?: string
  technique: string[]
  demo: DemoKind
}

export interface Prescription {
  exerciseId: string
  sets: number
  reps: number | null
  seconds: number | null
  restSec: number
}

export type WorkoutIntensity = 'light' | 'moderate' | 'hard'

export interface WorkoutTemplate {
  id: string
  title: string
  focus: string
  items: Prescription[]
  estMinutes: number
  intensity: WorkoutIntensity
}

export type AdjustmentKind = 'start' | 'increase' | 'hold' | 'decrease' | 'safety' | 'return' | 'profile'

export interface PlanAdjustment {
  date: string
  kind: AdjustmentKind
  message: string
}

export interface Plan {
  createdAt: string
  phase: number
  safetyMode: 'normal' | 'gentle'
  trainingDays: number[]
  workouts: WorkoutTemplate[]
  cursor: number
  adjustments: PlanAdjustment[]
}

export interface SetLog {
  reps: number | null
  seconds: number | null
  weightKg: number | null
  done: boolean
}

export type ExerciseStatus = 'done' | 'partial' | 'skipped'

export interface ExerciseLog {
  exerciseId: string
  plannedExerciseId: string
  status: ExerciseStatus
  restSec: number
  sets: SetLog[]
}

export type Discomfort = 'none' | 'mild' | 'pain'

export interface SessionFeedback {
  difficulty: number
  fatigue: number
  discomfort: Discomfort
  note: string
}

export interface SessionLog {
  id: string
  workoutId: string
  title: string
  startedAt: string
  finishedAt: string
  durationSec: number
  exercises: ExerciseLog[]
  feedback: SessionFeedback
  xp: number
}

export interface ActiveSession {
  workoutId: string
  title: string
  startedAt: string
  index: number
  exercises: ExerciseLog[]
}

export interface Settings {
  motion: 'system' | 'reduce' | 'full'
  prefer3D: boolean
}

export interface QuestState {
  date: string
  done: string[]
}

export interface AppState {
  version: number
  profile: Profile | null
  plan: Plan | null
  sessions: SessionLog[]
  active: ActiveSession | null
  quests: QuestState
  bonusXp: number
  achievements: string[]
  settings: Settings
}
