import { useCallback } from 'react'
import { useUIStore } from '@/app/stores/ui.store'
import { normalizeLang, type Lang } from './lang'
import {
  enTranslations,
  ruTranslations,
  uzCyTranslations,
  uzLatnTranslations,
  type TranslationDictionary,
} from './translations'

export const TRANSLATIONS: Record<Lang, TranslationDictionary> = {
  'uz-cy': uzCyTranslations,
  'uz-la': uzLatnTranslations,
  ru: ruTranslations,
  en: enTranslations,
}

export function useT() {
  //
  const lang = useUIStore((state) => state.lang)
  const resolvedLang = normalizeLang(lang)

  return useCallback(
    (key: string) => TRANSLATIONS[resolvedLang]?.[key] ?? TRANSLATIONS['uz-cy'][key] ?? key,
    [resolvedLang],
  )
}
