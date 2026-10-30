import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ADAPTATION_RULES } from '@/domain/adaptation.ts'
import { EXERCISES, getExercise } from '@/domain/exercises.ts'
import { MUSCLES, MUSCLE_IDS } from '@/domain/muscles.ts'
import { MAX_PHASE, isExerciseAllowed } from '@/domain/planner.ts'
import { WEEKDAYS_SHORT, formatDate } from '@/domain/progress.ts'
import type { MuscleId, WorkoutTemplate } from '@/domain/types.ts'
import { INTENSITY_LABELS } from '@/i18n/uz.ts'
import { ExerciseSheet } from '@/components/ExerciseSheet.tsx'
import { formatDose } from '@/components/format.ts'
import { Icon } from '@/components/Icon.tsx'
import { Badge, Button, Card, EmptyState, SectionTitle, cx } from '@/components/ui.tsx'
import { useAppStore } from '@/store/AppStore.tsx'

const ADJUSTMENT_ICON = {
  start: 'spark',
  increase: 'bolt',
  hold: 'shield',
  decrease: 'minus',
  safety: 'alert',
  return: 'rotate',
  profile: 'edit',
} as const

export default function WorkoutsPage() {
  //
  const { state, startSession } = useAppStore()
  const navigate = useNavigate()
  const plan = state.plan!
  const profile = state.profile!
  const [expanded, setExpanded] = useState<string | null>(plan.workouts[plan.cursor]?.id ?? null)
  const [openExercise, setOpenExercise] = useState<{ id: string; workout?: WorkoutTemplate } | null>(null)
  const [muscleFilter, setMuscleFilter] = useState<MuscleId | 'all'>('all')
  const [onlyMine, setOnlyMine] = useState(true)

  const library = useMemo(
    () =>
      EXERCISES.filter((item) => muscleFilter === 'all' || item.primary.includes(muscleFilter) || item.secondary.includes(muscleFilter))
        .filter((item) => !onlyMine || isExerciseAllowed(item, profile, plan.safetyMode))
        .sort((a, b) => a.difficulty - b.difficulty || a.name.localeCompare(b.name)),
    [muscleFilter, onlyMine, profile, plan.safetyMode],
  )

  const begin = (workout: WorkoutTemplate) => {
    if (!state.active) startSession(workout)
    navigate('/session')
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold sm:text-3xl">Mashg‘ulotlar</h1>
        <p className="mt-1 text-sm text-mist">Shaxsiy rejangiz, mashqlar kutubxonasi va reja qanday moslashishi.</p>
      </header>

      <div className="grid gap-6 [&>*]:min-w-0 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <Card>
            <SectionTitle action={<Badge tone={plan.safetyMode === 'gentle' ? 'warn' : 'volt'}>{plan.safetyMode === 'gentle' ? 'Ehtiyotkor rejim' : `Pog‘ona ${plan.phase + 1}/${MAX_PHASE + 1}`}</Badge>}>
              Haftalik jadval
            </SectionTitle>
            <ol className="grid grid-cols-7 gap-1.5">
              {WEEKDAYS_SHORT.map((label, day) => {
                const training = plan.trainingDays.includes(day)
                return (
                  <li
                    key={label}
                    className={cx(
                      'flex flex-col items-center gap-1 rounded-xl border py-2.5 text-xs',
                      training ? 'border-volt/40 bg-volt/10 text-bone' : 'border-line text-fog',
                    )}
                    aria-label={`${label}: ${training ? 'mashg‘ulot' : 'dam olish'}`}
                  >
                    <span className="font-semibold">{label}</span>
                    <Icon name={training ? 'dumbbell' : 'moon'} size={14} className={training ? 'text-volt-3' : ''} />
                  </li>
                )
              })}
            </ol>
            <p className="mt-3 text-xs text-fog">Mashg‘ulotlar navbat bilan almashadi. Biror kun o‘tib ketsa, reja shunchaki keyingi mashg‘ulotdan davom etadi.</p>
          </Card>

          <section aria-labelledby="plan-title">
            <SectionTitle id="plan-title">Rejadagi mashg‘ulotlar</SectionTitle>
            <div className="space-y-3">
              {plan.workouts.map((workout, index) => {
                const isOpen = expanded === workout.id
                const isNext = index === plan.cursor
                return (
                  <Card key={workout.id} className="p-0">
                    <button
                      type="button"
                      onClick={() => setExpanded(isOpen ? null : workout.id)}
                      aria-expanded={isOpen}
                      className="flex w-full items-center gap-4 p-5 text-left"
                    >
                      <span className={cx('flex size-11 shrink-0 items-center justify-center rounded-2xl font-display font-bold', isNext ? 'bg-volt text-white shadow-glow' : 'bg-white/5 text-mist')}>
                        {index + 1}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold">{workout.title}</span>
                          {isNext ? <Badge tone="volt">Navbatdagi</Badge> : null}
                        </span>
                        <span className="mt-0.5 block truncate text-xs text-mist">
                          {workout.items.length} mashq · ~{workout.estMinutes} daq · {INTENSITY_LABELS[workout.intensity].title}
                        </span>
                      </span>
                      <Icon name="chevronRight" className={cx('shrink-0 text-fog transition', isOpen && 'rotate-90')} />
                    </button>
                    {isOpen ? (
                      <div className="animate-rise border-t border-line px-5 pt-2 pb-5">
                        <p className="py-2 text-sm text-mist">{workout.focus}</p>
                        <ul className="divide-y divide-line">
                          {workout.items.map((item) => {
                            const exercise = getExercise(item.exerciseId)
                            if (!exercise) return null
                            return (
                              <li key={item.exerciseId}>
                                <button
                                  type="button"
                                  onClick={() => setOpenExercise({ id: item.exerciseId, workout })}
                                  className="flex w-full items-center gap-3 py-3 text-left hover:text-volt-3"
                                >
                                  <span className="min-w-0 flex-1">
                                    <span className="block truncate text-sm font-medium">{exercise.name}</span>
                                    <span className="block truncate text-xs text-fog">{exercise.primary.map((id) => MUSCLES[id].name).join(', ')}</span>
                                  </span>
                                  <span className="shrink-0 text-right text-xs text-mist">
                                    {formatDose(item)}
                                    <span className="block text-fog">dam {item.restSec} s</span>
                                  </span>
                                </button>
                              </li>
                            )
                          })}
                        </ul>
                        <Button variant={isNext ? 'primary' : 'secondary'} icon="play" className="mt-3 w-full" onClick={() => begin(workout)} disabled={Boolean(state.active)}>
                          {state.active ? 'Boshqa mashg‘ulot davom etmoqda' : 'Shu mashg‘ulotni boshlash'}
                        </Button>
                      </div>
                    ) : null}
                  </Card>
                )
              })}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <Card>
            <SectionTitle>Reja qanday moslashadi</SectionTitle>
            <ul className="space-y-2.5">
              {ADAPTATION_RULES.map((rule) => (
                <li key={rule} className="flex gap-2.5 text-sm text-bone/90">
                  <Icon name="check" size={16} className="mt-0.5 shrink-0 text-volt-3" />
                  {rule}
                </li>
              ))}
            </ul>
          </Card>
          <Card>
            <SectionTitle>O‘zgarishlar tarixi</SectionTitle>
            <ol className="space-y-3">
              {plan.adjustments.slice(0, 8).map((item) => (
                <li key={`${item.date}-${item.kind}`} className="flex gap-3">
                  <span className={cx('flex size-8 shrink-0 items-center justify-center rounded-lg', item.kind === 'safety' ? 'bg-blood/15 text-blood-2' : 'bg-volt/12 text-volt-3')}>
                    <Icon name={ADJUSTMENT_ICON[item.kind]} size={16} />
                  </span>
                  <div className="min-w-0">
                    <div className="text-xs text-fog">{formatDate(item.date)}</div>
                    <p className="text-sm text-bone/90">{item.message}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Card>
        </div>
      </div>

      <section aria-labelledby="library-title">
        <SectionTitle
          id="library-title"
          action={
            <button
              type="button"
              role="switch"
              aria-checked={onlyMine}
              onClick={() => setOnlyMine((value) => !value)}
              className="flex min-h-10 items-center gap-2 text-xs font-semibold text-mist"
            >
              <span className={cx('relative h-5 w-9 rounded-full transition', onlyMine ? 'bg-volt' : 'bg-white/15')}>
                <span className={cx('absolute top-0.5 size-4 rounded-full bg-white transition-all', onlyMine ? 'left-[18px]' : 'left-0.5')} />
              </span>
              Faqat menga mos
            </button>
          }
        >
          Mashqlar kutubxonasi
        </SectionTitle>
        <div className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Mushak bo‘yicha saralash">
          {(['all', ...MUSCLE_IDS] as const).map((id) => (
            <button
              key={id}
              type="button"
              aria-pressed={muscleFilter === id}
              onClick={() => setMuscleFilter(id)}
              className={cx(
                'min-h-10 shrink-0 rounded-full border px-4 text-xs font-semibold transition',
                muscleFilter === id ? 'border-volt bg-volt/20 text-bone' : 'border-line text-mist hover:text-bone',
              )}
            >
              {id === 'all' ? 'Barchasi' : MUSCLES[id].name}
            </button>
          ))}
        </div>
        {library.length === 0 ? (
          <EmptyState icon="dumbbell" title="Mos mashq topilmadi" text="Boshqa mushak guruhini tanlang yoki “Faqat menga mos” filtrini o‘chiring." />
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {library.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => setOpenExercise({ id: item.id })}
                  className="glass flex h-full w-full flex-col rounded-2xl p-4 text-left transition hover:-translate-y-0.5 hover:border-volt/40"
                >
                  <span className="flex items-start justify-between gap-2">
                    <span className="font-semibold">{item.name}</span>
                    <span className="flex gap-0.5 pt-1" aria-label={`Qiyinlik ${item.difficulty} / 3`}>
                      {[1, 2, 3].map((level) => (
                        <span key={level} className={cx('h-1.5 w-3 rounded-full', level <= item.difficulty ? 'bg-volt-2' : 'bg-white/10')} />
                      ))}
                    </span>
                  </span>
                  <span className="mt-1 line-clamp-2 text-xs text-mist">{item.description}</span>
                  <span className="mt-auto flex flex-wrap gap-1 pt-3">
                    {item.primary.map((id) => (
                      <Badge key={id} tone="volt">
                        {MUSCLES[id].name}
                      </Badge>
                    ))}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <ExerciseSheet
        exerciseId={openExercise?.id ?? null}
        prescription={openExercise?.workout?.items.find((item) => item.exerciseId === openExercise.id)}
        onClose={() => setOpenExercise(null)}
      />
    </div>
  )
}
