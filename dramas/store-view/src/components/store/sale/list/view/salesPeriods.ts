import type { StoreTranslator } from '@store/store-i18n'
import dayjs, { type Dayjs } from 'dayjs'

export type SalesPeriod = [Dayjs, Dayjs]

function weekStart(date: Dayjs): Dayjs {
  //
  return date.subtract((date.day() + 6) % 7, 'day').startOf('day')
}

export function createSalesPeriodPresets(t: StoreTranslator): { label: string; value: SalesPeriod }[] {
  //
  const today = dayjs()
  const thisWeek = weekStart(today)
  const lastMonth = today.subtract(1, 'month')
  return [
    { label: t('common.today'), value: [today.startOf('day'), today.endOf('day')] },
    { label: t('common.yesterday'), value: [today.subtract(1, 'day').startOf('day'), today.subtract(1, 'day').endOf('day')] },
    { label: t('sales.periodThisWeek'), value: [thisWeek, today.endOf('day')] },
    { label: t('sales.periodLastWeek'), value: [thisWeek.subtract(7, 'day'), thisWeek.subtract(1, 'day').endOf('day')] },
    { label: t('common.thisMonth'), value: [today.startOf('month'), today.endOf('day')] },
    { label: t('analytics.lastMonth'), value: [lastMonth.startOf('month'), lastMonth.endOf('month')] },
  ]
}

export function salesPeriodBounds(period: SalesPeriod): { from: string; to: string } {
  //
  return { from: period[0].startOf('day').toISOString(), to: period[1].endOf('day').toISOString() }
}

export function formatSalesPeriod(period: SalesPeriod): string {
  //
  const [start, end] = period
  return start.isSame(end, 'day') ? start.format('DD.MM.YYYY') : `${start.format('DD.MM.YYYY')} – ${end.format('DD.MM.YYYY')}`
}
