import { useEffect, useState, type ReactNode } from 'react'
import { createInstance, type i18n } from 'i18next'
import { I18nextProvider, initReactI18next } from 'react-i18next'
import { STORE_I18N_RESOURCES, STORE_LOCALES, STORE_NAMESPACES } from './catalogs/resources'
import { normalizeStoreLocale, type StoreLocale } from './locale'

interface StoreI18nProviderProps {
  children: ReactNode
  locale: StoreLocale | string
}

function createStoreI18n(locale: StoreLocale): i18n {
  //
  const instance = createInstance()
  void instance.use(initReactI18next).init({
    resources: STORE_I18N_RESOURCES,
    lng: locale,
    fallbackLng: 'uz-cy',
    supportedLngs: STORE_LOCALES,
    ns: STORE_NAMESPACES,
    defaultNS: 'common',
    interpolation: { escapeValue: false, prefix: '{', suffix: '}' },
    returnNull: false,
    initAsync: false,
  })
  return instance
}

export function StoreI18nProvider({ children, locale }: StoreI18nProviderProps) {
  //
  const normalizedLocale = normalizeStoreLocale(locale)
  const [instance] = useState(() => createStoreI18n(normalizedLocale))

  useEffect(() => {
    //
    if (instance.resolvedLanguage !== normalizedLocale) void instance.changeLanguage(normalizedLocale)
  }, [instance, normalizedLocale])

  return <I18nextProvider i18n={instance}>{children}</I18nextProvider>
}
