/**
 * features/settings.jsx — currency, exchange rate, low-stock threshold, appearance, localization.
 */

import * as antd from 'antd';
import { BulbOutlined } from '@ant-design/icons';
import { useSel, useDispatch } from '../app/store.jsx';
import { useUIStore } from '../app/stores/ui.store';
import { useT } from '../shared/lib/i18n.ts';
import { SectionTitle } from '../shared/ui.jsx';

const SettingsFeature = () => {
  const t = useT();
  const settings = useSel(s => s.settings);
  const dispatch = useDispatch();

  const lang = useUIStore(s => s.lang);
  const setLang = useUIStore(s => s.setLang);
  const theme = useUIStore(s => s.theme);
  const setTheme = useUIStore(s => s.setTheme);

  return (
    <>
      <div className="page-head">
        <div>
          <h1>{t('settings.title')}</h1>
          <div className="sub">{t('settings.subtitle')}</div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <SectionTitle>{t('settings.currency')}</SectionTitle>
          <div className="col" style={{ gap: 14 }}>
            <div>
              <div style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 6 }}>{t('settings.displayCurrency')}</div>
              <antd.Radio.Group
                value={settings.displayCurrency}
                onChange={e => dispatch({ type: "settings/set", patch: { displayCurrency: e.target.value } })}
              >
                <antd.Radio.Button value="UZS">UZS so'm</antd.Radio.Button>
                <antd.Radio.Button value="USD">USD $</antd.Radio.Button>
              </antd.Radio.Group>
              <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 6 }}>{t('settings.currencyNote')}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 6 }}>{t('settings.exchangeRate')}</div>
              <antd.InputNumber
                value={settings.exchangeRate}
                step={50}
                min={1000}
                onChange={v => dispatch({ type: "settings/set", patch: { exchangeRate: Number(v) || 0 } })}
                style={{ width: 220 }}
                formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, " ")}
                addonAfter="so'm"
              />
              <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 6 }}>{t('settings.exchangeRateNote')}</div>
            </div>
          </div>
        </div>

        <div className="card">
          <SectionTitle>{t('settings.threshold')}</SectionTitle>
          <div>
            <div style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 6 }}>{t('settings.lowStockThreshold')}</div>
            <antd.InputNumber
              value={settings.lowStockThreshold}
              min={1}
              onChange={v => dispatch({ type: "settings/set", patch: { lowStockThreshold: Number(v) || 0 } })}
              style={{ width: 180 }}
              addonAfter={t('settings.units')}
            />
            <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 6 }}>{t('settings.thresholdNote')}</div>
          </div>
        </div>

        <div className="card">
          <SectionTitle>{t('settings.localization')}</SectionTitle>
          <div>
            <div style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 6 }}>{t('settings.interfaceLang')}</div>
            <antd.Radio.Group value={lang} onChange={e => setLang(e.target.value)}>
              <antd.Radio.Button value="uz-cy">O'z (Кирил)</antd.Radio.Button>
              <antd.Radio.Button value="uz-la">O'z (Lotin)</antd.Radio.Button>
              <antd.Radio.Button value="ru">Русский</antd.Radio.Button>
              <antd.Radio.Button value="en">English</antd.Radio.Button>
            </antd.Radio.Group>
          </div>
        </div>

        <div className="card">
          <SectionTitle>
            <BulbOutlined style={{ marginRight: 6 }} />
            {t('settings.appearance')}
          </SectionTitle>
          <div>
            <div style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 6 }}>{t('settings.theme')}</div>
            <antd.Radio.Group value={theme} onChange={e => setTheme(e.target.value)}>
              <antd.Radio.Button value="light">{t('settings.themeLight')}</antd.Radio.Button>
              <antd.Radio.Button value="dark">{t('settings.themeDark')}</antd.Radio.Button>
              <antd.Radio.Button value="system">{t('settings.themeSystem')}</antd.Radio.Button>
            </antd.Radio.Group>
          </div>
        </div>

        <div className="card">
          <SectionTitle>{t('settings.dangerZone')}</SectionTitle>
          <antd.Popconfirm
            title={t('settings.resetConfirm')}
            onConfirm={() => {
              dispatch({ type: "state/reset" });
              antd.message.info(t('settings.resetSuccess'));
            }}
          >
            <antd.Button danger>{t('settings.resetData')}</antd.Button>
          </antd.Popconfirm>
          <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 8 }}>
            {t('settings.resetNote')}
          </div>
        </div>
      </div>
    </>
  );
};

export { SettingsFeature };
