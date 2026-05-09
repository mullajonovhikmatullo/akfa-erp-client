/**
 * app/main.jsx — entry. Mounts the React tree, ConfigProvider, Tweaks panel.
 */

import './styles.css';
import { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider } from 'antd';
import { StoreProvider, useSel, useDispatch, sel } from './store.jsx';
import { Router } from '../routes/Router.jsx';
import {
  useTweaks, TweaksPanel, TweakSection, TweakRadio, TweakNumber, TweakButton,
} from '../shared/tweaks-panel.jsx';

const TweakedTweaks = () => {
  const dispatch = useDispatch();
  const ui = useSel(s => s.ui);
  const user = useSel(sel.user);
  const users = useSel(s => s.users);
  const settings = useSel(s => s.settings);

  const [tweaks, setTweak] = useTweaks({
    role: user?.id || "u-1",
    lang: ui.lang,
    density: ui.density,
    displayCurrency: settings.displayCurrency,
    fxRate: settings.exchangeRate,
  });

  // Sync tweaks → store
  useEffect(() => {
    if (tweaks.role && (!user || user.id !== tweaks.role)) {
      const u = users.find(uu => uu.id === tweaks.role);
      if (u) dispatch({ type: "auth/login", user: u });
    }
  }, [tweaks.role]);
  useEffect(() => { if (tweaks.lang !== ui.lang) dispatch({ type: "ui/set", patch: { lang: tweaks.lang } }); }, [tweaks.lang]);
  useEffect(() => {
    if (tweaks.density !== ui.density) dispatch({ type: "ui/set", patch: { density: tweaks.density } });
    document.body.classList.remove("density-compact", "density-spacious", "density-default");
    document.body.classList.add("density-" + tweaks.density);
  }, [tweaks.density]);
  useEffect(() => { if (tweaks.displayCurrency !== settings.displayCurrency) dispatch({ type: "settings/set", patch: { displayCurrency: tweaks.displayCurrency } }); }, [tweaks.displayCurrency]);
  useEffect(() => { if (tweaks.fxRate !== settings.exchangeRate) dispatch({ type: "settings/set", patch: { exchangeRate: Number(tweaks.fxRate) || 12650 } }); }, [tweaks.fxRate]);

  return (
    <TweaksPanel title="Tweaks">
      <TweakSection title="Profile">
        <TweakRadio
          label="Role"
          value={tweaks.role}
          options={users.map(u => ({ value: u.id, label: u.role === "super_admin" ? "Super" : u.name.split(" ")[0] }))}
          onChange={(v) => setTweak("role", v)}
        />
      </TweakSection>
      <TweakSection title="Display">
        <TweakRadio label="Language" value={tweaks.lang} options={[{value:"en",label:"EN"},{value:"ru",label:"RU"},{value:"uz",label:"UZ"}]} onChange={(v) => setTweak("lang", v)} />
        <TweakRadio label="Density"  value={tweaks.density} options={[{value:"compact",label:"Compact"},{value:"default",label:"Default"},{value:"spacious",label:"Spacious"}]} onChange={(v) => setTweak("density", v)} />
        <TweakRadio label="Currency" value={tweaks.displayCurrency} options={[{value:"UZS",label:"UZS"},{value:"USD",label:"USD"}]} onChange={(v) => setTweak("displayCurrency", v)} />
      </TweakSection>
      <TweakSection title="System">
        <TweakNumber label="FX (1 USD)" value={tweaks.fxRate} step={50} onChange={(v) => setTweak("fxRate", v)} />
        <TweakButton label="Reset mock data" onClick={() => { dispatch({ type: "state/reset" }); }}>Reset</TweakButton>
      </TweakSection>
    </TweaksPanel>
  );
};

const App = () => (
  <ConfigProvider theme={{
    token: {
      colorPrimary: "#1e4dd8",
      colorInfo: "#1e4dd8",
      colorSuccess: "#16a34a",
      colorWarning: "#d97706",
      colorError: "#dc2626",
      borderRadius: 8,
      fontFamily: "'Inter Tight', system-ui, sans-serif",
      colorBorder: "#e6e9ef",
      colorBorderSecondary: "#eef0f4",
    },
    components: {
      Button: { controlHeight: 36, fontWeight: 500 },
      Table: { headerBg: "#f3f5f9" },
    },
  }}>
    <StoreProvider>
      <Router />
      <TweakedTweaks />
    </StoreProvider>
  </ConfigProvider>
);

const mount = () => {
  if (window.__akfa_mounted) return;
  const el = document.getElementById("root");
  if (!el) { setTimeout(mount, 30); return; }
  window.__akfa_mounted = true;
  ReactDOM.createRoot(el).render(<App />);
};
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mount);
} else {
  mount();
}
