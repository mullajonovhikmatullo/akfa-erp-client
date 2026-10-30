import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { getExercise } from '@/domain/exercises.ts'
import { alternativesFor, assessSafety } from '@/domain/planner.ts'
import type { ExerciseLog, SessionFeedback } from '@/domain/types.ts'
import { useAppStore, type FinishResult } from '@/store/AppStore.tsx'
import { Button, IconButton, ProgressBar, Sheet, cx } from '@/components/ui.tsx'
import { ExerciseStep } from './view/ExerciseStep.tsx'
import { RestTimer } from './view/RestTimer.tsx'
import { FeedbackForm } from './view/FeedbackForm.tsx'
import { SessionResult } from './view/SessionResult.tsx'

export default function SessionPage() {
  //
  const { state, updateActive, cancelSession, finishSession } = useAppStore()
  const navigate = useNavigate()
  const [rest, setRest] = useState<{ seconds: number; key: number } | null>(null)
  const [swapOpen, setSwapOpen] = useState(false)
  const [confirmExit, setConfirmExit] = useState(false)
  const [phase, setPhase] = useState<'work' | 'feedback'>('work')
  const [result, setResult] = useState<FinishResult | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const active = state.active

  useEffect(() => {
    if (!active) return undefined
    const tick = () => setElapsed(Math.floor((Date.now() - new Date(active.startedAt).getTime()) / 1000))
    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [active])

  if (result) {
    return <SessionResult result={result} onDone={() => navigate('/', { replace: true })} />
  }
  if (!active || !state.profile) {
    return <Navigate to="/" replace />
  }

  const profile = state.profile
  const mode = state.plan?.safetyMode ?? assessSafety(profile).mode
  const current = active.exercises[active.index]
  const totalSets = active.exercises.reduce((total, item) => total + item.sets.length, 0)
  const doneSets = active.exercises.reduce((total, item) => total + item.sets.filter((set) => set.done).length, 0)

  const patchExercise = (index: number, next: ExerciseLog) => {
    updateActive({ ...active, exercises: active.exercises.map((item, position) => (position === index ? next : item)) })
  }

  const goTo = (index: number) => {
    setRest(null)
    updateActive({ ...active, index: Math.max(0, Math.min(active.exercises.length - 1, index)) })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const onSetDone = (setIndex: number) => {
    if (!current) return
    const sets = current.sets.map((set, position) => (position === setIndex ? { ...set, done: !set.done } : set))
    patchExercise(active.index, { ...current, sets })
    const justCompleted = !current.sets[setIndex]?.done
    const allDone = sets.every((set) => set.done)
    if (justCompleted && !allDone) setRest({ seconds: current.restSec, key: Date.now() })
    if (justCompleted && allDone && active.index < active.exercises.length - 1) setRest({ seconds: current.restSec, key: Date.now() })
  }

  const onSkip = () => {
    if (!current) return
    const skipped: ExerciseLog = { ...current, status: 'skipped', sets: current.sets.map((set) => ({ ...set, done: false })) }
    setRest(null)
    updateActive({
      ...active,
      index: Math.min(active.index + 1, active.exercises.length - 1),
      exercises: active.exercises.map((item, position) => (position === active.index ? skipped : item)),
    })
  }

  const onSwap = (exerciseId: string) => {
    if (!current) return
    const next = getExercise(exerciseId)
    const reference = current.sets[0]
    const reps = reference?.reps ?? 10
    const seconds = reference?.seconds ?? 30
    patchExercise(active.index, {
      ...current,
      exerciseId,
      status: 'partial',
      sets: current.sets.map(() => ({
        reps: next?.kind === 'time' ? null : reference?.reps ?? Math.round(seconds / 3),
        seconds: next?.kind === 'time' ? reference?.seconds ?? reps * 3 : null,
        weightKg: null,
        done: false,
      })),
    })
    setSwapOpen(false)
  }

  const onFinish = (feedback: SessionFeedback) => {
    const outcome = finishSession(feedback)
    if (outcome) setResult(outcome)
  }

  if (phase === 'feedback') {
    return <FeedbackForm doneSets={doneSets} totalSets={totalSets} elapsed={elapsed} onBack={() => setPhase('work')} onSubmit={onFinish} />
  }

  const exercise = current ? getExercise(current.exerciseId) : undefined
  const alternatives = current ? alternativesFor(current.exerciseId, profile, mode) : []
  const isLast = active.index === active.exercises.length - 1
  const minutes = String(Math.floor(elapsed / 60)).padStart(2, '0')
  const seconds = String(elapsed % 60).padStart(2, '0')

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col px-4 pt-4 pb-32 sm:px-6">
      <header className="flex items-center gap-2">
        <IconButton icon="x" label="Mashg‘ulotdan chiqish" onClick={() => setConfirmExit(true)} />
        <div className="min-w-0 flex-1 text-center">
          <div className="truncate text-sm font-semibold">{active.title}</div>
          <div className="font-display text-xs text-mist tabular-nums" aria-label={`O‘tgan vaqt ${minutes} daqiqa ${seconds} soniya`}>
            {minutes}:{seconds}
          </div>
        </div>
        <span className="w-11 text-right text-xs font-semibold text-mist">
          {active.index + 1}/{active.exercises.length}
        </span>
      </header>
      <ProgressBar value={totalSets === 0 ? 0 : doneSets / totalSets} label="Bajarilgan setlar" className="mt-3" />
      <nav aria-label="Mashqlar" className="mt-3 flex gap-1.5 overflow-x-auto pb-1">
        {active.exercises.map((item, position) => {
          const done = item.sets.every((set) => set.done)
          const skipped = item.status === 'skipped'
          return (
            <button
              key={`${item.plannedExerciseId}-${position}`}
              type="button"
              onClick={() => goTo(position)}
              aria-current={position === active.index ? 'step' : undefined}
              aria-label={`${position + 1}-mashq: ${getExercise(item.exerciseId)?.name ?? ''}${done ? ', bajarildi' : skipped ? ', o‘tkazib yuborildi' : ''}`}
              className={cx(
                'h-2 min-w-8 flex-1 rounded-full transition',
                position === active.index ? 'bg-volt-2' : done ? 'bg-volt/60' : skipped ? 'bg-blood/40' : 'bg-white/10',
              )}
            />
          )
        })}
      </nav>

      {current && exercise ? (
        <ExerciseStep
          key={`${active.index}-${current.exerciseId}`}
          log={current}
          exercise={exercise}
          onChange={(next) => patchExercise(active.index, next)}
          onSetDone={onSetDone}
        />
      ) : null}

      <div className="mt-5 grid grid-cols-2 gap-2">
        <Button variant="secondary" icon="swap" onClick={() => setSwapOpen(true)} disabled={alternatives.length === 0}>
          Almashtirish
        </Button>
        <Button variant="secondary" icon="skip" onClick={onSkip}>
          O‘tkazib yuborish
        </Button>
      </div>

      <div className="safe-bottom fixed inset-x-0 bottom-0 z-30 border-t border-line bg-ink/90 px-4 pt-3 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl gap-2">
          <Button variant="secondary" icon="chevronLeft" onClick={() => goTo(active.index - 1)} disabled={active.index === 0} aria-label="Oldingi mashq" />
          {isLast ? (
            <Button className="flex-1" size="lg" icon="check" onClick={() => setPhase('feedback')}>
              Mashg‘ulotni yakunlash
            </Button>
          ) : (
            <Button className="flex-1" size="lg" iconRight="chevronRight" onClick={() => goTo(active.index + 1)}>
              Keyingi mashq
            </Button>
          )}
        </div>
      </div>

      {rest ? (
        <RestTimer
          key={rest.key}
          seconds={rest.seconds}
          nextLabel={
            current && current.sets.every((set) => set.done)
              ? getExercise(active.exercises[active.index + 1]?.exerciseId ?? '')?.name
              : exercise?.name
          }
          onClose={() => {
            const finishedExercise = current?.sets.every((set) => set.done)
            setRest(null)
            if (finishedExercise && !isLast) goTo(active.index + 1)
          }}
        />
      ) : null}

      <Sheet open={swapOpen} onClose={() => setSwapOpen(false)} title="Mashqni almashtirish">
        <p className="mb-3 text-sm text-mist">Bir xil harakat turidagi, jihozlaringiz va cheklovlaringizga mos variantlar. Osonrog‘i yuqorida.</p>
        <ul className="space-y-2">
          {alternatives.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onSwap(item.id)}
                className="flex w-full items-center gap-3 rounded-2xl border border-line p-4 text-left transition hover:border-volt/50 hover:bg-white/[0.03]"
              >
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold">{item.name}</span>
                  <span className="block text-xs text-mist">{item.description}</span>
                </span>
                <span className="text-xs text-fog">{['', 'Oson', 'O‘rta', 'Murakkab'][item.difficulty]}</span>
              </button>
            </li>
          ))}
        </ul>
      </Sheet>

      <Sheet open={confirmExit} onClose={() => setConfirmExit(false)} title="Mashg‘ulotdan chiqasizmi?">
        <p className="text-sm text-mist">Jarayon saqlanadi — keyinroq bosh sahifadan davom ettirishingiz mumkin. Yoki mashg‘ulotni bekor qiling.</p>
        <div className="mt-5 grid gap-2">
          <Button onClick={() => navigate('/')}>Keyinroq davom ettirish</Button>
          {doneSets > 0 ? (
            <Button
              variant="secondary"
              onClick={() => {
                setConfirmExit(false)
                setPhase('feedback')
              }}
            >
              Hozir yakunlash va saqlash
            </Button>
          ) : null}
          <Button
            variant="danger"
            icon="trash"
            onClick={() => {
              cancelSession()
              navigate('/', { replace: true })
            }}
          >
            Bekor qilish (saqlanmaydi)
          </Button>
        </div>
      </Sheet>

      <span className="sr-only" aria-live="polite">
        {doneSets} / {totalSets} set bajarildi
      </span>
    </div>
  )
}
