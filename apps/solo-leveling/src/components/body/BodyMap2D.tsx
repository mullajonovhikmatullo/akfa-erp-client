import type { KeyboardEvent } from 'react'
import { MUSCLES } from '@/domain/muscles.ts'
import type { MuscleLoad } from '@/domain/progress.ts'
import type { MuscleId, Sex } from '@/domain/types.ts'
import { muscleColor } from './colors.ts'

type Shape = { muscle: MuscleId; d: string }

const mirror = (d: string) =>
  d.replace(/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g, (_, x: string, y: string) => `${(200 - Number(x)).toFixed(1)},${y}`)

const pair = (muscle: MuscleId, d: string): Shape[] => [
  { muscle, d },
  { muscle, d: mirror(d) },
]

const FRONT: Shape[] = [
  ...pair('shoulders', 'M70,92 C58,92 50,102 50,116 C56,112 64,112 72,116 C74,106 76,98 70,92 Z'),
  ...pair('chest', 'M98,98 L76,98 C72,104 72,118 76,128 C84,134 94,134 98,130 Z'),
  ...pair('biceps', 'M52,120 C46,134 46,150 50,162 C56,160 62,156 64,150 C66,138 64,126 60,118 Z'),
  ...pair('forearms', 'M48,168 C42,184 40,202 42,216 C46,218 50,218 52,216 C58,200 62,186 62,170 C58,168 52,166 48,168 Z'),
  { muscle: 'abs', d: 'M88,136 L112,136 C114,160 114,186 110,206 C104,212 96,212 90,206 C86,186 86,160 88,136 Z' },
  ...pair('obliques', 'M78,138 L86,140 C84,162 86,186 88,204 C82,200 76,190 74,176 C74,162 76,148 78,138 Z'),
  ...pair('quads', 'M78,222 C70,246 68,276 72,304 C78,310 88,310 94,304 C98,280 98,250 96,226 C90,220 84,218 78,222 Z'),
  ...pair('calves', 'M74,326 C70,344 70,362 74,380 C78,382 82,382 84,380 C86,362 86,344 84,328 Z'),
  { muscle: 'traps', d: 'M84,82 C90,88 96,90 100,90 C104,90 110,88 116,82 C112,92 106,96 100,96 C94,96 88,92 84,82 Z' },
]

const BACK: Shape[] = [
  { muscle: 'traps', d: 'M100,80 C92,84 80,90 72,94 C82,100 92,110 100,124 C108,110 118,100 128,94 C120,90 108,84 100,80 Z' },
  ...pair('shoulders', 'M70,92 C58,92 50,102 50,116 C56,112 64,112 72,116 C74,106 76,98 70,92 Z'),
  ...pair('upperBack', 'M98,128 C92,116 84,106 76,102 C76,112 80,124 86,134 C90,138 96,138 98,136 Z'),
  ...pair('lats', 'M76,118 C72,134 74,156 82,178 C88,186 94,186 98,180 L98,144 C92,142 86,136 80,124 Z'),
  ...pair('triceps', 'M52,120 C46,134 46,150 50,162 C56,160 62,156 64,150 C66,138 64,126 60,118 Z'),
  ...pair('forearms', 'M48,168 C42,184 40,202 42,216 C46,218 50,218 52,216 C58,200 62,186 62,170 C58,168 52,166 48,168 Z'),
  { muscle: 'lowerBack', d: 'M90,184 C94,190 106,190 110,184 L112,208 C106,212 94,212 88,208 Z' },
  ...pair('glutes', 'M98,212 C86,210 76,216 74,230 C74,244 84,250 98,248 Z'),
  ...pair('hamstrings', 'M76,252 C70,272 70,292 74,310 C80,314 90,314 94,308 C98,288 98,268 96,252 C90,250 82,250 76,252 Z'),
  ...pair('calves', 'M74,322 C68,338 68,356 74,372 C80,376 86,376 88,370 C90,354 88,336 84,322 Z'),
]

const SILHOUETTE =
  'M100,30 C112,30 120,40 120,54 C120,66 114,74 108,78 L108,84 C120,88 134,90 146,96 C154,104 154,118 150,130 C156,150 160,168 158,190 C160,204 160,214 158,222 L150,222 C148,212 146,200 144,190 C140,172 136,156 134,140 L128,152 C130,176 128,196 126,212 C132,240 132,276 126,310 C128,340 128,368 124,396 L108,396 C108,370 106,340 108,312 C106,282 104,250 100,232 C96,250 94,282 92,312 C94,340 92,370 92,396 L76,396 C72,368 72,340 74,310 C68,276 68,240 74,212 C72,196 70,176 72,152 L66,140 C64,156 60,172 56,190 C54,200 52,212 50,222 L42,222 C40,214 40,204 42,190 C40,168 44,150 50,130 C46,118 46,104 54,96 C66,90 80,88 92,84 L92,78 C86,74 80,66 80,54 C80,40 88,30 100,30 Z'

export const BodyMap2D = ({
  load,
  selected,
  onSelect,
  sex = 'male',
  compact = false,
}: {
  load: MuscleLoad
  selected?: MuscleId | null
  onSelect?: (muscle: MuscleId) => void
  sex?: Sex
  compact?: boolean
}) => {
  //
  const renderSide = (shapes: Shape[], label: string) => (
    <figure className="flex flex-1 flex-col items-center">
      <svg
        viewBox="30 20 140 390"
        className={compact ? 'h-56 w-auto' : 'h-72 w-auto sm:h-80'}
        role="group"
        aria-label={`Tana sxemasi — ${label}`}
      >
        <defs>
          <filter id="muscle-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path
          d={SILHOUETTE}
          fill="#16161f"
          stroke="rgb(255 255 255 / 0.08)"
          strokeWidth="1"
          transform={sex === 'female' ? 'translate(100 0) scale(0.94 1) translate(-100 0)' : undefined}
        />
        {shapes.map((shape, index) => {
          const value = load[shape.muscle] ?? 0
          const info = MUSCLES[shape.muscle]
          const isSelected = selected === shape.muscle
          const handleKey = (event: KeyboardEvent<SVGPathElement>) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              onSelect?.(shape.muscle)
            }
          }
          const firstOfMuscle = shapes.findIndex((item) => item.muscle === shape.muscle) === index
          return (
            <path
              key={`${shape.muscle}-${index}`}
              d={shape.d}
              fill={muscleColor(value)}
              stroke={isSelected ? '#e9d5ff' : 'rgb(255 255 255 / 0.12)'}
              strokeWidth={isSelected ? 2 : 0.8}
              filter={value > 0.55 ? 'url(#muscle-glow)' : undefined}
              className={onSelect ? 'cursor-pointer transition-[fill] duration-500 outline-none hover:brightness-125 focus-visible:stroke-white' : ''}
              role={onSelect && firstOfMuscle ? 'button' : undefined}
              tabIndex={onSelect && firstOfMuscle ? 0 : -1}
              aria-label={onSelect && firstOfMuscle ? `${info.name}: taxminiy faollik ${Math.round(value * 100)}%` : undefined}
              aria-hidden={onSelect && firstOfMuscle ? undefined : true}
              onClick={onSelect ? () => onSelect(shape.muscle) : undefined}
              onKeyDown={onSelect ? handleKey : undefined}
            />
          )
        })}
      </svg>
      <figcaption className="mt-1 text-xs tracking-widest text-fog uppercase">{label}</figcaption>
    </figure>
  )

  return (
    <div className="flex items-start justify-center gap-2">
      {renderSide(FRONT, 'Old')}
      {renderSide(BACK, 'Orqa')}
    </div>
  )
}
