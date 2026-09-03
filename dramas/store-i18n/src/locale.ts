export type StoreLocale = 'uz-cy' | 'uz-la' | 'ru' | 'en'

export function normalizeStoreLocale(locale: string): StoreLocale {
  //
  if (locale === 'uz') return 'uz-la'
  if (['uz-cy', 'uz-la', 'ru', 'en'].includes(locale)) return locale as StoreLocale
  return 'uz-cy'
}
