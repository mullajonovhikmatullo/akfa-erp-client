import { useEffect, useState } from 'react'
import { completionRatio } from '@/domain/adaptation.ts'
import { ACHIEVEMENTS, formatDuration } from '@/domain/progress.ts'
import { GAME_DISCLAIMER } from '@/i18n/uz.ts'
import type { FinishResult } from '@/store/AppStore.tsx'
import { useReducedMotion } from '@/lib/motion.ts'
import { Icon, type IconName } from '@/components/Icon.tsx'
import { Button, Notice } from '@/components/ui.tsx'

const useCountUp = (target: number, enabled: boolean) => {
  //
  const [value, setValue] = useState(enabled ? 0 : target)
  useEffect(() => {
    if (!enabled) {
      setValue(target)
      return undefined
    }
    let frame = 0
    const start = performance.now()
    const loop = (now: number) => {
      const t = Math.min(1, (now - start) / 900)
      setValue(Math.round(target * (1 - (1 - t) ** 3)))
      if (t < 1) frame = requestAnimationFrame(loop)
    }
    frame = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frame)
  }, [target, enabled])
  return value
}

const ADJUSTMENT_TONE = { safety: 'danger', decrease: 'warn', return: 'info', increase: 'info', hold: 'info', start: 'info', profile: 'info' } as const

export const SessionResult = ({ result, onDone }: { result: FinishResult; onDone: () => void }) => {
  //
  const reduce = useReducedMotion()
  const xp = useCountUp(result.session.xp, !reduce)
  const leveledUp = result.levelAfter > result.levelBefore
  const unlocked = ACHIEVEMENTS.filter((item) => result.newAchievements.includes(item.id))

  return (
    <div className="relative mx-auto flex min-h-dvh w-full max-w-xl flex-col items-center overflow-hidden px-5 pt-14 pb-10 text-center">
      <div className="pointer-events-none absolute top-0 left-1/2 size-[520px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-volt/30 blur-[120px]" aria-hidden="true" />
      {!reduce ? (
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          {Array.from({ length: 18 }, (_, index) => (
            <span
              key={index}
              className="absolute size-1.5 animate-float rounded-full bg-volt-3/70"
              style={{ left: `${(index * 53) % 100}%`, top: `${(index * 37) % 70}%`, animationDelay: `${(index % 6) * 0.4}s`, opacity: 0.3 + (index % 4) * 0.15 }}
            />
          ))}
        </div>
      ) : null}

      <p className="relative text-xs font-semibold tracking-[0.3em] text-volt-3 uppercase animate-rise">Vazifa bajarildi</p>
      <h1 className="relative mt-3 font-display text-3xl font-extrabold animate-rise">{result.session.title}</h1>

      <div className="relative mt-8 animate-pop">
        <div className="font-display text-6xl font-extrabold text-gradient tabular-nums" aria-label={`${result.session.xp} tajriba balli olindi`}>
          +{xp}
        </div>
        <div className="mt-1 text-sm tracking-widest text-mist uppercase">tajriba balli</div>
      </div>

      {leveledUp ? (
        <div className="relative mt-8 w-full animate-pop rounded-3xl border border-volt/50 bg-gradient-to-br from-volt/25 to-blood/15 p-5 shadow-glow" role="status" style={{ animationDelay: '0.4s' }}>
          <div className="text-xs font-semibold tracking-[0.3em] text-volt-3 uppercase">Daraja oshdi!</div>
          <div className="mt-2 flex items-center justify-center gap-4 font-display text-4xl font-extrabold">
            <span className="text-mist">{result.levelBefore}</span>
            <Icon name="arrowRight" size={28} className="text-volt-3" />
            <span>{result.levelAfter}</span>
          </div>
        </div>
      ) : null}

      <div className="relative mt-8 grid w-full grid-cols-3 gap-2">
        {[
          ['Vaqt', formatDuration(result.session.durationSec)],
          ['Bajarildi', `${Math.round(completionRatio(result.session) * 100)}%`],
          ['Mashqlar', String(result.session.exercises.filter((item) => item.status !== 'skipped').length)],
        ].map(([label, value]) => (
          <div key={label} className="glass rounded-2xl p-3">
            <div className="font-display text-lg font-bold">{value}</div>
            <div className="text-[11px] text-fog">{label}</div>
          </div>
        ))}
      </div>

      {unlocked.length > 0 ? (
        <div className="relative mt-6 w-full space-y-2">
          {unlocked.map((item, index) => (
            <div key={item.id} className="glass flex animate-pop items-center gap-3 rounded-2xl p-4 text-left" style={{ animationDelay: `${0.6 + index * 0.15}s` }}>
              <span className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-volt to-blood text-white">
                <Icon name={item.icon as IconName} />
              </span>
              <span>
                <span className="block text-xs text-volt-3">Yangi yutuq</span>
                <span className="block font-semibold">{item.title}</span>
              </span>
            </div>
          ))}
        </div>
      ) : null}

      <div className="relative mt-6 w-full text-left">
        <Notice tone={ADJUSTMENT_TONE[result.adjustment.kind]} title="Reja qanday o‘zgardi">
          {result.adjustment.message}
        </Notice>
      </div>

      <p className="relative mt-4 text-[11px] text-fog">{GAME_DISCLAIMER}</p>
      <Button size="lg" className="relative mt-8 w-full" onClick={onDone}>
        Bosh sahifaga
      </Button>
    </div>
  )
}
