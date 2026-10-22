import { theme as antdTheme, type ThemeConfig } from 'antd'

const { darkAlgorithm, defaultAlgorithm } = antdTheme

const BASE_TOKENS = {
  borderRadius: 8,
  borderRadiusLG: 12,
  fontFamily: "'Manrope', system-ui, sans-serif",
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
  colorPrimary: '#3aaaf0',
  colorInfo: '#3aaaf0',
  colorBorder: '#2a2a2e',
  colorBorderSecondary: '#1f1f23',
  colorBgBase: '#0b0b0c',
  colorBgContainer: '#141416',
  colorBgElevated: '#1b1b1e',
  colorBgLayout: '#0b0b0c',
  colorTextBase: '#f5f5f6',
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
        headerBg: isDark ? '#1b1b1e' : '#f3f5f9',
        headerColor: isDark ? '#a1a1aa' : '#475569',
        rowHoverBg: isDark ? 'rgba(255,255,255,.035)' : 'rgba(4,118,208,.035)',
        borderColor: isDark ? '#26262a' : '#e6e9ef',
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
        itemSelectedBg: isDark ? 'rgba(58,170,240,.12)' : 'rgba(4,118,208,.08)',
        itemSelectedColor: isDark ? '#3aaaf0' : '#0476D0',
        itemHoverBg: isDark ? 'rgba(255,255,255,.05)' : 'rgba(15,23,42,.04)',
      },
    },
  }
}
