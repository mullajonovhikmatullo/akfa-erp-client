/**
 * routes/Router.jsx — hash-based router with role guard.
 */

import { useState, useEffect } from 'react';
import { useSel, sel } from '../app/store.jsx';
import { AppShell } from '../layouts/AppShell.jsx';
import { LoginScreen } from '../features/auth.jsx';
import { DashboardPage } from '../pages/pages.jsx';
import { ProductsFeature } from '../features/products.jsx';
import { CustomersFeature } from '../features/customers.jsx';
import { SalesFeature } from '../features/sales.jsx';
import { PurchasesFeature } from '../features/purchases.jsx';
import { ExpensesFeature } from '../features/expenses.jsx';
import { TransfersFeature } from '../features/transfers.jsx';
import { AnalyticsFeature } from '../features/analytics.jsx';
import { SettingsFeature } from '../features/settings.jsx';

const ROUTES = {
  "/": { page: "dashboard", component: () => <DashboardPage /> },
  "/products": { page: "products", component: () => <ProductsFeature /> },
  "/customers": { page: "customers", component: () => <CustomersFeature /> },
  "/sales": { page: "sales", component: () => <SalesFeature /> },
  "/purchases": { page: "purchases", component: () => <PurchasesFeature /> },
  "/expenses": { page: "expenses", component: () => <ExpensesFeature /> },
  "/transfers": { page: "transfers", component: () => <TransfersFeature /> },
  "/analytics": { page: "analytics", component: () => <AnalyticsFeature />, requireSuper: false },
  "/settings": { page: "settings", component: () => <SettingsFeature /> },
};

function useHashRoute() {
  const [hash, setHash] = useState(window.location.hash || "#/");
  useEffect(() => {
    const h = () => setHash(window.location.hash || "#/");
    window.addEventListener("hashchange", h);
    return () => window.removeEventListener("hashchange", h);
  }, []);
  const path = hash.replace(/^#/, "") || "/";
  return path;
}

const Router = () => {
  const path = useHashRoute();
  const user = useSel(sel.user);

  if (!user || path === "/login") {
    return <LoginScreen onAuthed={() => { window.location.hash = "#/"; }} />;
  }

  const route = ROUTES[path] || ROUTES["/"];
  const Comp = route.component;

  return (
    <AppShell route={route}>
      <Comp />
    </AppShell>
  );
};

export { Router };
