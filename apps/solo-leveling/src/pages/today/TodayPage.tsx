import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getExercise } from '@/domain/exercises.ts'
import { assessSafety } from '@/domain/planner.ts'
import {
  QUEST_XP,
  WEEKDAYS_LONG,
  WEEKDAYS_SHORT,
  dayKey,
  formatDate,
  formatDuration,
  levelInfo,
  questsFor,
  recentLoad,
  resolveToday,
  totalXp,
  weekActivity,
  workoutLoad,
} from '@/domain/progress.ts'
import { completionRatio } from '@/domain/adaptation.ts'
import type { WorkoutTemplate } from '@/domain/types.ts'
import { INTENSITY_LABELS } from '@/i18n/uz.ts'
import { MuscleViewer } from '@/components/body/MuscleViewer.tsx'
import { ExerciseSheet } from '@/components/ExerciseSheet.tsx'
import { formatDose } from '@/components/format.ts'
import { Icon } from '@/components/Icon.tsx'
import { Badge, Button, Card, Notice, ProgressBar, SectionTitle, cx } from '@/components/ui.tsx'
import { useAppStore } from '@/store/AppStore.tsx'

const greeting = (hour: number) => {
  //
  if (hour < 5) return 'Xayrli tun'
  if (hour < 12) return 'Xayrli tong'
  if (hour < 18) return 'Xayrli kun'
  return 'Xayrli kech'
}

const REST_IDEAS = [
  { icon: 'heart' as const, title: '20–30 daqiqa sayr', text: 'Yengil yurish qon aylanishini yaxshilaydi va tiklanishni tezlashtiradi.' },
  { icon: 'spark' as const, title: '10 daqiqa harakatchanlik', text: 'Mushuk-sigir, son old qismini cho‘zish, ko‘krak umurtqasini burish.' },
  { icon: 'moon' as const, title: 'Sifatli uyqu', text: 'Mushaklar aynan dam olish va uyqu paytida kuchayadi.' },
]

export const TodayPage = () => {
  //
  const { state, startSession, toggleQuest } = useAppStore()
  const navigate = useNavigate()
  const [openExercise, setOpenExercise] = useState<string | null>(null)
  const profile = state.profile!
  const plan = state.plan!
  const now = new Date()
  const today = resolveToday(plan, state.sessions, now)
  const info = levelInfo(totalXp(state.sessions, state.bonusXp))
  const week = weekActivity(state.sessions, now)
  const weekDone = week.filter((item) => item.sessions.length > 0).length
  const safety = assessSafety(profile)
  const lastSession = state.sessions[0]
  const latestAdjustment = plan.adjustments[0]
  const quests = questsFor(now)
  const questDone = state.quests.date === dayKey(now) ? state.quests.done : []

  const begin = (workout: WorkoutTemplate) => {
    if (!state.active) startSession(workout)
    navigate('/session')
  }

  const workout = today.kind === 'train' ? today.workout : today.next
  const load = today.kind === 'done' ? recentLoad(state.sessions, 1, now) : workoutLoad(workout)

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-mist">
            {WEEKDAYS_LONG[(now.getDay() + 6) % 7]}, {formatDate(now.toISOString())}
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold sm:text-3xl">
            {greeting(now.getHours())}
            {profile.name ? `, ${profile.name}` : ''}!
          </h1>
        </div>
        <div className="flex min-w-[220px] flex-1 items-center gap-3 rounded-2xl border border-line bg-white/[0.02] p-3 sm:max-w-xs">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-volt to-blood font-display text-xl font-extrabold shadow-glow">
            {info.rank}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-sm font-semibold">{info.level}-daraja</span>
              <span className="text-[11px] text-fog">
                {info.current}/{info.needed} XP
              </span>
            </div>
            <div className="truncate text-xs text-mist">{info.rankTitle}</div>
            <ProgressBar value={info.progress} label="Keyingi darajagacha tajriba" className="mt-1.5" />
          </div>
        </div>
      </header>

      {safety.consultSpecialist ? (
        <Notice tone="warn" title="Ehtiyotkor rejim">
          Reja yengil rejimda. Yuklamani oshirishdan oldin shifokor yoki mutaxassis bilan maslahatlashing.
        </Notice>
      ) : null}

      <div className="grid gap-6 [&>*]:min-w-0 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          {today.kind === 'train' ? (
            <Card className="relative overflow-hidden p-0">
              <div className="pointer-events-none absolute -top-24 -right-24 size-64 rounded-full bg-volt/25 blur-3xl" aria-hidden="true" />
              <div className="relative p-5 sm:p-6">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="volt">
                    <Icon name="bolt" size={12} /> Bugungi vazifa
                  </Badge>
                  <Badge tone={INTENSITY_LABELS[today.workout.intensity].tone}>{INTENSITY_LABELS[today.workout.intensity].title}</Badge>
                  <Badge>
                    <Icon name="clock" size={12} /> ~{today.workout.estMinutes} daq
                  </Badge>
                </div>
                <h2 className="mt-3 font-display text-2xl font-bold">{today.workout.title}</h2>
                <p className="mt-1 text-sm text-mist">{today.workout.focus}</p>
                <ul className="mt-5 divide-y divide-line">
                  {today.workout.items.map((item, order) => {
                    const exercise = getExercise(item.exerciseId)
                    if (!exercise) return null
                    return (
                      <li key={item.exerciseId}>
                        <button
                          type="button"
                          onClick={() => setOpenExercise(item.exerciseId)}
                          className="flex w-full items-center gap-3 py-3 text-left transition hover:text-volt-3"
                        >
                          <span className="w-5 font-display text-xs text-fog">{String(order + 1).padStart(2, '0')}</span>
                          <span className="min-w-0 flex-1 truncate text-[15px] font-medium">{exercise.name}</span>
                          <span className="shrink-0 text-sm text-mist">{formatDose(item)}</span>
                          <Icon name="chevronRight" size={16} className="shrink-0 text-fog" />
                        </button>
                      </li>
                    )
                  })}
                </ul>
                <Button size="lg" icon="play" className="mt-5 w-full animate-pulse-ring" onClick={() => begin(today.workout)}>
                  {state.active ? 'Mashg‘ulotni davom ettirish' : 'Mashg‘ulotni boshlash'}
                </Button>
              </div>
            </Card>
          ) : null}

          {today.kind === 'rest' ? (
            <Card>
              <div className="flex items-start gap-4">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-volt/12 text-volt-3">
                  <Icon name="moon" size={24} />
                </span>
                <div>
                  <h2 className="font-display text-xl font-bold">Bugun — dam olish kuni</h2>
                  <p className="mt-1 text-sm text-mist">{today.reason}</p>
                </div>
              </div>
              <ul className="mt-5 grid gap-2 sm:grid-cols-3">
                {REST_IDEAS.map((idea) => (
                  <li key={idea.title} className="rounded-2xl border border-line bg-white/[0.02] p-4">
                    <Icon name={idea.icon} className="text-volt-3" />
                    <div className="mt-2 text-sm font-semibold">{idea.title}</div>
                    <div className="mt-1 text-xs text-mist">{idea.text}</div>
                  </li>
                ))}
              </ul>
              {today.next ? (
                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white/[0.03] p-4">
                  <div className="text-sm">
                    <div className="text-xs text-fog">Keyingi mashg‘ulot{today.nextDay !== null ? ` · ${WEEKDAYS_LONG[today.nextDay]}` : ''}</div>
                    <div className="font-semibold">{today.next.title}</div>
                  </div>
                  <Button variant="secondary" size="sm" icon="play" onClick={() => begin(today.next!)}>
                    Baribir bugun bajarish
                  </Button>
                </div>
              ) : null}
            </Card>
          ) : null}

          {today.kind === 'done' ? (
            <Card className="relative overflow-hidden">
              <div className="pointer-events-none absolute -top-20 -right-20 size-56 rounded-full bg-ok/15 blur-3xl" aria-hidden="true" />
              <div className="relative flex items-start gap-4">
                <span className="flex size-12 shrink-0 animate-pop items-center justify-center rounded-2xl bg-ok/15 text-ok">
                  <Icon name="check" size={26} strokeWidth={2.4} />
                </span>
                <div>
                  <h2 className="font-display text-xl font-bold">Bugungi vazifa bajarildi!</h2>
                  <p className="mt-1 text-sm text-mist">
                    {today.session.title} · {formatDuration(today.session.durationSec)} · +{today.session.xp} XP
                  </p>
                </div>
              </div>
              {today.next ? (
                <p className="relative mt-4 text-sm text-mist">
                  Keyingi navbatda: <span className="font-semibold text-bone">{today.next.title}</span>. Endi tanaga dam bering.
                </p>
              ) : null}
            </Card>
          ) : null}

          <Card>
            <MuscleViewer
              load={load}
              title={today.kind === 'done' ? 'Bugun ishlagan mushaklar' : today.kind === 'rest' ? 'Keyingi mashg‘ulotdagi mushaklar' : 'Bugun ishlaydigan mushaklar'}
            />
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <SectionTitle
              action={
                <span className="text-xs text-mist">
                  {weekDone}/{plan.trainingDays.length} kun
                </span>
              }
            >
              Shu hafta
            </SectionTitle>
            <ol className="grid grid-cols-7 gap-1.5">
              {week.map((item) => {
                const planned = plan.trainingDays.includes(item.day)
                const done = item.sessions.length > 0
                const isToday = dayKey(item.date) === dayKey(now)
                return (
                  <li key={item.day} className="flex flex-col items-center gap-1.5">
                    <span className={cx('text-[11px]', isToday ? 'font-bold text-bone' : 'text-fog')}>{WEEKDAYS_SHORT[item.day]}</span>
                    <span
                      className={cx(
                        'flex aspect-square w-full max-w-10 items-center justify-center rounded-xl border text-xs transition',
                        done && 'border-volt bg-volt text-white shadow-glow',
                        !done && planned && 'border-volt/40 border-dashed text-volt-3',
                        !done && !planned && 'border-line text-fog',
                        isToday && !done && 'ring-2 ring-volt-3/50',
                      )}
                      aria-label={`${WEEKDAYS_LONG[item.day]}: ${done ? 'mashg‘ulot bajarildi' : planned ? 'rejalashtirilgan' : 'dam olish'}`}
                    >
                      {done ? <Icon name="check" size={14} strokeWidth={2.6} /> : planned ? <Icon name="dumbbell" size={14} /> : <Icon name="moon" size={12} />}
                    </span>
                  </li>
                )
              })}
            </ol>
            <p className="mt-3 text-xs text-fog">Dam olish kunlari ham rejaning bir qismi — o‘tkazib yuborilgan kun uchun jarima yo‘q.</p>
          </Card>

          <Card>
            <SectionTitle>Oxirgi mashg‘ulot</SectionTitle>
            {lastSession ? (
              <div>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-semibold">{lastSession.title}</div>
                    <div className="text-xs text-mist">{formatDate(lastSession.finishedAt)}</div>
                  </div>
                  <Badge tone="volt">+{lastSession.xp} XP</Badge>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  {[
                    ['Vaqt', formatDuration(lastSession.durationSec)],
                    ['Bajarildi', `${Math.round(completionRatio(lastSession) * 100)}%`],
                    ['Qiyinlik', `${lastSession.feedback.difficulty}/5`],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-xl bg-white/[0.03] p-2.5">
                      <div className="font-display text-base font-bold">{value}</div>
                      <div className="text-[11px] text-fog">{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-mist">Hali mashg‘ulot qayd etilmagan. Birinchi mashg‘ulotdan so‘ng natijangiz shu yerda ko‘rinadi.</p>
            )}
          </Card>

          {latestAdjustment ? (
            <Card>
              <SectionTitle>Reja yangiliklari</SectionTitle>
              <p className="text-sm text-bone/90">{latestAdjustment.message}</p>
              <button type="button" onClick={() => navigate('/workouts')} className="mt-3 inline-flex min-h-10 items-center gap-1 text-sm font-semibold text-volt-3 hover:underline">
                Reja qanday moslashadi <Icon name="chevronRight" size={16} />
              </button>
            </Card>
          ) : null}

          <Card>
            <SectionTitle action={<Badge>Ixtiyoriy</Badge>}>Kunlik vazifalar</SectionTitle>
            <ul className="space-y-2">
              {quests.map((quest) => {
                const done = questDone.includes(quest.id)
                return (
                  <li key={quest.id}>
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={done}
                      onClick={() => toggleQuest(quest.id)}
                      className={cx(
                        'flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition',
                        done ? 'border-volt/40 bg-volt/10' : 'border-line hover:border-white/20',
                      )}
                    >
                      <span className={cx('flex size-6 shrink-0 items-center justify-center rounded-md border transition', done ? 'animate-pop border-volt bg-volt text-white' : 'border-white/25')}>
                        {done ? <Icon name="check" size={14} strokeWidth={2.6} /> : null}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className={cx('block text-sm font-medium', done && 'text-mist line-through')}>{quest.title}</span>
                        <span className="block text-xs text-fog">{quest.hint}</span>
                      </span>
                      <span className="text-xs font-semibold text-volt-3">+{QUEST_XP}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </Card>
        </div>
      </div>

      <ExerciseSheet
        exerciseId={openExercise}
        prescription={today.kind === 'train' ? today.workout.items.find((item) => item.exerciseId === openExercise) : undefined}
        onClose={() => setOpenExercise(null)}
      />
    </div>
  )
}
