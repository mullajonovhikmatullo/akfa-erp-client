import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { languageLocales, translations, type Language } from './translations';
import type { TranslationDictionary } from './types';

const STORAGE_KEY = 'mavion-landing-language';
const DEFAULT_LANGUAGE: Language = 'uz';

type I18nContextValue = {
  language: Language;
  locale: string;
  t: TranslationDictionary;
  setLanguage: (language: Language) => void;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function getInitialLanguage(): Language {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE;

  try {
    const storedLanguage = window.localStorage.getItem(STORAGE_KEY);
    return storedLanguage && storedLanguage in translations ? (storedLanguage as Language) : DEFAULT_LANGUAGE;
  } catch {
    return DEFAULT_LANGUAGE;
  }
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(getInitialLanguage);

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = translations[language].seo.title;

    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    const openGraphTitle = document.querySelector<HTMLMetaElement>('meta[property="og:title"]');
    const openGraphDescription = document.querySelector<HTMLMetaElement>('meta[property="og:description"]');
    if (description) description.content = translations[language].seo.description;
    if (openGraphTitle) openGraphTitle.content = translations[language].seo.title;
    if (openGraphDescription) openGraphDescription.content = translations[language].seo.description;

    try {
      window.localStorage.setItem(STORAGE_KEY, language);
    } catch {
      // Language switching must keep working even when storage is unavailable.
    }
  }, [language]);

  const value = useMemo<I18nContextValue>(
    () => ({ language, locale: languageLocales[language], t: translations[language], setLanguage }),
    [language],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useI18n must be used inside I18nProvider');
  return context;
}
