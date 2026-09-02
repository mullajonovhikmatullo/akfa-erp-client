import {
  ArrowsLeftRightIcon,
  BoxArrowDownIcon,
  CardholderIcon,
  ChartBarIcon,
  ClipboardTextIcon,
  GearIcon,
  PackageIcon,
  ShoppingCartIcon,
  SquaresFourIcon,
  StorefrontIcon,
  TagIcon,
  UserSwitchIcon,
  UsersIcon,
  WalletIcon,
} from '@phosphor-icons/react'
import type { Icon } from '@phosphor-icons/react'

export const SIDEBAR_ICONS: Record<string, Icon> = {
  admins: UserSwitchIcon,
  analytics: ChartBarIcon,
  branches: StorefrontIcon,
  categories: TagIcon,
  customers: UsersIcon,
  dashboard: SquaresFourIcon,
  expenses: WalletIcon,
  billing: CardholderIcon,
  products: PackageIcon,
  purchases: BoxArrowDownIcon,
  inventory: ClipboardTextIcon,
  sales: ShoppingCartIcon,
  settings: GearIcon,
  transfers: ArrowsLeftRightIcon,
}
