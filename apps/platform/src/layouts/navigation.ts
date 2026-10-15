import { Building2, LayoutGrid, Layers, ReceiptText } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { routes } from '../config/routes';

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  shortcut: string;
}

export const navItems: NavItem[] = [
  { label: 'Umumiy', path: routes.home, icon: LayoutGrid, shortcut: '1' },
  { label: 'Kompaniyalar', path: routes.companies, icon: Building2, shortcut: '2' },
  { label: 'To‘lovlar', path: routes.payments, icon: ReceiptText, shortcut: '3' },
  { label: 'Tariflar', path: routes.plans, icon: Layers, shortcut: '4' },
];
