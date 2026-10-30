import { Component, Suspense, lazy, useMemo, useState, type ReactNode } from 'react'
import { MUSCLES, MUSCLE_IDS } from '@/domain/muscles.ts'
import type { MuscleLoad } from '@/domain/progress.ts'
import type { MuscleId, Profile } from '@/domain/types.ts'
import { ESTIMATE_DISCLAIMER } from '@/i18n/uz.ts'
import { useAppStore } from '@/store/AppStore.tsx'
import { useReducedMotion } from '@/lib/motion.ts'
import { Icon } from '../Icon.tsx'
import { Segmented, cx } from '../ui.tsx'
import { BodyMap2D } from './BodyMap2D.tsx'
import { LEGEND, muscleColor } from './colors.ts'
import { MuscleSheet } from './MuscleSheet.tsx'

const BodyModel3D = lazy(() => import('./BodyModel3D.tsx'))

const supportsWebGL = (() => {
  let cached: boolean | null = null
  return () => {
    if (cached !== null) return cached
    try {
      const canvas = document.createElement('canvas')
      cached = Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'))
    } catch {
      cached = false
    }
    return cached
  }
})()

class ModelBoundary extends Component<{ fallback: ReactNode; children: ReactNode; onError: () => void }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch() {
    this.props.onError()
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}

const buildFactor = (profile: Profile | null): number => {
  //
  if (!profile?.heightCm || !profile.weightKg) return 1
  const bmi = profile.weightKg / (profile.heightCm / 100) ** 2
  return Math.max(0.9, Math.min(1.25, bmi / 23))
}

export const MuscleViewer = ({ load, title, compact = false }: { load: MuscleLoad; title: string; compact?: boolean }) => {
  //
  const { state, updateSettings } = useAppStore()
  const reduceMotion = useReducedMotion()
  const [selected, setSelected] = useState<MuscleId | null>(null)
  const [view, setView] = useState<'front' | 'back'>('front')
  const [failed, setFailed] = useState(false)
  const canUse3D = useMemo(() => supportsWebGL(), [])
  const use3D = state.settings.prefer3D && canUse3D && !failed
  const sex = state.profile?.sex ?? 'male'
  const build = buildFactor(state.profile)

  const active = MUSCLE_IDS.filter((id) => (load[id] ?? 0) > 0).sort((a, b) => (load[b] ?? 0) - (load[a] ?? 0))
  const fallback2D = <BodyMap2D load={load} selected={selected} onSelect={setSelected} sex={sex} compact={compact} />

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm font-semibold">{title}</div>
        <div className="flex items-center gap-2">
          {use3D ? (
            <div className="w-36">
              <Segmented
                label="Model tomoni"
                value={view}
                onChange={setView}
                options={[
                  { value: 'front', label: 'Old' },
                  { value: 'back', label: 'Orqa' },
                ]}
              />
            </div>
          ) : null}
          {canUse3D && !failed ? (
            <button
              type="button"
              onClick={() => updateSettings({ prefer3D: !state.settings.prefer3D })}
              className="flex min-h-11 items-center gap-1.5 rounded-xl border border-line px-3 text-xs font-semibold text-mist hover:text-bone"
              aria-pressed={state.settings.prefer3D}
            >
              <Icon name="layers" size={16} />
              {state.settings.prefer3D ? '2D' : '3D'}
            </button>
          ) : null}
        </div>
      </div>

      <div className={cx('grid-lines relative overflow-hidden rounded-2xl border border-line bg-ink/60', use3D && (compact ? 'h-72' : 'h-80 sm:h-96'))}>
        {use3D ? (
          <ModelBoundary fallback={fallback2D} onError={() => setFailed(true)}>
            <Suspense
              fallback={
                <div className="flex h-full items-center justify-center text-sm text-mist" role="status">
                  <span className="mr-2 size-4 animate-spin rounded-full border-2 border-volt border-t-transparent" />
                  3D model yuklanmoqda…
                </div>
              }
            >
              <BodyModel3D
                load={load}
                selected={selected}
                onSelect={setSelected}
                onError={() => setFailed(true)}
                sex={sex}
                build={build}
                view={view}
                onViewChange={setView}
                reduceMotion={reduceMotion}
              />
            </Suspense>
            <div className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/40 px-3 py-1 text-[11px] text-fog">
              Aylantirish uchun suring · mushakka bosing
            </div>
          </ModelBoundary>
        ) : (
          <div className="py-3">{fallback2D}</div>
        )}
      </div>
      {failed ? <p className="mt-2 text-xs text-fog">3D model bu qurilmada ishlamadi — 2D sxema ko‘rsatilmoqda.</p> : null}

      <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-mist" aria-hidden="true">
        {LEGEND.map((item) => (
          <span key={item.label} className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full" style={{ background: muscleColor(item.value) }} />
            {item.label}
          </span>
        ))}
      </div>

      {active.length > 0 ? (
        <ul className="mt-3 flex flex-wrap gap-2" aria-label="Faol mushak guruhlari">
          {active.map((id) => (
            <li key={id}>
              <button
                type="button"
                onClick={() => setSelected(id)}
                className="flex min-h-9 items-center gap-1.5 rounded-full border border-line bg-white/[0.03] px-3 text-xs font-medium hover:border-volt/50"
              >
                <span className="size-2 rounded-full" style={{ background: muscleColor(load[id] ?? 0) }} aria-hidden="true" />
                {MUSCLES[id].name}
                <span className="sr-only">, taxminiy faollik {Math.round((load[id] ?? 0) * 100)}%</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <p className="mt-3 flex gap-1.5 text-[11px] leading-relaxed text-fog">
        <Icon name="info" size={14} className="mt-px shrink-0" />
        {ESTIMATE_DISCLAIMER}
      </p>

      <MuscleSheet muscle={selected} onClose={() => setSelected(null)} />
    </div>
  )
}
