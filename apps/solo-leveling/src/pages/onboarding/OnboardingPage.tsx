import { useMemo, useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { assessSafety, buildPlan } from '@/domain/planner.ts'
import { GOAL_LABELS, LEVEL_LABELS, LOCATION_LABELS } from '@/i18n/uz.ts'
import { Logo } from '@/components/AppLayout.tsx'
import { Icon } from '@/components/Icon.tsx'
import { Button, Notice, ProgressBar } from '@/components/ui.tsx'
import { useAppStore } from '@/store/AppStore.tsx'
import {
  BasicsFields,
  BodyFields,
  ExperienceFields,
  GoalFields,
  LimitationsFields,
  LocationFields,
  ScheduleFields,
  draftToProfile,
  emptyDraft,
  validateBasics,
  validateBody,
  type ProfileDraft,
} from './view/ProfileFields.tsx'

interface Step {
  key: string
  title: string
  why: string
  render: () => ReactNode
  valid: boolean
}

export default function OnboardingPage() {
  //
  const { completeOnboarding } = useAppStore()
  const navigate = useNavigate()
  const [draft, setDraft] = useState<ProfileDraft>(emptyDraft)
  const [index, setIndex] = useState(0)
  const [showErrors, setShowErrors] = useState(false)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const onChange = (patch: Partial<ProfileDraft>) => setDraft((current) => ({ ...current, ...patch }))

  const basicsErrors = validateBasics(draft)
  const bodyErrors = validateBody(draft)
  const profilePreview = useMemo(() => (basicsErrors.age || basicsErrors.sex ? null : draftToProfile(draft)), [draft, basicsErrors.age, basicsErrors.sex])
  const safety = profilePreview ? assessSafety(profilePreview) : null
  const planPreview = useMemo(() => (profilePreview && safety?.allowed ? buildPlan(profilePreview) : null), [profilePreview, safety?.allowed])

  const steps: Step[] = [
    {
      key: 'basics',
      title: 'Keling, tanishamiz',
      why: 'Yosh va jins xavfsiz yuklama va tana modelini tanlash uchun kerak.',
      render: () => <BasicsFields draft={draft} onChange={onChange} showErrors={showErrors} />,
      valid: !basicsErrors.age && !basicsErrors.sex,
    },
    {
      key: 'body',
      title: 'Bo‘y va vazn',
      why: 'Faqat tana modeli ko‘rinishini moslash uchun. Kiritmasangiz ham bo‘ladi.',
      render: () => <BodyFields draft={draft} onChange={onChange} />,
      valid: !bodyErrors.height && !bodyErrors.weight,
    },
    {
      key: 'level',
      title: 'Hozirgi tayyorgarligingiz',
      why: 'Boshlang‘ich yuklamani to‘g‘ri tanlash uchun — juda oson ham, juda og‘ir ham bo‘lmasin.',
      render: () => <ExperienceFields draft={draft} onChange={onChange} />,
      valid: true,
    },
    {
      key: 'goal',
      title: 'Asosiy maqsadingiz',
      why: 'Takrorlashlar soni, dam olish vaqti va mashqlar turi maqsadga qarab belgilanadi.',
      render: () => <GoalFields draft={draft} onChange={onChange} />,
      valid: true,
    },
    {
      key: 'location',
      title: 'Qayerda mashq qilasiz?',
      why: 'Faqat sizda mavjud jihozlar bilan bajariladigan mashqlarni tanlaymiz.',
      render: () => <LocationFields draft={draft} onChange={onChange} />,
      valid: true,
    },
    {
      key: 'schedule',
      title: 'Jadvalingiz',
      why: 'Reja hafta kunlari va bir mashg‘ulot davomiyligiga sig‘adigan qilib tuziladi.',
      render: () => <ScheduleFields draft={draft} onChange={onChange} />,
      valid: true,
    },
    {
      key: 'limits',
      title: 'Cheklovlar va salomatlik',
      why: 'Xavfli bo‘lishi mumkin bo‘lgan mashqlarni chiqarib tashlash uchun. Bu ma’lumot faqat qurilmangizda saqlanadi.',
      render: () => <LimitationsFields draft={draft} onChange={onChange} />,
      valid: true,
    },
    {
      key: 'summary',
      title: 'Rejangiz tayyor',
      why: 'Quyidagi ma’lumotlar asosida shaxsiy reja tuzildi. Profilda istalgan vaqt o‘zgartirishingiz mumkin.',
      render: () =>
        profilePreview && planPreview ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2 text-sm">
              {[
                ['Maqsad', GOAL_LABELS[profilePreview.goal].title],
                ['Daraja', LEVEL_LABELS[profilePreview.level].title],
                ['Joy', LOCATION_LABELS[profilePreview.location].title],
                ['Jadval', `${profilePreview.daysPerWeek} kun · ${profilePreview.minutesPerSession} daq`],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-line bg-white/[0.02] p-3">
                  <div className="text-xs text-fog">{label}</div>
                  <div className="mt-0.5 font-semibold">{value}</div>
                </div>
              ))}
            </div>
            <ul className="space-y-2">
              {planPreview.workouts.map((workout, order) => (
                <li key={workout.id} className="flex items-center gap-3 rounded-2xl border border-line bg-white/[0.02] p-3 animate-rise" style={{ animationDelay: `${order * 60}ms` }}>
                  <span className="flex size-9 items-center justify-center rounded-xl bg-volt/15 font-display text-sm font-bold text-volt-3">{order + 1}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold">{workout.title}</span>
                    <span className="block truncate text-xs text-mist">
                      {workout.items.length} mashq · ~{workout.estMinutes} daq · {workout.focus}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
            {safety && safety.reasons.length > 0 ? (
              <Notice tone={safety.consultSpecialist ? 'warn' : 'info'} title={safety.consultSpecialist ? 'Mutaxassis bilan maslahatlashing' : 'Xavfsizlik moslamalari'}>
                <ul className="list-disc space-y-1 pl-4">
                  {safety.reasons.map((reason) => (
                    <li key={reason}>{reason}</li>
                  ))}
                </ul>
              </Notice>
            ) : null}
            <p className="text-xs text-fog">Ilova tibbiy maslahat bermaydi. O‘zingizni yomon his qilsangiz, mashg‘ulotni to‘xtating.</p>
          </div>
        ) : (
          <Notice tone="danger">{basicsErrors.age ?? 'Ma’lumotlarni to‘ldiring.'}</Notice>
        ),
      valid: Boolean(planPreview),
    },
  ]

  const step = steps[index - 1]
  const total = steps.length

  const go = (next: number) => {
    setShowErrors(false)
    setIndex(next)
    window.scrollTo({ top: 0 })
    requestAnimationFrame(() => headingRef.current?.focus())
  }

  const onNext = () => {
    if (!step) return go(1)
    if (!step.valid) {
      setShowErrors(true)
      return undefined
    }
    if (index === total) {
      completeOnboarding(draftToProfile(draft))
      navigate('/', { replace: true })
      return undefined
    }
    return go(index + 1)
  }

  if (!step) {
    return (
      <div className="relative flex min-h-dvh flex-col overflow-hidden px-5 py-8 sm:items-center sm:justify-center">
        <div className="pointer-events-none absolute -top-40 -right-40 size-[480px] rounded-full bg-volt/25 blur-[120px]" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-48 -left-40 size-[420px] rounded-full bg-blood/15 blur-[120px]" aria-hidden="true" />
        <div className="relative w-full max-w-lg">
          <Logo />
          <div className="mt-14 animate-rise">
            <p className="text-xs font-semibold tracking-[0.3em] text-volt-3 uppercase">Tizim xabari</p>
            <h1 className="mt-3 font-display text-4xl leading-[1.05] font-extrabold sm:text-5xl">
              Sizda <span className="text-gradient">o‘sish</span> qobiliyati uyg‘ondi.
            </h1>
            <p className="mt-5 text-base text-mist">
              Har bir mashg‘ulot — bir qadam yuqoriga. Boshlang‘ich holatingizdan boshlab, sizga mos reja bilan kuchliroq, chidamliroq va sog‘lomroq bo‘lasiz.
            </p>
          </div>
          <ul className="mt-8 space-y-3 text-sm animate-rise" style={{ animationDelay: '120ms' }}>
            {[
              ['target', 'Maqsad va imkoniyatlaringizga mos shaxsiy reja'],
              ['layers', 'Qaysi mushaklar ishlashini ko‘rsatuvchi tana modeli'],
              ['lock', 'Ma’lumotlaringiz faqat shu qurilmada saqlanadi'],
            ].map(([icon, text]) => (
              <li key={text} className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-xl bg-white/5 text-volt-3">
                  <Icon name={icon as 'target'} size={18} />
                </span>
                {text}
              </li>
            ))}
          </ul>
          <Button size="lg" className="mt-10 w-full" iconRight="arrowRight" onClick={() => go(1)}>
            Boshlash — 2 daqiqa
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-xl flex-col px-5 pt-6 pb-6">
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => go(index - 1)} className="flex size-11 items-center justify-center rounded-xl text-mist hover:bg-white/5 hover:text-bone" aria-label="Orqaga">
          <Icon name="chevronLeft" />
        </button>
        <div className="flex-1">
          <ProgressBar value={index / total} label={`Qadam ${index} / ${total}`} />
        </div>
        <span className="w-12 text-right text-xs font-semibold text-mist" aria-hidden="true">
          {index}/{total}
        </span>
      </div>

      <div key={step.key} className="mt-8 flex-1 animate-rise">
        <h1 ref={headingRef} tabIndex={-1} className="font-display text-2xl font-bold outline-none sm:text-3xl">
          {step.title}
        </h1>
        <p className="mt-2 flex gap-2 text-sm text-mist">
          <Icon name="info" size={16} className="mt-0.5 shrink-0 text-volt-3" />
          <span>
            <span className="font-semibold text-bone/80">Nega so‘raymiz? </span>
            {step.why}
          </span>
        </p>
        <form
          className="mt-6"
          onSubmit={(event) => {
            event.preventDefault()
            onNext()
          }}
        >
          {step.render()}
          <button type="submit" className="hidden" aria-hidden="true" tabIndex={-1} />
        </form>
      </div>

      <div className="sticky bottom-0 -mx-5 mt-6 bg-gradient-to-t from-void via-void/95 to-transparent px-5 pt-6 pb-2">
        <div className="flex gap-3">
          {step.key === 'body' ? (
            <Button
              variant="secondary"
              onClick={() => {
                onChange({ heightCm: null, weightKg: null })
                go(index + 1)
              }}
            >
              O‘tkazib yuborish
            </Button>
          ) : null}
          <Button className="flex-1" size="lg" onClick={onNext} disabled={step.key === 'summary' && !step.valid} iconRight={index === total ? 'bolt' : 'arrowRight'}>
            {index === total ? 'Rejani qabul qilish' : 'Davom etish'}
          </Button>
        </div>
      </div>
    </div>
  )
}
