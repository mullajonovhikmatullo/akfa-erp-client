/**
 * layouts/AppShell.jsx — sidebar + topbar chrome.
 */

import React, { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import * as antd from 'antd';
import * as icons from '@ant-design/icons';
import { useSel, useDispatch, sel } from '../app/store.jsx';
import { useT } from '../shared/i18n.jsx';
import { Brandmark, Avatar } from '../shared/ui.jsx';

const NAV_ITEMS = [
  { key: "dashboard",  to: "#/",          label: "nav.dashboard",  icon: "DashboardOutlined", group: null },
  { key: "products",   to: "#/products",  label: "nav.products",   icon: "InboxOutlined",     group: "nav.catalog" },
  { key: "customers",  to: "#/customers", label: "nav.customers",  icon: "TeamOutlined",      group: "nav.catalog" },
  { key: "sales",      to: "#/sales",     label: "nav.sales",      icon: "ShoppingCartOutlined", group: "nav.operations" },
  { key: "purchases",  to: "#/purchases", label: "nav.purchases",  icon: "DropboxOutlined",   group: "nav.operations" },
  { key: "expenses",   to: "#/expenses",  label: "nav.expenses",   icon: "WalletOutlined",    group: "nav.operations" },
  { key: "transfers",  to: "#/transfers", label: "nav.transfers",  icon: "SwapOutlined",      group: "nav.operations" },
  { key: "analytics",  to: "#/analytics", label: "nav.analytics",  icon: "LineChartOutlined", group: "nav.insights" },
  { key: "settings",   to: "#/settings",  label: "nav.settings",   icon: "SettingOutlined",   group: "nav.insights" },
];

const Sidebar = ({ route }) => {
  const t = useT();

  const groups = [];
  let lastGroup = "__nogroup__";
  NAV_ITEMS.forEach(item => {
    if (item.group !== lastGroup) {
      groups.push({ group: item.group, items: [] });
      lastGroup = item.group;
    }
    groups[groups.length - 1].items.push(item);
  });

  return (
    <aside className="sidebar">
      <Brandmark dark />
      {groups.map((g, gi) => (
        <React.Fragment key={gi}>
          {g.group && <div className="nav-section">{t(g.group)}</div>}
          {g.items.map(item => {
            const Icon = icons[item.icon];
            const active = route.page === item.key;
            return (
              <a key={item.key} href={item.to} className={`nav-item ${active ? "active" : ""}`}>
                <Icon />
                <span>{t(item.label)}</span>
              </a>
            );
          })}
        </React.Fragment>
      ))}

      <div className="footer">
        <div style={{ fontSize: 11, color: "#64748b", padding: "8px 4px" }}>
          v1.0 · AKFA ERP
        </div>
      </div>
    </aside>
  );
};

const Topbar = ({ route }) => {
  const t = useT();
  const dispatch = useDispatch();
  const user = useSel(sel.user);
  const isSuper = user?.role === "super_admin";
  const branches = useSel(s => s.branches);
  const activeBranchId = useSel(sel.activeBranchId);
  const activeBranch = branches.find(b => b.id === activeBranchId);
  const rate = useSel(s => s.settings.exchangeRate);
  const userBranchName = user?.branchId ? branches.find(b => b.id === user.branchId)?.name : "All branches";
  const branchSelectValue = activeBranchId === "__all__" ? "__all__" : activeBranchId;
  const { control: branchControl, reset: resetBranchForm } = useForm({
    defaultValues: { activeBranchId: branchSelectValue },
  });

  useEffect(() => {
    resetBranchForm({ activeBranchId: branchSelectValue });
  }, [branchSelectValue, resetBranchForm]);

  const pageLabel = NAV_ITEMS.find(n => n.key === route.page)?.label || "nav.dashboard";

  const profileMenu = {
    items: [
      {
        key: "header",
        type: "group",
        label: (
          <div style={{ padding: "4px 0", minWidth: 220 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{user?.name}</div>
            <div style={{ fontSize: 11, color: "#64748b", textTransform: "capitalize", marginTop: 2 }}>
              {user?.role?.replace("_", " ")} · {userBranchName?.split(" — ")[0]}
            </div>
          </div>
        ),
      },
      { type: "divider" },
      {
        key: "settings",
        icon: <icons.SettingOutlined />,
        label: "Settings",
        onClick: () => { window.location.hash = "#/settings"; },
      },
      {
        key: "logout",
        icon: <icons.LogoutOutlined />,
        label: <span style={{ color: "#dc2626" }}>Sign out</span>,
        onClick: () => { dispatch({ type: "auth/logout" }); window.location.hash = "#/login"; },
      },
    ],
  };

  return (
    <div className="topbar">
      <div className="topbar__inner">
        <div className="crumbs">
          AKFA ERP · <strong>{t(pageLabel)}</strong>
        </div>

        <div className="grow" />

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span className="tagpill info">
            <icons.DollarOutlined style={{ fontSize: 11 }} />
            1 USD = {rate.toLocaleString("ru-RU").replace(/,/g, " ")} so'm
          </span>

          {isSuper ? (
            <Controller
              name="activeBranchId"
              control={branchControl}
              render={({ field }) => (
                <antd.Select
                  value={field.value}
                  onChange={(v) => {
                    field.onChange(v);
                    dispatch({ type: "ui/set", patch: { activeBranchId: v } });
                  }}
                  style={{ minWidth: 220 }}
                  options={[
                    { value: "__all__", label: t("common.allBranches") },
                    ...branches.map(b => ({ value: b.id, label: b.name })),
                  ]}
                  suffixIcon={<icons.EnvironmentOutlined />}
                />
              )}
            />
          ) : (
            <span className="branchchip"><span className="dot" /> {activeBranch?.name}</span>
          )}

          <antd.Dropdown menu={profileMenu} trigger={["click"]} placement="bottomRight">
            <button className="profile-trigger" type="button">
              <Avatar name={user?.name} tone={user?.avatarTone} size={28} />
              <span className="profile-name">{user?.name?.split(" ")[0]}</span>
              <icons.DownOutlined style={{ fontSize: 10, color: "#64748b" }} />
            </button>
          </antd.Dropdown>
        </div>
      </div>
    </div>
  );
};

const AppShell = ({ route, children }) => (
  <div className="app-shell">
    <Sidebar route={route} />
    <div className="main">
      <Topbar route={route} />
      <div className="page">{children}</div>
    </div>
  </div>
);

export { AppShell, Sidebar, Topbar };
