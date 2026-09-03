import type { StoreTranslator } from '@store/store-i18n'
export type Tab = 'dashboard' | 'sales' | 'expenses' | 'inventory' | 'debt'
export type TFunc = StoreTranslator
export type DebtScope = 'overdue' | 'allDebt'
export type DebtDeadlineFilter = 'all' | 'withDeadline' | 'withoutDeadline'
export type DebtSort = 'dueDateAsc' | 'debtDesc' | 'lateDesc' | 'createdDesc'
