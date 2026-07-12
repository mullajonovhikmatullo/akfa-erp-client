/**
 * entities/ — shared business types & seed data
 * In a real project these would be TS interfaces; here we expose factories
 * and seed lists used by the store on first boot.
 */

import dayjs from 'dayjs';

const BRANCHES = [
  { id: "br-main", name: "Tashkent — Main Warehouse", code: "MAIN", city: "Tashkent", isWarehouse: true },
  { id: "br-samar", name: "Samarkand — Showroom",      code: "SAMAR", city: "Samarkand", isWarehouse: false },
];

const USERS = [
  { id: "u-1", name: "Aziz Karimov",   email: "aziz@akfa.local",   role: "super_admin", branchId: null,       avatarTone: "#1e4dd8" },
  { id: "u-2", name: "Dilshod Rakhimov", email: "dilshod@akfa.local", role: "branch_admin", branchId: "br-main",  avatarTone: "#0e7490" },
  { id: "u-3", name: "Madina Yusupova", email: "madina@akfa.local",   role: "branch_admin", branchId: "br-samar", avatarTone: "#7c3aed" },
];

const CATEGORIES = [
  { id: "c-prof", name: "AKFA Profiles",  color: "#1e4dd8" },
  { id: "c-glass", name: "Glass Panels",   color: "#0e7490" },
  { id: "c-acc",   name: "Accessories",    color: "#7c3aed" },
  { id: "c-hw",    name: "Hardware",       color: "#b45309" },
  { id: "c-seal",  name: "Seals & Gaskets",color: "#475569" },
];

const UNITS = ["PIECE", "KG"];

const PRODUCTS = [
  { id: "p-001", sku: "PRF-A60-WHT", name: "Profile A60 — White RAL9016", categoryId: "c-prof", unit: "PIECE",
    costPrice: 42000, retailPrice: 58000, wholesalePrice: 51000, currency: "UZS",
    batches: [
      { id: "b-1", supplier: "AKFA Plant",   qty: 480, costPrice: 41000, date: "2026-03-12" },
      { id: "b-2", supplier: "AKFA Plant",   qty: 220, costPrice: 43500, date: "2026-04-21" },
    ] },
  { id: "p-002", sku: "PRF-A70-BRZ", name: "Profile A70 — Bronze Anodized", categoryId: "c-prof", unit: "PIECE",
    costPrice: 56000, retailPrice: 78000, wholesalePrice: 69500, currency: "UZS",
    batches: [
      { id: "b-3", supplier: "AKFA Plant",   qty: 310, costPrice: 55500, date: "2026-03-28" },
    ] },
  { id: "p-003", sku: "GLS-DBL-4M",  name: "Double-Glazed Unit 4mm 1.2×1.4", categoryId: "c-glass", unit: "PIECE",
    costPrice: 38, retailPrice: 56, wholesalePrice: 49, currency: "USD",
    batches: [
      { id: "b-4", supplier: "Glass Co.",    qty: 64,  costPrice: 37, date: "2026-04-02" },
      { id: "b-5", supplier: "Glass Co.",    qty: 40,  costPrice: 39, date: "2026-04-22" },
    ] },
  { id: "p-004", sku: "HW-HNG-SS",   name: "Stainless Hinge Set",            categoryId: "c-hw",   unit: "PIECE",
    costPrice: 65000, retailPrice: 92000, wholesalePrice: 80000, currency: "UZS",
    batches: [
      { id: "b-6", supplier: "Metro Hardware", qty: 120, costPrice: 64000, date: "2026-03-05" },
    ] },
  { id: "p-005", sku: "SEAL-EPDM-6", name: "EPDM Sealing Strip 6mm",         categoryId: "c-seal", unit: "KG",
    costPrice: 3200,  retailPrice: 5400,  wholesalePrice: 4500,  currency: "UZS",
    batches: [
      { id: "b-7", supplier: "RubberPro",    qty: 1400, costPrice: 3100, date: "2026-04-11" },
    ] },
  { id: "p-006", sku: "ACC-HND-ALU", name: "Aluminum Window Handle",         categoryId: "c-acc",  unit: "PIECE",
    costPrice: 18000, retailPrice: 32000, wholesalePrice: 26000, currency: "UZS",
    batches: [
      { id: "b-8", supplier: "AKFA Plant",   qty: 220, costPrice: 17500, date: "2026-04-18" },
    ] },
  { id: "p-007", sku: "GLS-TMP-6M",  name: "Tempered Glass 6mm 1×1m",        categoryId: "c-glass",unit: "PIECE",
    costPrice: 22, retailPrice: 38, wholesalePrice: 31, currency: "USD",
    batches: [
      { id: "b-9", supplier: "Glass Co.",    qty: 88, costPrice: 22, date: "2026-04-15" },
    ] },
  { id: "p-008", sku: "PRF-SLD-WHT", name: "Sliding Track Profile — White",  categoryId: "c-prof", unit: "PIECE",
    costPrice: 38000, retailPrice: 54000, wholesalePrice: 47500, currency: "UZS",
    batches: [
      { id: "b-10", supplier: "AKFA Plant",  qty: 260, costPrice: 38000, date: "2026-03-30" },
    ] },
];

// stock per branch (productId -> qty)
const STOCK = {
  "br-main": { "p-001": 520, "p-002": 240, "p-003": 78, "p-004": 96, "p-005": 1180, "p-006": 180, "p-007": 60, "p-008": 200 },
  "br-samar": { "p-001": 180, "p-002": 70, "p-003": 26, "p-004": 24, "p-005": 220, "p-006": 40, "p-007": 28, "p-008": 60 },
};

const CUSTOMERS = [
  { id: "cu-001", name: "Olmazor Construction LLC", phone: "+998 90 123 45 67", address: "Tashkent, Yunusabad",  balance: -4_820_000, type: "wholesale" },
  { id: "cu-002", name: "Sherzod Tursunov",         phone: "+998 91 552 13 09", address: "Samarkand, Registan",   balance:    320_000, type: "retail" },
  { id: "cu-003", name: "Bek Windows OOO",          phone: "+998 71 200 11 02", address: "Tashkent, Chilonzor",   balance: -12_400_000, type: "wholesale" },
  { id: "cu-004", name: "Nodira Akhmedova",         phone: "+998 93 401 88 22", address: "Tashkent, Mirzo Ulugbek", balance:           0, type: "retail" },
  { id: "cu-005", name: "Granit Build Group",       phone: "+998 99 770 02 14", address: "Samarkand, Siab",       balance:  -1_950_000, type: "wholesale" },
  { id: "cu-006", name: "Aziza Yuldasheva",         phone: "+998 90 880 67 31", address: "Tashkent, Sergeli",     balance:           0, type: "retail" },
  { id: "cu-007", name: "Pulat Karimov",            phone: "+998 94 220 11 90", address: "Tashkent, Shaykhantakhur", balance:    140_000, type: "retail" },
];

const today = () => dayjs().format("YYYY-MM-DD");
const daysAgo = (n) => dayjs().subtract(n, "day").format("YYYY-MM-DD");

const SALES = [
  { id: "s-1024", date: daysAgo(0),  branchId: "br-main",  customerId: "cu-001", priceMode: "wholesale", currency: "UZS",
    items: [
      { productId: "p-001", qty: 60, unit: "PIECE", price: 51000 },
      { productId: "p-005", qty: 80, unit: "KG", price: 4500  },
    ], paid: 2_500_000 },
  { id: "s-1023", date: daysAgo(0),  branchId: "br-samar", customerId: "cu-002", priceMode: "retail",    currency: "UZS",
    items: [ { productId: "p-006", qty: 4, unit: "PIECE", price: 32000 } ], paid: 128_000 },
  { id: "s-1022", date: daysAgo(1),  branchId: "br-main",  customerId: "cu-003", priceMode: "wholesale", currency: "UZS",
    items: [
      { productId: "p-002", qty: 24, unit: "PIECE", price: 69500 },
      { productId: "p-004", qty: 6,  unit: "PIECE",  price: 80000 },
    ], paid: 1_500_000 },
  { id: "s-1021", date: daysAgo(2),  branchId: "br-main",  customerId: "cu-005", priceMode: "wholesale", currency: "UZS",
    items: [ { productId: "p-008", qty: 40, unit: "PIECE", price: 47500 } ], paid: 1_900_000 },
  { id: "s-1020", date: daysAgo(3),  branchId: "br-samar", customerId: "cu-006", priceMode: "retail",    currency: "UZS",
    items: [ { productId: "p-005", qty: 12, unit: "KG", price: 5400 } ], paid: 64_800 },
  { id: "s-1019", date: daysAgo(4),  branchId: "br-main",  customerId: "cu-001", priceMode: "wholesale", currency: "UZS",
    items: [ { productId: "p-001", qty: 30, unit: "PIECE", price: 51000 } ], paid: 1_530_000 },
  { id: "s-1018", date: daysAgo(5),  branchId: "br-samar", customerId: "cu-007", priceMode: "retail",    currency: "UZS",
    items: [ { productId: "p-006", qty: 2, unit: "PIECE", price: 32000 } ], paid: 64_000 },
  { id: "s-1017", date: daysAgo(6),  branchId: "br-main",  customerId: "cu-003", priceMode: "wholesale", currency: "UZS",
    items: [ { productId: "p-002", qty: 18, unit: "PIECE", price: 69500 } ], paid: 1_251_000 },
];

const PURCHASES = [
  { id: "po-501", date: daysAgo(2),  branchId: "br-main",  supplier: "AKFA Plant", currency: "UZS",
    items: [
      { productId: "p-001", qty: 220, unit: "PIECE", costPrice: 43500 },
      { productId: "p-008", qty: 60,  unit: "PIECE", costPrice: 38000 },
    ] },
  { id: "po-500", date: daysAgo(8),  branchId: "br-main",  supplier: "Glass Co.",  currency: "USD",
    items: [ { productId: "p-003", qty: 40, unit: "PIECE", costPrice: 39 } ] },
  { id: "po-499", date: daysAgo(12), branchId: "br-samar", supplier: "RubberPro",  currency: "UZS",
    items: [ { productId: "p-005", qty: 600, unit: "KG", costPrice: 3100 } ] },
];

const EXPENSES = [
  { id: "e-77", date: daysAgo(0), branchId: "br-main",  category: "salary",    amount: 12_500_000, currency: "UZS", comment: "March payroll batch 1" },
  { id: "e-76", date: daysAgo(1), branchId: "br-main",  category: "logistics", amount:  2_400_000, currency: "UZS", comment: "Truck delivery to Samarkand" },
  { id: "e-75", date: daysAgo(2), branchId: "br-samar", category: "rent",      amount:  6_000_000, currency: "UZS", comment: "Showroom rent April" },
  { id: "e-74", date: daysAgo(3), branchId: "br-main",  category: "utilities", amount:  1_180_000, currency: "UZS", comment: "Electricity" },
  { id: "e-73", date: daysAgo(4), branchId: "br-main",  category: "gas",       amount:    420_000, currency: "UZS", comment: "Forklift fuel" },
  { id: "e-72", date: daysAgo(6), branchId: "br-samar", category: "marketing", amount:  1_700_000, currency: "UZS", comment: "Local billboard" },
  { id: "e-71", date: daysAgo(8), branchId: "br-main",  category: "utilities", amount:    560_000, currency: "UZS", comment: "Water" },
];

const TRANSFERS = [
  { id: "t-204", date: daysAgo(1), fromBranchId: "br-main", toBranchId: "br-samar", status: "received",
    items: [ { productId: "p-001", qty: 80, unit: "PIECE" }, { productId: "p-005", qty: 200, unit: "KG" } ] },
  { id: "t-203", date: daysAgo(4), fromBranchId: "br-main", toBranchId: "br-samar", status: "in_transit",
    items: [ { productId: "p-003", qty: 12, unit: "PIECE" } ] },
  { id: "t-202", date: daysAgo(9), fromBranchId: "br-samar", toBranchId: "br-main",  status: "received",
    items: [ { productId: "p-006", qty: 10, unit: "PIECE" } ] },
];

const EXPENSE_CATEGORIES = [
  { id: "salary",    label: "Payroll",    color: "#1e4dd8", builtin: true },
  { id: "rent",      label: "Rent",       color: "#7c3aed", builtin: true },
  { id: "utilities", label: "Utilities",  color: "#0e7490", builtin: true },
  { id: "logistics", label: "Logistics",  color: "#b45309", builtin: true },
  { id: "gas",       label: "Fuel / gas", color: "#dc2626", builtin: true },
  { id: "marketing", label: "Marketing",  color: "#16a34a", builtin: true },
  { id: "other",     label: "Other",      color: "#475569", builtin: true },
];

export const AKFA_SEED = {
  BRANCHES, USERS, CATEGORIES, UNITS, PRODUCTS, STOCK,
  CUSTOMERS, SALES, PURCHASES, EXPENSES, TRANSFERS,
  EXPENSE_CATEGORIES,
};
