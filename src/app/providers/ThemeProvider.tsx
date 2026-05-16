import { ConfigProvider, theme as antdTheme } from 'antd';
import type { ReactNode } from 'react';
import { useState, useEffect } from 'react';
import { useUIStore } from '@/app/stores/ui.store';
import { normalizeLang } from '@/shared/lib/i18n';
import enUS from 'antd/locale/en_US';
import ruRU from 'antd/locale/ru_RU';
import uzUZ from 'antd/locale/uz_UZ';

const { darkAlgorithm, defaultAlgorithm } = antdTheme;

const BASE_TOKENS = {
  borderRadius: 8,
  borderRadiusLG: 12,
  fontFamily: "'Inter Tight', system-ui, sans-serif",
  fontSize: 14,
  lineHeight: 1.5,
  controlHeight: 36,
  colorSuccess: '#16a34a',
  colorWarning: '#d97706',
  colorError: '#dc2626',
};

const LIGHT_TOKENS = {
  ...BASE_TOKENS,
  colorPrimary: '#1e4dd8',
  colorInfo: '#1e4dd8',
  colorBorder: '#e6e9ef',
  colorBorderSecondary: '#eef0f4',
  colorBgBase: '#f8fafc',
  colorBgContainer: '#ffffff',
  colorTextBase: '#0f172a',
};

const DARK_TOKENS = {
  ...BASE_TOKENS,
  colorPrimary: '#4f7cff',
  colorInfo: '#4f7cff',
  colorBorder: '#334155',
  colorBorderSecondary: '#243047',
  colorBgBase: '#0f172a',
  colorBgContainer: '#1e293b',
  colorTextBase: '#f1f5f9',
};

const SHARED_COMPONENTS = {
  Button: { controlHeight: 36, fontWeight: 500, primaryShadow: 'none' },
  Select: { controlHeight: 36 },
  Input: { controlHeight: 36 },
  Form: { itemMarginBottom: 16 },
  Card: { paddingLG: 20 },
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const themeMode = useUIStore((s) => s.theme);
  const lang = useUIStore((s) => s.lang);

  const [isDark, setIsDark] = useState<boolean>(() => {
    if (themeMode === 'dark') return true;
    if (themeMode === 'light') return false;
    return typeof window !== 'undefined'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
      : false;
  });

  useEffect(() => {
    if (themeMode !== 'system') {
      setIsDark(themeMode === 'dark');
      return;
    }
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDark(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [themeMode]);

  useEffect(() => {
    const html = document.documentElement;
    if (isDark) html.classList.add('dark');
    else html.classList.remove('dark');
  }, [isDark]);

  const resolved = normalizeLang(lang as string);
  const locale = resolved === 'ru' ? ruRU : resolved === 'en' ? enUS : uzUZ;

  return (
    <ConfigProvider
      locale={locale}
      theme={{
        algorithm: isDark ? darkAlgorithm : defaultAlgorithm,
        token: isDark ? DARK_TOKENS : LIGHT_TOKENS,
        components: {
          ...SHARED_COMPONENTS,
          Table: {
            headerBg: isDark ? '#1a2236' : '#f3f5f9',
            headerColor: isDark ? '#94a3b8' : '#475569',
            rowHoverBg: isDark ? 'rgba(79,124,255,.06)' : '#f8fafc',
            borderColor: isDark ? '#334155' : '#e6e9ef',
          },
          Menu: {
            itemBg: 'transparent',
            itemSelectedBg: isDark ? 'rgba(79,124,255,.12)' : 'rgba(30,77,216,.08)',
            itemSelectedColor: isDark ? '#4f7cff' : '#1e4dd8',
            itemHoverBg: isDark ? 'rgba(255,255,255,.05)' : 'rgba(15,23,42,.04)',
          },
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}
