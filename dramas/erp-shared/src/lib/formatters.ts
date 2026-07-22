import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import type { Currency } from '../core/domain'

dayjs.extend(relativeTime)

export function formatUZS(n: number): string {
  //
  if (Number.isNaN(n)) return '—'
  const sign = n < 0 ? '-' : ''
  const abs = Math.abs(Math.round(n))
  return `${sign}${abs.toLocaleString('ru-RU').replace(/,/g, ' ')} so'm`
}

export function formatUSD(n: number): string {
  //
  if (Number.isNaN(n)) return '—'
  const sign = n < 0 ? '-' : ''
  return `${sign}$${Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

export function formatCompactUZS(n: number): string {
  //
  if (n == null) return '—'
  const abs = Math.abs(n)
  const sign = n < 0 ? '-' : ''
  if (abs >= 1e9) return `${sign}${(abs / 1e9).toFixed(2)} B so'm`
  if (abs >= 1e6) return `${sign}${(abs / 1e6).toFixed(1)} M so'm`
  if (abs >= 1e3) return `${sign}${(abs / 1e3).toFixed(0)}K so'm`
  return `${sign}${abs} so'm`
}

export function formatMoney(n: number, currency: Currency, compact = false): string {
  //
  if (currency === 'USD') return formatUSD(n)
  return compact ? formatCompactUZS(n) : formatUZS(n)
}

export function toUZS(amount: number, currency: Currency, rate: number): number {
  //
  return currency === 'USD' ? amount * rate : amount
}

export function toUSD(amount: number, currency: Currency, rate: number): number {
  //
  return currency === 'UZS' ? amount / rate : amount
}

export function formatDate(d: string | null | undefined): string {
  //
  if (!d) return '—'
  return dayjs(d).format('DD MMM YYYY')
}

export function formatDateTime(d: string | null | undefined): string {
  //
  if (!d) return '—'
  return dayjs(d).format('DD MMM, HH:mm')
}

export function formatRelative(d: string | null | undefined): string {
  //
  if (!d) return '—'
  return dayjs(d).fromNow()
}
