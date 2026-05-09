/**
 * features/auth.jsx — Login screen with role pick.
 */

import { useState } from 'react';
import * as antd from 'antd';
import * as icons from '@ant-design/icons';
import { useSel, useDispatch } from '../app/store.jsx';
import { useT } from '../shared/i18n.jsx';
import { Brandmark } from '../shared/ui.jsx';

const LoginScreen = ({ onAuthed }) => {
  const users = useSel(s => s.users);
  const branches = useSel(s => s.branches);
  const dispatch = useDispatch();
  const [selected, setSelected] = useState("u-1");
  const [pwd, setPwd] = useState("••••••••");
  const t = useT();

  const submit = (e) => {
    e?.preventDefault();
    const user = users.find(u => u.id === selected);
    if (!user) return;
    dispatch({ type: "auth/login", user });
    onAuthed && onAuthed(user);
  };

  const branchName = (id) => branches.find(b => b.id === id)?.name || "—";

  return (
    <div className="login-shell">
      <div className="login-art">
        <div className="stack">
          <Brandmark dark />
        </div>
        <div className="stack">
          <div style={{ fontSize: 12, letterSpacing: ".18em", color: "#94a3b8", textTransform: "uppercase" }}>
            Internal control panel · v3.4
          </div>
          <h2>Run every branch from one cockpit.</h2>
          <p>
            Track stock down to the batch, watch sales hit the ledger in real time,
            settle debts in two currencies, and rebalance inventory between Tashkent and Samarkand without leaving your dashboard.
          </p>
          <div className="stats">
            <div className="s"><div className="v">2</div><div className="k">Branches</div></div>
            <div className="s"><div className="v">8</div><div className="k">SKUs</div></div>
            <div className="s"><div className="v">UZS · USD</div><div className="k">Currencies</div></div>
          </div>
        </div>
        <div style={{ position: "relative", zIndex: 1, color: "#64748b", fontSize: 12 }}>
          © AKFA ERP · Mock prototype · No live data
        </div>
      </div>

      <form className="login-form" onSubmit={submit}>
        <h1>{t("auth.signIn")}</h1>
        <p className="lead">{t("auth.lead")}</p>

        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 8 }}>
          Choose profile
        </div>
        <div className="col" style={{ gap: 8, marginBottom: 20 }}>
          {users.map(u => (
            <div
              key={u.id}
              className={`role-card ${selected === u.id ? "selected" : ""}`}
              onClick={() => setSelected(u.id)}
            >
              <div className="icon" style={{ background: u.avatarTone + "22", color: u.avatarTone }}>
                {u.role === "super_admin" ? <icons.CrownOutlined /> : <icons.ShopOutlined />}
              </div>
              <div style={{ flex: 1 }}>
                <div className="t">{u.name}</div>
                <div className="d">
                  {u.role === "super_admin" ? "Super Admin · all branches" : `Branch Admin · ${branchName(u.branchId)}`}
                </div>
              </div>
              <div style={{
                width: 18, height: 18, borderRadius: "50%",
                border: `2px solid ${selected === u.id ? "var(--primary)" : "var(--border-strong)"}`,
                background: selected === u.id ? "var(--primary)" : "transparent",
                boxShadow: selected === u.id ? "inset 0 0 0 3px #fff" : "none",
              }} />
            </div>
          ))}
        </div>

        <antd.Input.Password value={pwd} onChange={e => setPwd(e.target.value)} placeholder="Password" size="large" style={{ marginBottom: 16 }} />

        <antd.Button type="primary" size="large" htmlType="submit" block>
          {t("auth.continue")}
        </antd.Button>

        <div style={{ marginTop: 16, color: "var(--ink-4)", fontSize: 12 }}>
          Demo build — credentials are not validated. State persists in this browser only.
        </div>
      </form>
    </div>
  );
};

export { LoginScreen };
