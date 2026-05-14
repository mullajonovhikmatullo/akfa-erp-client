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
          <div className="sub">Тизим созламалари. Филиал администраторлари фақат ўз филиали созламаларини кўрадилар.</div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <SectionTitle>Валюта ва алмашинув курси</SectionTitle>
          <div className="col" style={{ gap: 14 }}>
            <div>
              <div style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 6 }}>Кўриниш валютаси</div>
              <antd.Radio.Group value={settings.displayCurrency} onChange={e => dispatch({ type: "settings/set", patch: { displayCurrency: e.target.value } })}>
                <antd.Radio.Button value="UZS">UZS so'm</antd.Radio.Button>
                <antd.Radio.Button value="USD">USD $</antd.Radio.Button>
              </antd.Radio.Group>
              <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 6 }}>Барча бошқарув панеллари ва ҳисоботлар учун ишлатилади.</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 6 }}>Қўлда алмашинув курси · 1 USD →</div>
              <antd.InputNumber value={settings.exchangeRate} step={50} min={1000}
                onChange={v => dispatch({ type: "settings/set", patch: { exchangeRate: Number(v) || 0 } })}
                style={{ width: 220 }}
                formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, " ")}
                addonAfter="so'm" />
              <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 6 }}>Барча валюта конверсияларига дарҳол қўлланилади.</div>
            </div>
          </div>
        </div>

        <div className="card">
          <SectionTitle>Омбор чегаралари</SectionTitle>
          <div>
            <div style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 6 }}>Кам қолган чегара</div>
            <antd.InputNumber value={settings.lowStockThreshold} min={1}
              onChange={v => dispatch({ type: "settings/set", patch: { lowStockThreshold: Number(v) || 0 } })}
              style={{ width: 180 }} addonAfter="дона" />
            <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 6 }}>Бу миқдордан паст SKUлар кам қолган деб белгиланади.</div>
          </div>
        </div>

        <div className="card">
          <SectionTitle>Локализация</SectionTitle>
          <div>
            <div style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 6 }}>Интерфейс тили</div>
            <antd.Radio.Group value={ui.lang} onChange={e => dispatch({ type: "ui/set", patch: { lang: e.target.value } })}>
              <antd.Radio.Button value="en">English</antd.Radio.Button>
              <antd.Radio.Button value="ru">Русский</antd.Radio.Button>
              <antd.Radio.Button value="uz">O'zbekcha</antd.Radio.Button>
            </antd.Radio.Group>
          </div>
        </div>

        <div className="card">
          <SectionTitle>Хавфли зона</SectionTitle>
          <antd.Popconfirm title="Барча маълумотларни тиклашни хоҳлайсизми?" onConfirm={() => { dispatch({ type: "state/reset" }); antd.message.info("Дастлабки маълумотларга тикланди"); }}>
            <antd.Button danger>Барча маълумотларни тиклаш</antd.Button>
          </antd.Popconfirm>
          <div style={{ fontSize: 12, color: "var(--ink-3)", marginTop: 8 }}>
            LocalStorageни тозалайди ва қайта юклайди. Демолар учун фойдали.
          </div>
        </div>
      </div>
    </>
  );
};

export { SettingsFeature };
