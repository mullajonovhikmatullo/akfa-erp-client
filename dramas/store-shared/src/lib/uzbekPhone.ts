export const UZBEK_MOBILE_CODES = ['33', '50', '77', '88', '90', '91', '93', '94', '95', '97', '98', '99'] as const

export function getUzbekNationalDigits(value: string) {
  const digits = value.replace(/\D/g, '')
  if (digits.startsWith('998')) return digits.slice(3, 12)
  if (digits.startsWith('0')) return digits.slice(1, 10)
  return digits.slice(0, 9)
}

export function normalizeUzbekPhone(value: string) {
  const nationalDigits = getUzbekNationalDigits(value)
  return nationalDigits ? `+998${nationalDigits}` : ''
}

export function formatUzbekPhone(value: string) {
  const digits = getUzbekNationalDigits(value)
  return [digits.slice(0, 2), digits.slice(2, 5), digits.slice(5, 7), digits.slice(7, 9)].filter(Boolean).join(' ')
}

export function isValidUzbekMobilePhone(value: string) {
  return /^\+998\d{9}$/.test(value) && UZBEK_MOBILE_CODES.includes(value.slice(4, 6) as (typeof UZBEK_MOBILE_CODES)[number])
}
