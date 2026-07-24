import type { LangStrings } from '../api/types'

export type LingoValues = Record<string, string | number | boolean | null | undefined>

const pickText = (value: LangStrings, langCode = 'default') => {
  //
  if (typeof value === 'string') return value
  return value.langStringMap[langCode] ?? value.langStringMap[value.defaultLangCode] ?? ''
}

export const l = (value: LangStrings, values?: LingoValues, langCode?: string) => {
  //
  const template = pickText(value, langCode)
  if (!values) return template

  return Object.entries(values).reduce(
    (text, [key, replacement]) => text.replaceAll(`{${key}}`, String(replacement ?? '')),
    template,
  )
}
