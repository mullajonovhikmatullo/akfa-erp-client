import { useEffect, useState } from 'react'
import type { DemoKind } from '@/domain/types.ts'
import { useReducedMotion } from '@/lib/motion.ts'

type Point = [number, number]

interface Pose {
  head: Point
  sh: Point
  el: Point
  ha: Point
  hip: Point
  kn: Point
  ft: Point
  kn2?: Point
  ft2?: Point
}

const STAND: Pose = { head: [50, 13], sh: [50, 26], el: [51, 40], ha: [52, 53], hip: [50, 54], kn: [50, 73], ft: [50, 92] }

const lift = (pose: Pose, dy: number, keep: Array<keyof Pose> = []): Pose =>
  Object.fromEntries(
    Object.entries(pose).map(([key, value]) => [key, keep.includes(key as keyof Pose) ? value : [value[0], value[1] - dy]]),
  ) as unknown as Pose

const POSES: Record<DemoKind, [Pose, Pose]> = {
  squat: [
    { ...STAND, el: [58, 32], ha: [68, 32] },
    { head: [57, 31], sh: [53, 43], el: [62, 44], ha: [73, 43], hip: [38, 64], kn: [58, 70], ft: [52, 92] },
  ],
  lunge: [
    { ...STAND, kn2: [50, 73], ft2: [50, 92] },
    { head: [50, 33], sh: [50, 46], el: [51, 59], ha: [52, 70], hip: [50, 70], kn: [66, 76], ft: [66, 92], kn2: [44, 89], ft2: [28, 91] },
  ],
  hinge: [
    STAND,
    { head: [77, 36], sh: [67, 41], el: [67, 54], ha: [67, 66], hip: [43, 52], kn: [48, 72], ft: [50, 92] },
  ],
  pushup: [
    { head: [81, 57], sh: [72, 62], el: [72, 76], ha: [72, 90], hip: [46, 74], kn: [30, 82], ft: [14, 90] },
    { head: [82, 76], sh: [72, 80], el: [61, 79], ha: [72, 90], hip: [46, 83], kn: [30, 87], ft: [14, 90] },
  ],
  press: [
    { ...STAND, el: [59, 36], ha: [55, 25] },
    { ...STAND, el: [54, 14], ha: [54, 2] },
  ],
  row: [
    { head: [73, 33], sh: [64, 39], el: [64, 52], ha: [64, 65], hip: [42, 54], kn: [46, 73], ft: [48, 92] },
    { head: [73, 33], sh: [64, 39], el: [53, 37], ha: [60, 49], hip: [42, 54], kn: [46, 73], ft: [48, 92] },
  ],
  pullup: [
    { head: [46, 19], sh: [50, 25], el: [53, 14], ha: [54, 4], hip: [50, 52], kn: [51, 70], ft: [50, 88] },
    { head: [45, 5], sh: [50, 13], el: [61, 14], ha: [54, 4], hip: [50, 40], kn: [52, 58], ft: [50, 76] },
  ],
  plank: [
    { head: [79, 66], sh: [70, 72], el: [70, 88], ha: [81, 88], hip: [44, 75], kn: [30, 81], ft: [14, 87] },
    { head: [79, 65], sh: [70, 72], el: [70, 88], ha: [81, 88], hip: [44, 72], kn: [30, 79], ft: [14, 87] },
  ],
  crunch: [
    { head: [77, 84], sh: [66, 86], el: [72, 80], ha: [78, 76], hip: [40, 86], kn: [30, 70], ft: [18, 86] },
    { head: [70, 68], sh: [62, 75], el: [68, 70], ha: [74, 65], hip: [40, 86], kn: [40, 66], ft: [26, 74] },
  ],
  curl: [
    { ...STAND, el: [51, 40], ha: [53, 54] },
    { ...STAND, el: [51, 40], ha: [60, 29] },
  ],
  calf: [STAND, lift(STAND, 5, ['ft'])],
  cardio: [
    { ...STAND, el: [44, 36], ha: [50, 28], kn2: [62, 60], ft2: [58, 76] },
    { ...STAND, el: [58, 36], ha: [52, 28], kn: [62, 60], ft: [58, 76], kn2: [50, 73], ft2: [50, 92] },
  ],
  bridge: [
    { head: [81, 86], sh: [70, 88], el: [62, 90], ha: [54, 90], hip: [46, 88], kn: [34, 72], ft: [24, 90] },
    { head: [81, 86], sh: [70, 87], el: [62, 90], ha: [54, 90], hip: [48, 72], kn: [32, 68], ft: [24, 90] },
  ],
  stretch: [
    { head: [75, 58], sh: [66, 64], el: [66, 76], ha: [66, 88], hip: [38, 66], kn: [38, 88], ft: [18, 88] },
    { head: [72, 72], sh: [66, 62], el: [66, 75], ha: [66, 88], hip: [38, 62], kn: [38, 88], ft: [18, 88] },
  ],
}

const lerp = (a: Point, b: Point, t: number): Point => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]

const interpolate = (a: Pose, b: Pose, t: number): Pose => ({
  head: lerp(a.head, b.head, t),
  sh: lerp(a.sh, b.sh, t),
  el: lerp(a.el, b.el, t),
  ha: lerp(a.ha, b.ha, t),
  hip: lerp(a.hip, b.hip, t),
  kn: lerp(a.kn, b.kn, t),
  ft: lerp(a.ft, b.ft, t),
  kn2: lerp(a.kn2 ?? a.kn, b.kn2 ?? b.kn, t),
  ft2: lerp(a.ft2 ?? a.ft, b.ft2 ?? b.ft, t),
})

const Figure = ({ pose, ghost = false }: { pose: Pose; ghost?: boolean }) => {
  //
  const stroke = ghost ? 'rgb(255 255 255 / 0.14)' : 'url(#demo-gradient)'
  const line = (a: Point, b: Point, width = 4.2) => (
    <line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke={stroke} strokeWidth={width} strokeLinecap="round" />
  )
  const kn2 = pose.kn2 ?? pose.kn
  const ft2 = pose.ft2 ?? pose.ft
  return (
    <g>
      {line(pose.hip, kn2, 3.6)}
      {line(kn2, ft2, 3.6)}
      {line(pose.sh, pose.hip, 5.5)}
      {line(pose.hip, pose.kn)}
      {line(pose.kn, pose.ft)}
      {line(pose.sh, pose.el, 3.6)}
      {line(pose.el, pose.ha, 3.4)}
      <circle cx={pose.head[0]} cy={pose.head[1]} r={6} fill={ghost ? 'rgb(255 255 255 / 0.1)' : '#c4b5fd'} />
    </g>
  )
}

export const ExerciseDemo = ({ kind, label, className = 'h-44' }: { kind: DemoKind; label: string; className?: string }) => {
  //
  const reduce = useReducedMotion()
  const [t, setT] = useState(0)
  const [a, b] = POSES[kind]

  useEffect(() => {
    if (reduce) return undefined
    let frame = 0
    let last = 0
    const start = performance.now()
    const loop = (now: number) => {
      frame = requestAnimationFrame(loop)
      if (now - last < 33) return
      last = now
      setT((Math.sin(((now - start) / 1000) * Math.PI * 0.75 - Math.PI / 2) + 1) / 2)
    }
    frame = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frame)
  }, [reduce])

  return (
    <figure className={`grid-lines relative overflow-hidden rounded-2xl border border-line bg-ink/70 ${className}`}>
      <svg viewBox="0 -4 100 100" className="h-full w-full" role="img" aria-label={`Texnika ko‘rsatmasi: ${label}`}>
        <defs>
          <linearGradient id="demo-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#c4b5fd" />
            <stop offset="1" stopColor="#a855f7" />
          </linearGradient>
        </defs>
        <line x1="4" y1="94" x2="96" y2="94" stroke="rgb(255 255 255 / 0.12)" strokeWidth="1" />
        {kind === 'pullup' ? <line x1="30" y1="3" x2="78" y2="3" stroke="rgb(255 255 255 / 0.35)" strokeWidth="2" strokeLinecap="round" /> : null}
        {reduce ? (
          <>
            <Figure pose={a} ghost />
            <Figure pose={b} />
          </>
        ) : (
          <>
            <Figure pose={a} ghost />
            <Figure pose={interpolate(a, b, t)} />
          </>
        )}
      </svg>
      <figcaption className="absolute top-2 left-3 text-[10px] tracking-[0.2em] text-fog uppercase">
        {reduce ? 'Boshlanish → yakun' : 'Harakat namunasi'}
      </figcaption>
    </figure>
  )
}
