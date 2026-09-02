import { theme as antdTheme, type ThemeConfig } from 'antd'

const { darkAlgorithm, defaultAlgorithm } = antdTheme

const BASE_TOKENS = {
  borderRadius: 8,
  borderRadiusLG: 12,
  fontFamily: "'Inter Tight', system-ui, sans-serif",
  fontSize: 13,
  fontSizeSM: 11,
  fontSizeLG: 14,
  lineHeight: 1.45,
  controlHeight: 34,
  controlHeightSM: 26,
  padding: 14,
  paddingSM: 10,
  paddingXS: 6,
  margin: 14,
  marginSM: 10,
  marginXS: 6,
  colorSuccess: '#16a34a',
  colorWarning: '#d97706',
  colorError: '#dc2626',
}

const LIGHT_TOKENS = {
  ...BASE_TOKENS,
  colorPrimary: '#0476D0',
  colorInfo: '#0476D0',
  colorBorder: '#e6e9ef',
  colorBorderSecondary: '#eef0f4',
  colorBgBase: '#f8fafc',
  colorBgContainer: '#ffffff',
  colorTextBase: '#0f172a',
}

const DARK_TOKENS = {
  ...BASE_TOKENS,
  colorPrimary: '#28A9F4',
  colorInfo: '#28A9F4',
  colorBorder: '#334155',
  colorBorderSecondary: '#243047',
  colorBgBase: '#0f172a',
  colorBgContainer: '#1e293b',
  colorTextBase: '#f1f5f9',
}

const SHARED_COMPONENTS = {
  Button: { controlHeight: 34, fontWeight: 500, primaryShadow: 'none' },
  Select: { controlHeight: 34 },
  Input: { controlHeight: 34 },
  InputNumber: { controlHeight: 34 },
  Form: { itemMarginBottom: 12, labelFontSize: 12 },
  Card: { paddingLG: 16, headerFontSize: 13, headerHeight: 44 },
  Modal: {
    titleFontSize: 16,
    titleLineHeight: 1.35,
    padding: 20,
    paddingContentHorizontalLG: 20,
    borderRadiusLG: 16,
  },
  Drawer: { footerPaddingBlock: 10, footerPaddingInline: 14 },
}

export function createAntdTheme(isDark: boolean): ThemeConfig {
  //
  return {
    algorithm: isDark ? darkAlgorithm : defaultAlgorithm,
    token: isDark ? DARK_TOKENS : LIGHT_TOKENS,
    components: {
      ...SHARED_COMPONENTS,
      Table: {
        headerBg: isDark ? '#1a2236' : '#f3f5f9',
        headerColor: isDark ? '#94a3b8' : '#475569',
        rowHoverBg: isDark ? 'rgba(40,169,244,.07)' : 'rgba(4,118,208,.035)',
        borderColor: isDark ? '#334155' : '#e6e9ef',
        cellFontSize: 12,
        cellFontSizeMD: 12,
        cellFontSizeSM: 12,
        cellPaddingBlock: 5,
        cellPaddingBlockMD: 5,
        cellPaddingBlockSM: 4,
        cellPaddingInline: 8,
        cellPaddingInlineMD: 8,
        cellPaddingInlineSM: 8,
        headerBorderRadius: 6,
      },
      Menu: {
        itemBg: 'transparent',
        itemSelectedBg: isDark ? 'rgba(40,169,244,.13)' : 'rgba(4,118,208,.08)',
        itemSelectedColor: isDark ? '#28A9F4' : '#0476D0',
        itemHoverBg: isDark ? 'rgba(255,255,255,.05)' : 'rgba(15,23,42,.04)',
      },
    },
  }
}
