const BASE: [number, number, number] = [36, 36, 48]
const MID: [number, number, number] = [139, 92, 246]
const HIGH: [number, number, number] = [236, 72, 153]

const mix = (a: [number, number, number], b: [number, number, number], t: number): [number, number, number] => [
  Math.round(a[0] + (b[0] - a[0]) * t),
  Math.round(a[1] + (b[1] - a[1]) * t),
  Math.round(a[2] + (b[2] - a[2]) * t),
]

export const muscleRgb = (value: number): [number, number, number] => {
  //
  const v = Math.max(0, Math.min(1, value))
  if (v === 0) return BASE
  if (v < 0.6) return mix(BASE, MID, 0.35 + (v / 0.6) * 0.65)
  return mix(MID, HIGH, (v - 0.6) / 0.4)
}

export const muscleColor = (value: number): string => {
  //
  const [r, g, b] = muscleRgb(value)
  return `rgb(${r} ${g} ${b})`
}

export const LEGEND = [
  { label: 'Ishlamaydi', value: 0 },
  { label: 'Yordamchi', value: 0.4 },
  { label: 'Asosiy', value: 1 },
]
