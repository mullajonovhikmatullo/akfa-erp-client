export type Currency = 'UZS' | 'USD';
export type PriceMode = 'retail' | 'wholesale';
export type UserRole = 'super_admin' | 'branch_admin';
export type TransferStatus = 'PENDING' | 'COMPLETED' | 'CANCELLED';
export type CustomerType = 'retail' | 'wholesale';

export interface MoneyValue {
  amount: number;
  currency: Currency;
}

export interface Branch {
  id: string;
  name: string;
  address?: string | null;
  phone?: string | null;
  createdAt?: string;
}

export interface User {
  id: string;
  name: string;
  username: string;
  role: UserRole;
  branchId: string | null;
  isActive?: boolean;
  createdAt?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type StockMovementType = 'STOCK_IN' | 'STOCK_OUT' | 'ADJUSTMENT' | 'TRANSFER_IN' | 'TRANSFER_OUT';

export interface StockBatch {
  id: string;
  initialQty: number;
  remainingQty: number;
  costPriceUzs: number;
  costPriceUsd: number | null;
  supplierNote: string | null;
  receivedAt: string;
  createdAt: string;
  branch: { id: string; name: string };
  product: { id: string; name: string; sku: string | null; unit: ProductUnit };
  createdBy: { id: string; fullName: string };
}

export type ProductUnit = 'KG' | 'PIECE' | 'PACK' | 'METER' | 'SQUARE_METER' | 'LITER' | 'SET';

export const PRODUCT_UNIT_LABELS: Record<ProductUnit, string> = {
  KG: 'kg',
  PIECE: 'pcs',
  PACK: 'pack',
  METER: 'm',
  SQUARE_METER: 'm²',
  LITER: 'L',
  SET: 'set',
};

export interface Product {
  id: string;
  name: string;
  description: string | null;
  sku: string | null;
  unit: ProductUnit;
  categoryId: string | null;
  category: { id: string; name: string } | null;
  retailPriceUzs: number;
  wholesalePriceUzs: number;
  retailPriceUsd: number | null;
  wholesalePriceUsd: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryRecord {
  id: string;
  quantity: number;
  updatedAt: string;
  branch: { id: string; name: string };
  product: { id: string; name: string; sku: string | null; unit: ProductUnit };
}

export interface Customer {
  id: string;
  fullName: string;
  phone: string | null;
  address: string | null;
  balance: number;
  isActive: boolean;
  branchId: string;
  branch: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
}

export interface RecentSale {
  id: string;
  saleType: 'RETAIL' | 'WHOLESALE';
  totalAmountUzs: number;
  paidAmountUzs: number;
  debtAmountUzs: number;
  createdAt: string;
  _count: { items: number };
}

export type SaleType = 'RETAIL' | 'WHOLESALE';
export type PaymentMethod = 'CASH_UZS' | 'CASH_USD' | 'CARD' | 'TRANSFER' | 'MIXED' | 'CREDIT';

export const SALE_TYPE_LABELS: Record<SaleType, string> = {
  RETAIL: 'Chakana',
  WHOLESALE: 'Ulgurji',
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CASH_UZS: "Naqd (so'm)",
  CASH_USD: 'Naqd (USD)',
  CARD: 'Karta',
  TRANSFER: "O'tkazma",
  MIXED: 'Aralash',
  CREDIT: 'Nasiya',
};

export interface SaleListItem {
  id: string;
  saleType: SaleType;
  totalAmountUzs: number;
  paidAmountUzs: number;
  debtAmountUzs: number;
  debtDueDate: string | null;
  note: string | null;
  createdAt: string;
  branch: { id: string; name: string };
  customer: { id: string; fullName: string; phone: string | null } | null;
  soldBy: { id: string; fullName: string };
  _count: { items: number; payments: number };
}

export interface SaleLineItem {
  id: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  product: { id: string; name: string; sku: string | null; unit: ProductUnit };
}

export interface SalePayment {
  id: string;
  amountUzs: number;
  amountUsd: number;
  usdToUzsRate: number | null;
  paymentMethod: PaymentMethod;
  note: string | null;
  createdAt: string;
  receivedBy: { id: string; fullName: string };
}

export interface SaleDetail extends SaleListItem {
  items: SaleLineItem[];
  payments: SalePayment[];
}

export interface Expense {
  id: string;
  expenseDate: string;
  createdAt: string;
  amount: number;
  description: string | null;
  category: { id: string; name: string; description: string | null };
  branch: { id: string; name: string };
  createdBy: { id: string; fullName: string };
}

export interface ExpenseCategory {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count: { expenses: number };
}

export interface TransferLineItem {
  id: string;
  quantity: number;
  unitCostUzs: number;
  totalCostUzs: number;
  product: { id: string; name: string; sku: string | null; unit: ProductUnit };
}

export interface Transfer {
  id: string;
  status: TransferStatus;
  note: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  fromBranch: { id: string; name: string };
  toBranch: { id: string; name: string };
  initiatedBy: { id: string; fullName: string };
  completedBy: { id: string; fullName: string } | null;
  items: TransferLineItem[];
}

export type StockMap = Record<string, Record<string, number>>;
