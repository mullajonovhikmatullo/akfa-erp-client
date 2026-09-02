import { useEffect, useLayoutEffect, useMemo, useState, type ReactNode } from 'react'
import { App as AntdApp, ConfigProvider } from 'antd'
import dayjs from 'dayjs'
import 'dayjs/locale/en'
import 'dayjs/locale/ru'
import 'dayjs/locale/uz'
import 'dayjs/locale/uz-latn'
import { useUIStore } from '@/app/stores/ui.store'
import { normalizeLang } from '@/shared/lib/lang'
import { ANTD_LOCALES } from './theme/antdLocales'
import { createAntdTheme } from './theme/antdTheme'

export function ThemeProvider({ children }: { children: ReactNode }) {
  //
  const themeMode = useUIStore((state) => state.theme)
  const lang = useUIStore((state) => state.lang)
  const normalizedLang = normalizeLang(lang)
  const dayjsLocale = normalizedLang === 'uz-cy'
    ? 'uz'
    : normalizedLang === 'uz-la'
      ? 'uz-latn'
      : normalizedLang
  const [systemIsDark, setSystemIsDark] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches,
  )
  const isDark = themeMode === 'dark' || (themeMode === 'system' && systemIsDark)
  const theme = useMemo(() => createAntdTheme(isDark), [isDark])

  useEffect(() => {
    //
    dayjs.locale(dayjsLocale)
  }, [dayjsLocale])

  useEffect(() => {
    //
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (event: MediaQueryListEvent) => setSystemIsDark(event.matches)
    setSystemIsDark(mediaQuery.matches)
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  useLayoutEffect(() => {
    //
    document.documentElement.classList.toggle('dark', isDark)
  }, [isDark])

  useLayoutEffect(() => {
    //
    document.documentElement.lang = normalizedLang
  }, [normalizedLang])

  return (
    <ConfigProvider locale={ANTD_LOCALES[normalizedLang]} theme={theme}>
      <AntdApp>{children}</AntdApp>
    </ConfigProvider>
  )
}
