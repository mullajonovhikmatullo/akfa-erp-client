export type Tab = 'dashboard' | 'sales' | 'expenses' | 'inventory' | 'debt'
export type TFunc = (key: string) => string
export type DebtScope = 'overdue' | 'allDebt'
export type DebtDeadlineFilter = 'all' | 'withDeadline' | 'withoutDeadline'
export type DebtSort = 'dueDateAsc' | 'debtDesc' | 'lateDesc' | 'createdDesc'
