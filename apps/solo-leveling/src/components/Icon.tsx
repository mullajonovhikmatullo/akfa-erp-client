import type { SVGProps } from 'react'

const PATHS = {
  home: 'M3 10.5 12 3l9 7.5M5 9v11h5v-6h4v6h5V9',
  dumbbell: 'M6.5 6.5v11M3.5 9v6M17.5 6.5v11M20.5 9v6M6.5 12h11',
  chart: 'M4 20V10M10 20V4M16 20v-7M22 20H2',
  user: 'M12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9ZM3.5 21a8.5 8.5 0 0 1 17 0',
  play: 'M7 4.5v15l12-7.5-12-7.5Z',
  check: 'M4.5 12.5 9.5 17.5 19.5 6.5',
  x: 'M6 6l12 12M18 6 6 18',
  chevronLeft: 'M15 5l-7 7 7 7',
  chevronRight: 'M9 5l7 7-7 7',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 7v5l3 2',
  flame: 'M12 22c4 0 7-2.8 7-7 0-3.6-2.4-6-4-8 0 2.5-1.5 4-3 4 .5-3-1-6.5-4-9 0 4-5 6.5-5 13 0 4.2 4 7 9 7Z',
  bolt: 'M13 2 4 14h7l-1 8 9-12h-7l1-8Z',
  swap: 'M7 4 3 8l4 4M3 8h13M17 20l4-4-4-4M21 16H8',
  skip: 'M5 5v14l9-7-9-7ZM18 5v14',
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 11v6M12 7.5v.5',
  alert: 'M12 3 2 20h20L12 3ZM12 10v4M12 17v.5',
  heart: 'M12 20s-7.5-4.5-9-9.5C2 7 4.5 4 7.5 4c2 0 3.5 1 4.5 2.5C13 5 14.5 4 16.5 4 19.5 4 22 7 21 10.5 19.5 15.5 12 20 12 20Z',
  moon: 'M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z',
  trophy: 'M8 4h8v5a4 4 0 0 1-8 0V4ZM8 6H4.5a3 3 0 0 0 3.5 4M16 6h3.5a3 3 0 0 1-3.5 4M12 13v4M8 21h8M9.5 17h5',
  rotate: 'M20 12a8 8 0 1 1-2.3-5.7M20 4v5h-5',
  target: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 16.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9ZM12 12.5a.5.5 0 1 0 0-1',
  spark: 'M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6',
  shield: 'M12 3 4.5 6v5.5c0 4.6 3.2 8.4 7.5 9.5 4.3-1.1 7.5-4.9 7.5-9.5V6L12 3Z',
  gate: 'M4 21V9a8 8 0 0 1 16 0v12M8 21v-9M16 21v-9M12 21V8',
  calendar: 'M4 6h16v15H4V6ZM4 10h16M8 3v4M16 3v4',
  crown: 'M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5L3 8Z',
  star: 'm12 3 2.7 5.6 6.1.8-4.5 4.2 1.1 6.1L12 16.8l-5.4 2.9 1.1-6.1L3.2 9.4l6.1-.8L12 3Z',
  trash: 'M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3',
  download: 'M12 4v11M7 10l5 5 5-5M5 20h14',
  settings: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM19.4 13.5l1.6 1.2-2 3.4-1.9-.7a7 7 0 0 1-1.7 1l-.3 2h-4l-.3-2a7 7 0 0 1-1.7-1l-1.9.7-2-3.4 1.6-1.2a7 7 0 0 1 0-3L3 9.3l2-3.4 1.9.7a7 7 0 0 1 1.7-1l.3-2h4l.3 2a7 7 0 0 1 1.7 1l1.9-.7 2 3.4-1.6 1.2a7 7 0 0 1 0 3Z',
  edit: 'M4 20h4L19 9l-4-4L4 16v4ZM13.5 6.5l4 4',
  pause: 'M8 5v14M16 5v14',
  eye: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12ZM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  lock: 'M6 11h12v10H6V11ZM8.5 11V7.5a3.5 3.5 0 0 1 7 0V11',
  arrowRight: 'M5 12h14M13 6l6 6-6 6',
  layers: 'M12 3 2 8l10 5 10-5-10-5ZM2 13l10 5 10-5M2 17.5l10 5 10-5',
} as const

export type IconName = keyof typeof PATHS

export const Icon = ({ name, size = 20, ...props }: { name: IconName; size?: number } & SVGProps<SVGSVGElement>) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
    {...props}
  >
    <path d={PATHS[name]} />
  </svg>
)
