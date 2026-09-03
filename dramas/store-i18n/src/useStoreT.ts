import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { STORE_NAMESPACES, STORE_TRANSLATIONS, type StoreTranslationKey } from './catalogs/resources'
import type { StoreTranslator, StoreTranslationValues } from './translator'

function splitTranslationKey(key: StoreTranslationKey) {
  //
  const separatorIndex = key.indexOf('.')
  if (separatorIndex === -1) return { namespace: 'common', key }
  return {
    namespace: key.slice(0, separatorIndex),
    key: key.slice(separatorIndex + 1),
  }
}

export function useStoreT(): StoreTranslator {
  //
  const { t, i18n } = useTranslation(STORE_NAMESPACES)

  return useCallback(
    (qualifiedKey: StoreTranslationKey, values?: StoreTranslationValues) => {
      //
      const locale = i18n.resolvedLanguage
      if (!(qualifiedKey in STORE_TRANSLATIONS['uz-cy'])) {
        if (locale && locale in STORE_TRANSLATIONS) {
          return STORE_TRANSLATIONS[locale as keyof typeof STORE_TRANSLATIONS]['common.other']
        }
        return STORE_TRANSLATIONS['uz-cy']['common.other']
      }

      const { namespace, key } = splitTranslationKey(qualifiedKey)
      const translated = t(key, { ...values, ns: namespace })
      if (translated !== key) return translated

      if (locale && locale in STORE_TRANSLATIONS) {
        const localized = STORE_TRANSLATIONS[locale as keyof typeof STORE_TRANSLATIONS][qualifiedKey]
        if (localized) return localized
      }
      return STORE_TRANSLATIONS['uz-cy'][qualifiedKey]
    },
    [i18n.resolvedLanguage, t],
  )
}
