/**
 * features/settings.jsx — currency, exchange rate, low-stock threshold, profile.
 */

import * as antd from 'antd';
import { useSel, useDispatch } from '../app/store.jsx';
import { useT } from '../shared/i18n.jsx';
import { SectionTitle } from '../shared/ui.jsx';

const SettingsFeature = () => {
  const t = useT();
  const settings = useSel(s => s.settings);
  const ui = useSel(s => s.ui);
  const dispatch = useDispatch();

  return (
    <>
      <div className="page-head">
        <div>
          <h1>{t("nav.settings")}</h1>
          <div className="sub">System preferences. Branch admins see only their branch settings.</div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <SectionTitle>Currency & exchange rate</SectionTitle>
          <div className="col" style={{ gap: 14 }}>
            <div>
              <div style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 6 }}>Display currency</div>
              <antd.Radio.Group value={settings.displayCurrency} onChange={e => dispatch({ type: "settings/set", patch: { displayCurrency: e.target.value } })}>
                <antd.Radio.Button value="UZS">UZS so'm</antd.Radio.Button>
                <antd.Radio.Button value="USD">USD $</antd.Radio.Button>
              </antd.Radio.Group>
              <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 6 }}>Used for all dashboards and reports.</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 6 }}>Manual exchange rate · 1 USD →</div>
              <antd.InputNumber value={settings.exchangeRate} step={50} min={1000}
                onChange={v => dispatch({ type: "settings/set", patch: { exchangeRate: Number(v) || 0 } })}
                style={{ width: 220 }}
                formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, " ")}
                addonAfter="so'm" />
              <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 6 }}>Applied immediately to all currency conversions.</div>
            </div>
          </div>
        </div>

        <div className="card">
          <SectionTitle>Inventory thresholds</SectionTitle>
          <div>
            <div style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 6 }}>Low stock threshold</div>
            <antd.InputNumber value={settings.lowStockThreshold} min={1}
              onChange={v => dispatch({ type: "settings/set", patch: { lowStockThreshold: Number(v) || 0 } })}
              style={{ width: 180 }} addonAfter="units" />
            <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 6 }}>SKUs below this total are flagged as low stock.</div>
          </div>
        </div>

        <div className="card">
          <SectionTitle>Localization</SectionTitle>
          <div>
            <div style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 6 }}>Interface language</div>
            <antd.Radio.Group value={ui.lang} onChange={e => dispatch({ type: "ui/set", patch: { lang: e.target.value } })}>
              <antd.Radio.Button value="en">English</antd.Radio.Button>
              <antd.Radio.Button value="ru">Русский</antd.Radio.Button>
              <antd.Radio.Button value="uz">O'zbekcha</antd.Radio.Button>
            </antd.Radio.Group>
          </div>
        </div>

        <div className="card">
          <SectionTitle>Danger zone</SectionTitle>
          <antd.Popconfirm title="Reset all data to seed?" onConfirm={() => { dispatch({ type: "state/reset" }); antd.message.info("Reset to seed data"); }}>
            <antd.Button danger>Reset all mock data</antd.Button>
          </antd.Popconfirm>
          <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 8 }}>
            Wipes localStorage and reseeds. Useful for demos.
          </div>
        </div>
      </div>
    </>
  );
};

export { SettingsFeature };
