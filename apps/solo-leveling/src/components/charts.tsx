import { useState } from 'react'

export interface ChartPoint {
  label: string
  value: number
  detail: string
}

const Tooltip = ({ x, y, text }: { x: number; y: number; text: string }) => (
  <div
    className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-lg border border-line bg-graphite-2 px-2.5 py-1.5 text-xs whitespace-nowrap text-bone shadow-lg"
    style={{ left: `${x}%`, top: `${y}%` }}
    role="status"
  >
    {text}
  </div>
)

const DataTable = ({ caption, points, unit }: { caption: string; points: ChartPoint[]; unit: string }) => (
  <table className="sr-only">
    <caption>{caption}</caption>
    <thead>
      <tr>
        <th scope="col">Davr</th>
        <th scope="col">{unit}</th>
      </tr>
    </thead>
    <tbody>
      {points.map((point) => (
        <tr key={point.label}>
          <td>{point.label}</td>
          <td>{point.value}</td>
        </tr>
      ))}
    </tbody>
  </table>
)

export const BarChart = ({ points, caption, unit, target }: { points: ChartPoint[]; caption: string; unit: string; target?: number }) => {
  //
  const [hover, setHover] = useState<number | null>(null)
  const max = Math.max(1, target ?? 0, ...points.map((point) => point.value))
  const height = 120
  const slot = 100 / points.length
  const barWidth = Math.min(slot * 0.56, 9)
  const active = hover === null ? undefined : points[hover]

  return (
    <div className="relative">
      <svg viewBox={`0 0 100 ${height + 16}`} preserveAspectRatio="none" className="h-44 w-full" aria-hidden="true">
        {[0.5, 1].map((ratio) => (
          <line key={ratio} x1="0" x2="100" y1={height - ratio * height + 2} y2={height - ratio * height + 2} stroke="rgb(255 255 255 / 0.06)" strokeWidth="0.3" vectorEffect="non-scaling-stroke" />
        ))}
        <line x1="0" x2="100" y1={height + 2} y2={height + 2} stroke="rgb(255 255 255 / 0.14)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        {target ? (
          <line
            x1="0"
            x2="100"
            y1={height - (target / max) * height + 2}
            y2={height - (target / max) * height + 2}
            stroke="#c4b5fd"
            strokeDasharray="3 3"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
            opacity="0.6"
          />
        ) : null}
        {points.map((point, index) => {
          const h = (point.value / max) * height
          const x = index * slot + (slot - barWidth) / 2
          return (
            <g key={point.label}>
              {h > 0 ? (
                <path
                  d={`M${x},${height + 2} L${x},${height + 2 - h + 1.5} Q${x},${height + 2 - h} ${x + 1.5},${height + 2 - h} L${x + barWidth - 1.5},${height + 2 - h} Q${x + barWidth},${height + 2 - h} ${x + barWidth},${height + 2 - h + 1.5} L${x + barWidth},${height + 2} Z`}
                  fill={hover === index ? '#c4b5fd' : '#8b5cf6'}
                  className="transition-[fill]"
                />
              ) : null}
              <rect x={index * slot} y="0" width={slot} height={height + 4} fill="transparent" onMouseEnter={() => setHover(index)} onMouseLeave={() => setHover(null)} style={{ pointerEvents: 'all' }} />
            </g>
          )
        })}
      </svg>
      <div className="mt-1 flex text-[10px] text-fog" aria-hidden="true">
        {points.map((point, index) => (
          <span key={point.label} className="flex-1 truncate text-center" style={{ visibility: points.length > 8 && index % 2 ? 'hidden' : 'visible' }}>
            {point.label}
          </span>
        ))}
      </div>
      {active && hover !== null ? <Tooltip x={hover * slot + slot / 2} y={Math.max(8, 100 - ((active.value / max) * height * 100) / (height + 16) - 6)} text={active.detail} /> : null}
      {target ? <div className="mt-2 text-[11px] text-fog">Uzuq chiziq — haftalik maqsad ({target} ta)</div> : null}
      <DataTable caption={caption} points={points} unit={unit} />
    </div>
  )
}

export const LineChart = ({ points, caption, unit }: { points: ChartPoint[]; caption: string; unit: string }) => {
  //
  const [hover, setHover] = useState<number | null>(null)
  const values = points.map((point) => point.value)
  const max = Math.max(...values)
  const min = Math.min(...values)
  const span = Math.max(1, max - min)
  const height = 100
  const xAt = (index: number) => (points.length === 1 ? 50 : 4 + (index / (points.length - 1)) * 92)
  const yAt = (value: number) => 90 - ((value - min) / span) * 75
  const path = points.map((point, index) => `${index === 0 ? 'M' : 'L'}${xAt(index)},${yAt(point.value)}`).join(' ')
  const active = hover === null ? undefined : points[hover]

  return (
    <div
      className="relative"
      onMouseMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect()
        const ratio = (event.clientX - rect.left) / rect.width
        const index = Math.round(((ratio * 100 - 4) / 92) * (points.length - 1))
        setHover(Math.max(0, Math.min(points.length - 1, index)))
      }}
      onMouseLeave={() => setHover(null)}
    >
      <svg viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" className="h-40 w-full" aria-hidden="true">
        <line x1="0" x2="100" y1="95" y2="95" stroke="rgb(255 255 255 / 0.14)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        {active && hover !== null ? <line x1={xAt(hover)} x2={xAt(hover)} y1="5" y2="95" stroke="rgb(255 255 255 / 0.2)" strokeWidth="1" vectorEffect="non-scaling-stroke" /> : null}
        <path d={path} fill="none" stroke="#a855f7" strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" />
      </svg>
      <div className="pointer-events-none absolute inset-0">
        {points.map((point, index) => (
          <span
            key={`${point.label}-${index}`}
            className="absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-graphite bg-volt-2"
            style={{ left: `${xAt(index)}%`, top: `${yAt(point.value)}%`, transform: `translate(-50%, -50%) scale(${hover === index ? 1.4 : 1})` }}
          />
        ))}
      </div>
      <div className="mt-1 flex justify-between text-[10px] text-fog" aria-hidden="true">
        <span>{points[0]?.label}</span>
        <span>{points.at(-1)?.label}</span>
      </div>
      {active && hover !== null ? <Tooltip x={xAt(hover)} y={yAt(active.value) - 6} text={active.detail} /> : null}
      <DataTable caption={caption} points={points} unit={unit} />
    </div>
  )
}
