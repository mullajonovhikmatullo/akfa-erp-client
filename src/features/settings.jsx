/**
 * features/settings.jsx — currency, exchange rate, low-stock threshold, appearance, localization.
 */

import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import * as antd from 'antd';
import { LightbulbIcon } from '@phosphor-icons/react';
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
  const { control, reset } = useForm({
    defaultValues: {
      displayCurrency: settings.displayCurrency,
      exchangeRate: settings.exchangeRate,
      lowStockThreshold: settings.lowStockThreshold,
      lang,
      theme,
    },
  });

  useEffect(() => {
    reset({
      displayCurrency: settings.displayCurrency,
      exchangeRate: settings.exchangeRate,
      lowStockThreshold: settings.lowStockThreshold,
      lang,
      theme,
    });
  }, [lang, reset, settings.displayCurrency, settings.exchangeRate, settings.lowStockThreshold, theme]);

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
              <Controller
                name="displayCurrency"
                control={control}
                render={({ field }) => (
                  <antd.Radio.Group
                    value={field.value}
                    onChange={e => {
                      field.onChange(e.target.value);
                      dispatch({ type: "settings/set", patch: { displayCurrency: e.target.value } });
                    }}
                  >
                    <antd.Radio.Button value="UZS">UZS so'm</antd.Radio.Button>
                    <antd.Radio.Button value="USD">USD $</antd.Radio.Button>
                  </antd.Radio.Group>
                )}
              />
              <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 6 }}>{t('settings.currencyNote')}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 6 }}>{t('settings.exchangeRate')}</div>
              <Controller
                name="exchangeRate"
                control={control}
                render={({ field }) => (
                  <antd.InputNumber
                    value={field.value}
                    step={50}
                    min={1000}
                    onChange={v => {
                      const value = Number(v) || 0;
                      field.onChange(value);
                      dispatch({ type: "settings/set", patch: { exchangeRate: value } });
                    }}
                    style={{ width: 220 }}
                    formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, " ")}
                    addonAfter="so'm"
                  />
                )}
              />
              <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 6 }}>{t('settings.exchangeRateNote')}</div>
            </div>
          </div>
        </div>

        <div className="card">
          <SectionTitle>{t('settings.threshold')}</SectionTitle>
          <div>
            <div style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 6 }}>{t('settings.lowStockThreshold')}</div>
            <Controller
              name="lowStockThreshold"
              control={control}
              render={({ field }) => (
                <antd.InputNumber
                  value={field.value}
                  min={1}
                  onChange={v => {
                    const value = Number(v) || 0;
                    field.onChange(value);
                    dispatch({ type: "settings/set", patch: { lowStockThreshold: value } });
                  }}
                  style={{ width: 180 }}
                  addonAfter={t('settings.units')}
                />
              )}
            />
            <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 6 }}>{t('settings.thresholdNote')}</div>
          </div>
        </div>

        <div className="card">
          <SectionTitle>{t('settings.localization')}</SectionTitle>
          <div>
            <div style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 6 }}>{t('settings.interfaceLang')}</div>
            <Controller
              name="lang"
              control={control}
              render={({ field }) => (
                <antd.Radio.Group
                  value={field.value}
                  onChange={e => {
                    field.onChange(e.target.value);
                    setLang(e.target.value);
                  }}
                >
                  <antd.Radio.Button value="uz-cy">O'z (Кирил)</antd.Radio.Button>
                  <antd.Radio.Button value="uz-la">O'z (Lotin)</antd.Radio.Button>
                  <antd.Radio.Button value="ru">Русский</antd.Radio.Button>
                  <antd.Radio.Button value="en">English</antd.Radio.Button>
                </antd.Radio.Group>
              )}
            />
          </div>
        </div>

        <div className="card">
          <SectionTitle>
            <LightbulbIcon size={18} weight="duotone" style={{ marginRight: 6 }} />
            {t('settings.appearance')}
          </SectionTitle>
          <div>
            <div style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 6 }}>{t('settings.theme')}</div>
            <Controller
              name="theme"
              control={control}
              render={({ field }) => (
                <antd.Radio.Group
                  value={field.value}
                  onChange={e => {
                    field.onChange(e.target.value);
                    setTheme(e.target.value);
                  }}
                >
                  <antd.Radio.Button value="light">{t('settings.themeLight')}</antd.Radio.Button>
                  <antd.Radio.Button value="dark">{t('settings.themeDark')}</antd.Radio.Button>
                  <antd.Radio.Button value="system">{t('settings.themeSystem')}</antd.Radio.Button>
                </antd.Radio.Group>
              )}
            />
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
