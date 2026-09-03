import type { Resource } from 'i18next'
import type { StoreLocale } from '../locale'
import { enTranslations } from './en'
import { ruTranslations } from './ru'
import { uzCyTranslations } from './uzCy'
import { uzLatnTranslations } from './uzLatn'
import type { TranslationDictionary } from './types'

export type StoreTranslationKey = keyof typeof uzCyTranslations

export const STORE_LOCALES: StoreLocale[] = ['uz-cy', 'uz-la', 'ru', 'en']

export const STORE_TRANSLATIONS: Record<StoreLocale, Record<StoreTranslationKey, string>> = {
  'uz-cy': uzCyTranslations,
  'uz-la': uzLatnTranslations,
  ru: ruTranslations,
  en: enTranslations,
}

function toNamespaces(catalog: TranslationDictionary) {
  //
  return Object.entries(catalog).reduce<Record<string, TranslationDictionary>>(
    (namespaces, [qualifiedKey, value]) => {
      //
      const separatorIndex = qualifiedKey.indexOf('.')
      const namespace = separatorIndex === -1 ? 'common' : qualifiedKey.slice(0, separatorIndex)
      const key = separatorIndex === -1 ? qualifiedKey : qualifiedKey.slice(separatorIndex + 1)
      const current = namespaces[namespace] ?? {}
      current[key] = value
      namespaces[namespace] = current
      return namespaces
    },
    {},
  )
}

export const STORE_NAMESPACES = Array.from(
  new Set(
    Object.keys(uzCyTranslations).map((key) => {
      //
      const separatorIndex = key.indexOf('.')
      return separatorIndex === -1 ? 'common' : key.slice(0, separatorIndex)
    }),
  ),
)

export const STORE_I18N_RESOURCES = Object.fromEntries(
  STORE_LOCALES.map((locale) => [locale, toNamespaces(STORE_TRANSLATIONS[locale])]),
) as Resource

export function resolveStoreTranslationKey(
  key: string,
  fallback: StoreTranslationKey,
): StoreTranslationKey {
  //
  return key in uzCyTranslations ? key as StoreTranslationKey : fallback
}
