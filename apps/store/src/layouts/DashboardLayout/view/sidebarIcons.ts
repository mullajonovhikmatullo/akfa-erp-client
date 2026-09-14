import type { Icon } from '@phosphor-icons/react'
import { ArrowsLeftRightIcon } from '@phosphor-icons/react/dist/csr/ArrowsLeftRight'
import { BuildingsIcon } from '@phosphor-icons/react/dist/csr/Buildings'
import { CashRegisterIcon } from '@phosphor-icons/react/dist/csr/CashRegister'
import { ChartLineUpIcon } from '@phosphor-icons/react/dist/csr/ChartLineUp'
import { CreditCardIcon } from '@phosphor-icons/react/dist/csr/CreditCard'
import { GearSixIcon } from '@phosphor-icons/react/dist/csr/GearSix'
import { PackageIcon } from '@phosphor-icons/react/dist/csr/Package'
import { HouseLineIcon } from '@phosphor-icons/react/dist/csr/HouseLine'
import { TagIcon } from '@phosphor-icons/react/dist/csr/Tag'
import { TruckIcon } from '@phosphor-icons/react/dist/csr/Truck'
import { UserGearIcon } from '@phosphor-icons/react/dist/csr/UserGear'
import { UsersThreeIcon } from '@phosphor-icons/react/dist/csr/UsersThree'
import { WalletIcon } from '@phosphor-icons/react/dist/csr/Wallet'
import { WarehouseIcon } from '@phosphor-icons/react/dist/csr/Warehouse'

export const SIDEBAR_ICONS: Record<string, Icon> = {
  admins: UserGearIcon,
  analytics: ChartLineUpIcon,
  branches: BuildingsIcon,
  categories: TagIcon,
  customers: UsersThreeIcon,
  dashboard: HouseLineIcon,
  expenses: WalletIcon,
  billing: CreditCardIcon,
  products: PackageIcon,
  purchases: TruckIcon,
  inventory: WarehouseIcon,
  sales: CashRegisterIcon,
  settings: GearSixIcon,
  transfers: ArrowsLeftRightIcon,
}
