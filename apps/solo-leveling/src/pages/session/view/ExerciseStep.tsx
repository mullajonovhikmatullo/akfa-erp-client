import { useEffect, useMemo, useRef, useState } from 'react'
import { MUSCLES } from '@/domain/muscles.ts'
import { exerciseTrend } from '@/domain/progress.ts'
import type { Exercise, ExerciseLog } from '@/domain/types.ts'
import { ExerciseDemo } from '@/components/ExerciseDemo.tsx'
import { Icon } from '@/components/Icon.tsx'
import { Badge, NumberStepper, cx } from '@/components/ui.tsx'
import { useAppStore } from '@/store/AppStore.tsx'

const SetTimer = ({ seconds, onComplete }: { seconds: number; onComplete: () => void }) => {
  //
  const [left, setLeft] = useState<number | null>(null)
  const completeRef = useRef(onComplete)
  completeRef.current = onComplete

  useEffect(() => {
    if (left === null) return undefined
    if (left <= 0) {
      setLeft(null)
      if ('vibrate' in navigator) navigator.vibrate?.(200)
      completeRef.current()
      return undefined
    }
    const id = window.setTimeout(() => setLeft(left - 1), 1000)
    return () => window.clearTimeout(id)
  }, [left])

  return (
    <button
      type="button"
      onClick={() => setLeft(left === null ? seconds : null)}
      className={cx(
        'flex min-h-10 items-center gap-1.5 rounded-xl px-3 text-xs font-semibold transition',
        left === null ? 'bg-white/5 text-mist hover:text-bone' : 'bg-volt/20 text-volt-3',
      )}
      aria-label={left === null ? `${seconds} soniyalik taymerni boshlash` : `Taymerni to‘xtatish, ${left} soniya qoldi`}
    >
      <Icon name={left === null ? 'play' : 'pause'} size={14} />
      <span className="tabular-nums">{left === null ? 'Taymer' : `${left} s`}</span>
    </button>
  )
}

export const ExerciseStep = ({
  log,
  exercise,
  onChange,
  onSetDone,
}: {
  log: ExerciseLog
  exercise: Exercise
  onChange: (next: ExerciseLog) => void
  onSetDone: (index: number) => void
}) => {
  //
  const { state } = useAppStore()
  const [showTechnique, setShowTechnique] = useState(false)
  const previous = useMemo(() => exerciseTrend(state.sessions, exercise.id).at(-1), [state.sessions, exercise.id])
  const isTime = exercise.kind === 'time'

  const patchSet = (index: number, patch: Partial<ExerciseLog['sets'][number]>) => {
    onChange({ ...log, sets: log.sets.map((set, position) => (position === index ? { ...set, ...patch } : set)) })
  }

  return (
    <section className="mt-5 animate-rise" aria-labelledby="exercise-title">
      <div className="grid gap-4 sm:grid-cols-[1fr_1.1fr] sm:items-start">
        <ExerciseDemo kind={exercise.demo} label={exercise.name} className="h-48 sm:h-60" />
        <div>
          {log.exerciseId !== log.plannedExerciseId ? <Badge tone="warn">Almashtirilgan mashq</Badge> : null}
          {log.status === 'skipped' ? <Badge tone="blood">O‘tkazib yuborilgan</Badge> : null}
          <h1 id="exercise-title" className="mt-1 font-display text-2xl font-bold">
            {exercise.name}
          </h1>
          <p className="mt-1 text-sm text-mist">{exercise.description}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {exercise.primary.map((id) => (
              <Badge key={id} tone="volt">
                {MUSCLES[id].name}
              </Badge>
            ))}
            {exercise.secondary.slice(0, 3).map((id) => (
              <Badge key={id}>{MUSCLES[id].name}</Badge>
            ))}
          </div>
          {previous ? (
            <p className="mt-3 text-xs text-fog">
              Oxirgi safar:{' '}
              <span className="text-mist">
                {previous.bestReps !== null ? `${previous.bestReps} takror` : ''}
                {previous.bestSeconds !== null ? `${previous.bestSeconds} s` : ''}
                {previous.bestWeight !== null ? ` · ${previous.bestWeight} kg` : ''}
              </span>
            </p>
          ) : null}
          <button
            type="button"
            onClick={() => setShowTechnique((value) => !value)}
            aria-expanded={showTechnique}
            className="mt-3 inline-flex min-h-10 items-center gap-1 text-sm font-semibold text-volt-3"
          >
            <Icon name="info" size={16} /> Texnika {showTechnique ? 'yashirish' : 'ko‘rsatish'}
          </button>
          {showTechnique ? (
            <ol className="mt-2 space-y-1.5 text-sm text-bone/90">
              {exercise.technique.map((step, index) => (
                <li key={step} className="flex gap-2">
                  <span className="font-display text-xs text-volt-3">{index + 1}.</span>
                  {step}
                </li>
              ))}
            </ol>
          ) : null}
        </div>
      </div>

      <div className="mt-5 space-y-2" role="list" aria-label="Setlar">
        {log.sets.map((set, index) => (
          <div
            key={index}
            role="listitem"
            className={cx(
              'flex flex-wrap items-center gap-2 rounded-2xl border p-3 transition duration-300',
              set.done ? 'border-volt/50 bg-volt/10' : 'border-line bg-white/[0.02]',
            )}
          >
            <span className="w-12 font-display text-sm font-bold text-mist">{index + 1}-set</span>
            <div className="flex flex-1 flex-wrap items-center gap-2">
              {isTime ? (
                <NumberStepper label={`${index + 1}-set soniya`} value={set.seconds} onChange={(seconds) => patchSet(index, { seconds })} step={5} min={5} max={600} suffix="s" />
              ) : (
                <NumberStepper label={`${index + 1}-set takrorlash`} value={set.reps} onChange={(reps) => patchSet(index, { reps })} min={0} max={200} suffix="x" />
              )}
              {exercise.usesWeight ? (
                <NumberStepper label={`${index + 1}-set og‘irlik`} value={set.weightKg} onChange={(weightKg) => patchSet(index, { weightKg })} step={2.5} min={0} max={500} suffix="kg" />
              ) : null}
              {isTime && !set.done ? <SetTimer seconds={set.seconds ?? 30} onComplete={() => onSetDone(index)} /> : null}
            </div>
            <button
              type="button"
              role="checkbox"
              aria-checked={set.done}
              aria-label={`${index + 1}-set bajarildi`}
              onClick={() => onSetDone(index)}
              className={cx(
                'flex size-12 shrink-0 items-center justify-center rounded-2xl border-2 transition active:scale-90',
                set.done ? 'animate-pop border-volt bg-volt text-white shadow-glow' : 'border-white/20 text-fog hover:border-volt/60 hover:text-volt-3',
              )}
            >
              <Icon name="check" size={22} strokeWidth={2.6} />
            </button>
          </div>
        ))}
      </div>
      {exercise.usesWeight ? <p className="mt-2 text-xs text-fog">Og‘irlikni ixtiyoriy kiriting — rivojlanish grafigida ko‘rinadi.</p> : null}
    </section>
  )
}
