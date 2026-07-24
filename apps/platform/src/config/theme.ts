import { theme as antdTheme } from 'antd';
import type { ThemeConfig } from 'antd';
import type { ThemeMode } from '../shared/types';

export const themeStorageKey = 'store-management-theme';

export const createAntdTheme = (mode: ThemeMode): ThemeConfig => ({
  algorithm: mode === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
  token: {
    colorPrimary: mode === 'dark' ? '#4dd6ce' : '#0e8f8a',
    colorSuccess: '#20a66a',
    colorWarning: '#f5a524',
    colorError: '#e25563',
    colorInfo: '#3276f6',
    borderRadius: 14,
    borderRadiusLG: 22,
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    controlHeight: 40,
    controlHeightLG: 46,
  },
  components: {
    Button: {
      borderRadius: 14,
      controlHeight: 40,
      primaryShadow: 'none',
    },
    Input: {
      borderRadius: 16,
      controlHeight: 42,
      activeShadow: '0 0 0 3px var(--focus-ring)',
    },
    Drawer: {
      colorBgElevated: 'var(--sidebar-background)',
      colorSplit: 'var(--card-border)',
    },
    Dropdown: {
      colorBgElevated: 'var(--popover-background)',
      controlItemBgHover: 'var(--hover-background)',
    },
    Popover: {
      colorBgElevated: 'var(--popover-background)',
    },
    Skeleton: {
      colorFillContent: 'var(--skeleton-base)',
      colorFill: 'var(--skeleton-highlight)',
    },
  },
});
