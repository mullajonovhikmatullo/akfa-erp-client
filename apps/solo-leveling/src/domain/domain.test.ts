import { test } from 'node:test'
import assert from 'node:assert/strict'
import { EXERCISES, getExercise } from './exercises.ts'
import { assessSafety, buildPlan, isExerciseAllowed } from './planner.ts'
import { adaptAfterSession } from './adaptation.ts'
import { levelInfo, questsFor, resolveToday } from './progress.ts'
import type { Profile, SessionFeedback, SessionLog } from './types.ts'

const profile = (patch: Partial<Profile> = {}): Profile => ({
  name: 'Test',
  age: 25,
  sex: 'male',
  heightCm: null,
  weightKg: null,
  level: 'beginner',
  experience: 'none',
  goal: 'general',
  location: 'home',
  equipment: [],
  daysPerWeek: 3,
  minutesPerSession: 30,
  limitations: [],
  limitationNote: '',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  ...patch,
})

const session = (feedback: Partial<SessionFeedback>, finishedAt: string, ratio = 1): SessionLog => ({
  id: finishedAt,
  workoutId: 'w',
  title: 'w',
  startedAt: finishedAt,
  finishedAt,
  durationSec: 1800,
  xp: 100,
  feedback: { difficulty: 3, fatigue: 3, discomfort: 'none', note: '', ...feedback },
  exercises: [
    {
      exerciseId: 'bodyweight-squat',
      plannedExerciseId: 'bodyweight-squat',
      status: 'done',
      restSec: 60,
      sets: Array.from({ length: 10 }, (_, index) => ({ reps: 10, seconds: null, weightKg: null, done: index < ratio * 10 })),
    },
  ],
})

test('every easier reference points to an existing exercise', () => {
  for (const item of EXERCISES) {
    if (item.easierId) assert.ok(getExercise(item.easierId), item.id)
  }
})

test('home beginner without equipment gets a full plan of bodyweight exercises', () => {
  const plan = buildPlan(profile())
  assert.equal(plan.workouts.length, 3)
  for (const workout of plan.workouts) {
    assert.ok(workout.items.length >= 3, workout.id)
    for (const item of workout.items) {
      const exercise = getExercise(item.exerciseId)!
      assert.deepEqual(exercise.equipment, [])
      assert.ok(exercise.difficulty <= 1)
    }
  }
})

test('every combination of days and goals produces non-empty workouts', () => {
  for (const days of [2, 3, 4, 5, 6]) {
    for (const goal of ['strength', 'muscle', 'endurance', 'general', 'weight'] as const) {
      for (const location of ['home', 'gym'] as const) {
        const plan = buildPlan(profile({ daysPerWeek: days, goal, location, minutesPerSession: 20 }))
        assert.equal(plan.trainingDays.length, days)
        for (const workout of plan.workouts) assert.ok(workout.items.length > 0, `${days} ${goal} ${location}`)
      }
    }
  }
})

test('medical limitations switch to gentle mode with a specialist recommendation', () => {
  const user = profile({ limitations: ['heart'], level: 'advanced', location: 'gym' })
  const safety = assessSafety(user)
  assert.equal(safety.mode, 'gentle')
  assert.equal(safety.consultSpecialist, true)
  const plan = buildPlan(user)
  for (const workout of plan.workouts) {
    for (const item of workout.items) {
      const exercise = getExercise(item.exerciseId)!
      assert.equal(exercise.impact, false)
      assert.equal(exercise.difficulty, 1)
    }
  }
})

test('children under the minimum age are not given a plan automatically', () => {
  assert.equal(assessSafety({ age: 11, limitations: [] }).allowed, false)
  assert.equal(assessSafety({ age: 70, limitations: [] }).mode, 'gentle')
})

test('joint limitations exclude contraindicated exercises', () => {
  const user = profile({ limitations: ['knee', 'wrist'], level: 'advanced', location: 'gym' })
  for (const item of EXERCISES) {
    if (item.avoidWith.includes('knee')) assert.equal(isExerciseAllowed(item, user), false, item.id)
  }
})

test('pain never increases load and switches to gentle mode', () => {
  const user = profile({ level: 'intermediate' })
  const plan = buildPlan(user)
  const sessions = [session({ discomfort: 'pain', difficulty: 1 }, '2026-02-03T10:00:00.000Z'), session({}, '2026-02-01T10:00:00.000Z')]
  const result = adaptAfterSession(plan, user, sessions)
  assert.equal(result.adjustment.kind, 'safety')
  assert.ok(result.plan.phase <= plan.phase)
  assert.equal(result.plan.safetyMode, 'gentle')
})

test('two easy complete sessions increase load', () => {
  const user = profile()
  const plan = buildPlan(user)
  const sessions = [session({ difficulty: 2 }, '2026-02-03T10:00:00.000Z'), session({ difficulty: 2 }, '2026-02-01T10:00:00.000Z')]
  const result = adaptAfterSession(plan, user, sessions)
  assert.equal(result.adjustment.kind, 'increase')
  assert.equal(result.plan.phase, plan.phase + 1)
  assert.equal(result.plan.cursor, 1)
})

test('low completion decreases load', () => {
  const user = profile({ level: 'advanced' })
  const plan = buildPlan(user)
  const result = adaptAfterSession(plan, user, [session({}, '2026-02-03T10:00:00.000Z', 0.3)])
  assert.equal(result.plan.phase, plan.phase - 1)
})

test('level curve and today resolution', () => {
  assert.equal(levelInfo(0).level, 1)
  assert.equal(levelInfo(100).level, 2)
  assert.equal(levelInfo(1000).level, 5)
  const plan = buildPlan(profile())
  const monday = new Date(2026, 1, 2, 9)
  assert.equal(resolveToday(plan, [], monday).kind, 'train')
  const sunday = new Date(2026, 1, 8, 9)
  assert.equal(resolveToday(plan, [], sunday).kind, 'rest')
  assert.equal(questsFor(monday).length, 3)
})
