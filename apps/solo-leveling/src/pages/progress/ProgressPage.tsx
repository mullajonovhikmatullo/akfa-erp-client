import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { completionRatio } from '@/domain/adaptation.ts'
import { getExercise } from '@/domain/exercises.ts'
import {
  ACHIEVEMENTS,
  MONTHS,
  WEEKDAYS_SHORT,
  consistencyWeeks,
  dayKey,
  exerciseTrend,
  formatDate,
  formatDuration,
  levelInfo,
  loggedExerciseIds,
  recentLoad,
  totalXp,
  totals,
  weekdayIndex,
  weeklyCounts,
} from '@/domain/progress.ts'
import { GAME_DISCLAIMER } from '@/i18n/uz.ts'
import { MuscleViewer } from '@/components/body/MuscleViewer.tsx'
import { BarChart, LineChart } from '@/components/charts.tsx'
import { Icon, type IconName } from '@/components/Icon.tsx'
import { Badge, Button, Card, EmptyState, ProgressBar, SectionTitle, Segmented, Stat, cx } from '@/components/ui.tsx'
import { useAppStore } from '@/store/AppStore.tsx'

export default function ProgressPage() {
  //
  const { state } = useAppStore()
  const navigate = useNavigate()
  const now = new Date()
  const sessions = state.sessions
  const plan = state.plan!
  const info = levelInfo(totalXp(sessions, state.bonusXp))
  const stats = totals(sessions, now)
  const streak = consistencyWeeks(sessions, plan.trainingDays.length, now)
  const exerciseIds = useMemo(() => loggedExerciseIds(sessions), [sessions])
  const [exerciseId, setExerciseId] = useState<string | null>(null)
  const [metric, setMetric] = useState<'main' | 'weight'>('main')
  const [openSession, setOpenSession] = useState<string | null>(null)
  const selectedId = exerciseId ?? exerciseIds[0] ?? null
  const trend = useMemo(() => (selectedId ? exerciseTrend(sessions, selectedId) : []), [sessions, selectedId])
  const selectedExercise = selectedId ? getExercise(selectedId) : undefined
  const hasWeight = trend.some((point) => point.bestWeight !== null)

  const weeks = weeklyCounts(sessions, 8, now).map((week) => ({
    label: `${week.start.getDate()}.${String(week.start.getMonth() + 1).padStart(2, '0')}`,
    value: week.count,
    detail: `${week.count} ta mashg‘ulot · ${week.minutes} daq`,
  }))

  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const sessionDays = new Set(sessions.map((item) => dayKey(new Date(item.finishedAt))))

  const trendPoints = trend
    .map((point) => {
      const value = metric === 'weight' ? point.bestWeight : (point.bestReps ?? point.bestSeconds)
      const unit = metric === 'weight' ? 'kg' : point.bestSeconds !== null ? 's' : 'takror'
      return value === null ? null : { label: formatDate(point.date), value, detail: `${formatDate(point.date)}: ${value} ${unit}` }
    })
    .filter((point): point is NonNullable<typeof point> => point !== null)

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-2xl font-bold sm:text-3xl">Rivojlanish</h1>
        <p className="mt-1 text-sm text-mist">Barcha ko‘rsatkichlar faqat siz qayd etgan mashg‘ulotlarga asoslanadi.</p>
      </header>

      <Card className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-20 -left-16 size-64 rounded-full bg-volt/20 blur-3xl" aria-hidden="true" />
        <div className="relative flex flex-wrap items-center gap-5">
          <span className="flex size-20 items-center justify-center rounded-3xl bg-gradient-to-br from-volt to-blood font-display text-4xl font-extrabold shadow-glow">{info.rank}</span>
          <div className="min-w-[200px] flex-1">
            <div className="text-xs tracking-widest text-volt-3 uppercase">{info.rankTitle}</div>
            <div className="mt-1 font-display text-2xl font-bold">{info.level}-daraja</div>
            <ProgressBar value={info.progress} label="Keyingi darajagacha" className="mt-3" />
            <div className="mt-1.5 flex justify-between text-xs text-fog">
              <span>Jami {info.totalXp} XP</span>
              <span>Keyingi darajaga {info.needed - info.current} XP</span>
            </div>
          </div>
        </div>
        <p className="relative mt-4 text-[11px] text-fog">{GAME_DISCLAIMER}</p>
      </Card>

      {sessions.length === 0 ? (
        <EmptyState
          icon="chart"
          title="Hali ma’lumot yo‘q"
          text="Birinchi mashg‘ulotni yakunlang — tarix, grafiklar va mushak faolligi shu yerda paydo bo‘ladi. Biz hech qanday ko‘rsatkichni o‘ylab topmaymiz."
          action={
            <Button icon="play" onClick={() => navigate('/')}>
              Bugungi mashg‘ulotga
            </Button>
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
            <Stat icon="dumbbell" label="Mashg‘ulotlar" value={stats.sessions} />
            <Stat icon="clock" label="Jami vaqt" value={formatDuration(stats.minutes * 60)} />
            <Stat icon="calendar" label="Shu hafta" value={`${stats.thisWeek}/${plan.trainingDays.length}`} />
            <Stat icon="target" label="Shu oy" value={stats.thisMonth} />
            <Stat icon="flame" label="Barqaror haftalar" value={streak} hint="Haftalik maqsad bajarilgan" />
            <Stat icon="bolt" label="Jami takror" value={stats.reps} />
          </div>

          <div className="grid gap-6 [&>*]:min-w-0 lg:grid-cols-2">
            <Card>
              <SectionTitle>Haftalik faollik</SectionTitle>
              <BarChart points={weeks} caption="Oxirgi 8 haftadagi mashg‘ulotlar soni" unit="Mashg‘ulotlar" target={plan.trainingDays.length} />
            </Card>
            <Card>
              <SectionTitle>
                {MONTHS[now.getMonth()]} {now.getFullYear()}
              </SectionTitle>
              <div className="grid grid-cols-7 gap-1.5 text-center text-[11px] text-fog" aria-hidden="true">
                {WEEKDAYS_SHORT.map((label) => (
                  <span key={label}>{label}</span>
                ))}
              </div>
              <ol className="mt-1.5 grid grid-cols-7 gap-1.5" aria-label="Oylik faollik taqvimi">
                {Array.from({ length: weekdayIndex(monthStart) }, (_, index) => (
                  <li key={`pad-${index}`} aria-hidden="true" />
                ))}
                {Array.from({ length: daysInMonth }, (_, index) => {
                  const date = new Date(now.getFullYear(), now.getMonth(), index + 1)
                  const active = sessionDays.has(dayKey(date))
                  const isToday = dayKey(date) === dayKey(now)
                  return (
                    <li
                      key={index}
                      className={cx(
                        'flex aspect-square items-center justify-center rounded-lg text-xs',
                        active ? 'bg-volt font-semibold text-white' : 'bg-white/[0.03] text-mist',
                        isToday && 'ring-2 ring-volt-3/60',
                      )}
                      aria-label={`${index + 1}-${MONTHS[now.getMonth()]?.toLowerCase()}: ${active ? 'mashg‘ulot bor' : 'mashg‘ulot yo‘q'}`}
                    >
                      {index + 1}
                    </li>
                  )
                })}
              </ol>
            </Card>
          </div>

          <div className="grid gap-6 [&>*]:min-w-0 lg:grid-cols-2">
            <Card>
              <SectionTitle>Mashqlardagi o‘zgarish</SectionTitle>
              <label className="sr-only" htmlFor="trend-exercise">
                Mashqni tanlang
              </label>
              <select
                id="trend-exercise"
                value={selectedId ?? ''}
                onChange={(event) => {
                  setExerciseId(event.target.value)
                  setMetric('main')
                }}
                className="min-h-12 w-full rounded-2xl border border-line bg-graphite px-4 text-sm outline-none focus:border-volt/70"
              >
                {exerciseIds.map((id) => (
                  <option key={id} value={id}>
                    {getExercise(id)?.name ?? id}
                  </option>
                ))}
              </select>
              {hasWeight ? (
                <div className="mt-3">
                  <Segmented
                    label="Ko‘rsatkich"
                    value={metric}
                    onChange={setMetric}
                    options={[
                      { value: 'main', label: selectedExercise?.kind === 'time' ? 'Vaqt' : 'Takror' },
                      { value: 'weight', label: 'Og‘irlik' },
                    ]}
                  />
                </div>
              ) : null}
              <div className="mt-4">
                {trendPoints.length >= 2 ? (
                  <LineChart points={trendPoints} caption={`${selectedExercise?.name ?? ''} bo‘yicha eng yaxshi natija`} unit={metric === 'weight' ? 'kg' : 'Natija'} />
                ) : (
                  <p className="rounded-2xl bg-white/[0.03] p-4 text-sm text-mist">
                    {trendPoints.length === 1
                      ? `Hozircha bitta natija: ${trendPoints[0]?.detail}. Grafik uchun yana bir mashg‘ulot kerak.`
                      : 'Bu mashq uchun hali yetarli ma’lumot yo‘q.'}
                  </p>
                )}
              </div>
            </Card>
            <Card>
              <MuscleViewer load={recentLoad(sessions, 7, now)} title="So‘nggi 7 kundagi mushak faolligi" compact />
            </Card>
          </div>

          <Card>
            <SectionTitle action={<span className="text-xs text-mist">{sessions.length} ta</span>}>Mashg‘ulotlar tarixi</SectionTitle>
            <ul className="divide-y divide-line">
              {sessions.slice(0, 30).map((session) => {
                const isOpen = openSession === session.id
                return (
                  <li key={session.id}>
                    <button
                      type="button"
                      onClick={() => setOpenSession(isOpen ? null : session.id)}
                      aria-expanded={isOpen}
                      className="flex w-full items-center gap-3 py-3.5 text-left"
                    >
                      <span className="flex size-10 shrink-0 flex-col items-center justify-center rounded-xl bg-white/5 leading-none">
                        <span className="font-display text-sm font-bold">{new Date(session.finishedAt).getDate()}</span>
                        <span className="text-[9px] text-fog uppercase">{MONTHS[new Date(session.finishedAt).getMonth()]?.slice(0, 3)}</span>
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold">{session.title}</span>
                        <span className="block text-xs text-mist">
                          {formatDuration(session.durationSec)} · {Math.round(completionRatio(session) * 100)}% · qiyinlik {session.feedback.difficulty}/5
                        </span>
                      </span>
                      {session.feedback.discomfort === 'pain' ? <Badge tone="blood">Og‘riq</Badge> : null}
                      <Badge tone="volt">+{session.xp}</Badge>
                    </button>
                    {isOpen ? (
                      <div className="animate-rise pb-4 pl-13">
                        <ul className="space-y-1.5 text-sm">
                          {session.exercises.map((log, index) => (
                            <li key={`${log.exerciseId}-${index}`} className="flex justify-between gap-3">
                              <span className={cx(log.status === 'skipped' && 'text-fog line-through')}>{getExercise(log.exerciseId)?.name ?? log.exerciseId}</span>
                              <span className="shrink-0 text-xs text-mist">
                                {log.sets
                                  .filter((set) => set.done)
                                  .map((set) => `${set.reps ?? set.seconds ?? 0}${set.seconds !== null ? 's' : ''}${set.weightKg ? `×${set.weightKg}kg` : ''}`)
                                  .join(' · ') || 'o‘tkazildi'}
                              </span>
                            </li>
                          ))}
                        </ul>
                        {session.feedback.note ? <p className="mt-2 rounded-xl bg-white/[0.03] p-3 text-xs text-mist">“{session.feedback.note}”</p> : null}
                      </div>
                    ) : null}
                  </li>
                )
              })}
            </ul>
          </Card>
        </>
      )}

      <Card>
        <SectionTitle action={<span className="text-xs text-mist">{state.achievements.length}/{ACHIEVEMENTS.length}</span>}>Yutuqlar</SectionTitle>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
          {ACHIEVEMENTS.map((item) => {
            const unlocked = state.achievements.includes(item.id)
            return (
              <li
                key={item.id}
                className={cx('rounded-2xl border p-4 transition', unlocked ? 'border-volt/40 bg-gradient-to-br from-volt/15 to-transparent' : 'border-line opacity-60')}
              >
                <span className={cx('flex size-10 items-center justify-center rounded-xl', unlocked ? 'bg-gradient-to-br from-volt to-blood text-white shadow-glow' : 'bg-white/5 text-fog')}>
                  <Icon name={unlocked ? (item.icon as IconName) : 'lock'} size={18} />
                </span>
                <div className="mt-3 text-sm font-semibold">{item.title}</div>
                <div className="mt-0.5 text-xs text-mist">{item.description}</div>
                <span className="sr-only">{unlocked ? 'Ochilgan' : 'Hali ochilmagan'}</span>
              </li>
            )
          })}
        </ul>
      </Card>
    </div>
  )
}
