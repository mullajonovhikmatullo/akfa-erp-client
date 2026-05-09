/**
 * app/store.jsx — Redux-style store (single source of truth).
 * Hand-rolled to avoid external Redux dependency in this prototype,
 * but mirrors the same shape: { state, dispatch(action), subscribe(fn) }.
 *
 * Slices: auth, ui, products, customers, sales, purchases, expenses, transfers, settings.
 */

import { createContext, useContext, useEffect, useReducer, useMemo, useState, useRef, useCallback } from 'react';
import { AKFA_SEED } from '../entities/index.jsx';

const LS_KEY = "akfa-erp-state-v1";

const initialState = () => {
  const seed = AKFA_SEED;
  return {
    auth: { user: null }, // null = logged out
    ui: { activeBranchId: "br-main", lang: "en", density: "default", theme: "light" },
    products: seed.PRODUCTS,
    categories: seed.CATEGORIES,
    branches: seed.BRANCHES,
    users: seed.USERS,
    stock: seed.STOCK, // {branchId: {productId: qty}}
    customers: seed.CUSTOMERS,
    sales: seed.SALES,
    purchases: seed.PURCHASES,
    expenses: seed.EXPENSES,
    expenseCategories: seed.EXPENSE_CATEGORIES,
    transfers: seed.TRANSFERS,
    settings: {
      exchangeRate: 12650, // 1 USD => UZS
      displayCurrency: "UZS",
      lowStockThreshold: 50,
    },
  };
};

const loadState = () => {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return initialState();
    const parsed = JSON.parse(raw);
    // shallow merge with seed so new fields show up after schema bumps
    return { ...initialState(), ...parsed };
  } catch (e) { return initialState(); }
};

const saveState = (state) => {
  try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch (e) {}
};

// ---------- reducer ----------
function reducer(state, action) {
  switch (action.type) {
    case "auth/login": return { ...state, auth: { user: action.user }, ui: { ...state.ui, activeBranchId: action.user.branchId || state.ui.activeBranchId } };
    case "auth/logout": return { ...state, auth: { user: null } };

    case "ui/set": return { ...state, ui: { ...state.ui, ...action.patch } };

    case "settings/set": return { ...state, settings: { ...state.settings, ...action.patch } };

    case "products/upsert": {
      const exists = state.products.some(p => p.id === action.product.id);
      const products = exists
        ? state.products.map(p => p.id === action.product.id ? { ...p, ...action.product } : p)
        : [{ ...action.product }, ...state.products];
      return { ...state, products };
    }
    case "products/remove":
      return { ...state, products: state.products.filter(p => p.id !== action.id) };

    case "customers/upsert": {
      const exists = state.customers.some(c => c.id === action.customer.id);
      const customers = exists
        ? state.customers.map(c => c.id === action.customer.id ? { ...c, ...action.customer } : c)
        : [{ ...action.customer }, ...state.customers];
      return { ...state, customers };
    }
    case "customers/remove":
      return { ...state, customers: state.customers.filter(c => c.id !== action.id) };

    case "sales/create": {
      const sale = action.sale;
      // deduct stock
      const branchStock = { ...(state.stock[sale.branchId] || {}) };
      sale.items.forEach(it => {
        branchStock[it.productId] = (branchStock[it.productId] || 0) - it.qty;
      });
      const stock = { ...state.stock, [sale.branchId]: branchStock };
      // update customer balance: sale total - paid => debt added (negative balance)
      const total = sale.items.reduce((a, it) => a + it.qty * it.price, 0);
      const debt = total - sale.paid;
      const customers = state.customers.map(c =>
        c.id === sale.customerId ? { ...c, balance: c.balance - debt } : c
      );
      return { ...state, sales: [sale, ...state.sales], stock, customers };
    }

    case "purchases/create": {
      const po = action.purchase;
      const branchStock = { ...(state.stock[po.branchId] || {}) };
      po.items.forEach(it => {
        branchStock[it.productId] = (branchStock[it.productId] || 0) + it.qty;
      });
      const stock = { ...state.stock, [po.branchId]: branchStock };
      // append batch
      const products = state.products.map(p => {
        const it = po.items.find(i => i.productId === p.id);
        if (!it) return p;
        return { ...p, batches: [...(p.batches || []), { id: `b-${Math.random().toString(36).slice(2,7)}`, supplier: po.supplier, qty: it.qty, costPrice: it.costPrice, date: po.date }] };
      });
      return { ...state, purchases: [po, ...state.purchases], stock, products };
    }

    case "expenses/create":
      return { ...state, expenses: [action.expense, ...state.expenses] };
    case "expenses/remove":
      return { ...state, expenses: state.expenses.filter(e => e.id !== action.id) };

    case "expenseCategories/upsert": {
      const list = state.expenseCategories || [];
      const exists = list.some(c => c.id === action.category.id);
      const next = exists
        ? list.map(c => c.id === action.category.id ? { ...c, ...action.category } : c)
        : [...list, { ...action.category }];
      return { ...state, expenseCategories: next };
    }
    case "expenseCategories/remove":
      return {
        ...state,
        expenseCategories: (state.expenseCategories || []).filter(c => c.id !== action.id),
        // reassign orphaned expenses to "other"
        expenses: state.expenses.map(e => e.category === action.id ? { ...e, category: "other" } : e),
      };

    case "transfers/create": {
      const t = action.transfer;
      const fromStock = { ...(state.stock[t.fromBranchId] || {}) };
      const toStock = { ...(state.stock[t.toBranchId] || {}) };
      t.items.forEach(it => {
        fromStock[it.productId] = (fromStock[it.productId] || 0) - it.qty;
        toStock[it.productId]   = (toStock[it.productId]   || 0) + it.qty;
      });
      const stock = { ...state.stock, [t.fromBranchId]: fromStock, [t.toBranchId]: toStock };
      return { ...state, transfers: [t, ...state.transfers], stock };
    }

    case "state/reset": return initialState();
    default: return state;
  }
}

// ---------- context ----------
const StoreCtx = createContext(null);

function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);
  const persistRef = useRef(null);

  useEffect(() => {
    if (persistRef.current) clearTimeout(persistRef.current);
    persistRef.current = setTimeout(() => saveState(state), 120);
  }, [state]);

  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

const useStore = () => useContext(StoreCtx);
const useSel = (selector) => {
  const { state } = useContext(StoreCtx);
  return selector(state);
};
const useDispatch = () => useContext(StoreCtx).dispatch;

// ---------- selectors ----------
const sel = {
  user: (s) => s.auth.user,
  isSuper: (s) => s.auth.user?.role === "super_admin",
  activeBranchId: (s) => {
    const u = s.auth.user;
    if (!u) return s.ui.activeBranchId;
    if (u.role === "branch_admin") return u.branchId;
    return s.ui.activeBranchId; // super admin can pick
  },
  branchById: (id) => (s) => s.branches.find(b => b.id === id),
  productById: (id) => (s) => s.products.find(p => p.id === id),
  categoryById: (id) => (s) => s.categories.find(c => c.id === id),
  customerById: (id) => (s) => s.customers.find(c => c.id === id),
  // total stock across branches for product
  totalStock: (productId) => (s) => Object.values(s.stock).reduce((a, b) => a + (b[productId] || 0), 0),
  branchStock: (branchId, productId) => (s) => (s.stock[branchId] || {})[productId] || 0,
};

export { StoreProvider, StoreCtx, useStore, useSel, useDispatch, sel };
