import { ConfigProvider } from 'antd';
import type { ReactNode } from 'react';

const theme = {
  token: {
    colorPrimary: '#1e4dd8',
    colorInfo: '#1e4dd8',
    colorSuccess: '#16a34a',
    colorWarning: '#d97706',
    colorError: '#dc2626',
    borderRadius: 8,
    borderRadiusLG: 12,
    fontFamily: "'Inter Tight', system-ui, sans-serif",
    colorBorder: '#e6e9ef',
    colorBorderSecondary: '#eef0f4',
    colorBgBase: '#f8fafc',
    colorBgContainer: '#ffffff',
    colorTextBase: '#0f172a',
    fontSize: 14,
    lineHeight: 1.5,
    controlHeight: 36,
  },
  components: {
    Button: {
      controlHeight: 36,
      fontWeight: 500,
      primaryShadow: 'none',
    },
    Table: {
      headerBg: '#f3f5f9',
      headerColor: '#475569',
      rowHoverBg: '#f8fafc',
      borderColor: '#e6e9ef',
    },
    Card: {
      paddingLG: 20,
    },
    Select: {
      controlHeight: 36,
    },
    Input: {
      controlHeight: 36,
    },
    Form: {
      itemMarginBottom: 16,
    },
    Menu: {
      itemBg: 'transparent',
      itemSelectedBg: 'rgba(30,77,216,0.08)',
      itemSelectedColor: '#1e4dd8',
      itemHoverBg: 'rgba(15,23,42,0.04)',
    },
  },
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  return <ConfigProvider theme={theme}>{children}</ConfigProvider>;
}
