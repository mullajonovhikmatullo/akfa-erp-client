import type { StoreTranslationKey } from './catalogs/resources'

export type StoreTranslationValue = string | number | boolean | null | undefined
export type StoreTranslationValues = Record<string, StoreTranslationValue>
export type StoreTranslator = (key: StoreTranslationKey, values?: StoreTranslationValues) => string

export function interpolateStoreTranslation(template: string, values?: StoreTranslationValues) {
  //
  if (!values) return template
  return Object.entries(values).reduce(
    (result, [key, value]) => result.replaceAll(`{${key}}`, value == null ? '' : String(value)),
    template,
  )
}
