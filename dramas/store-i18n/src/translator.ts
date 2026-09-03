import type { StoreTranslationKey } from './catalogs/resources'

export type StoreTranslationValue = string | number | boolean | null | undefined
export type StoreTranslationValues = Record<string, StoreTranslationValue>
export type StoreTranslator = (key: StoreTranslationKey, values?: StoreTranslationValues) => string
