import type { Prescription } from '@/domain/types.ts'

export const formatDose = (item: Pick<Prescription, 'sets' | 'reps' | 'seconds'>): string =>
  item.seconds !== null ? `${item.sets} × ${item.seconds} s` : `${item.sets} × ${item.reps ?? 0} takror`

export const pluralizeSessions = (count: number) => `${count} ta mashg‘ulot`
