import type { ComponentProps } from 'react'
import { ArrowLeftIcon } from '@phosphor-icons/react/dist/csr/ArrowLeft'
import { ArrowRightIcon } from '@phosphor-icons/react/dist/csr/ArrowRight'
import { ArrowClockwiseIcon } from '@phosphor-icons/react/dist/csr/ArrowClockwise'
import { ArrowSquareOutIcon } from '@phosphor-icons/react/dist/csr/ArrowSquareOut'
import { ArrowsDownUpIcon } from '@phosphor-icons/react/dist/csr/ArrowsDownUp'
import { BuildingsIcon } from '@phosphor-icons/react/dist/csr/Buildings'
import { CaretDownIcon } from '@phosphor-icons/react/dist/csr/CaretDown'
import { CaretLeftIcon } from '@phosphor-icons/react/dist/csr/CaretLeft'
import { CaretRightIcon } from '@phosphor-icons/react/dist/csr/CaretRight'
import { ChartBarIcon } from '@phosphor-icons/react/dist/csr/ChartBar'
import { CheckIcon } from '@phosphor-icons/react/dist/csr/Check'
import { CheckCircleIcon } from '@phosphor-icons/react/dist/csr/CheckCircle'
import { ClockIcon } from '@phosphor-icons/react/dist/csr/Clock'
import { ClockCountdownIcon } from '@phosphor-icons/react/dist/csr/ClockCountdown'
import { CoinsIcon } from '@phosphor-icons/react/dist/csr/Coins'
import { CreditCardIcon } from '@phosphor-icons/react/dist/csr/CreditCard'
import { EyeIcon } from '@phosphor-icons/react/dist/csr/Eye'
import { EyeSlashIcon } from '@phosphor-icons/react/dist/csr/EyeSlash'
import { FileArrowUpIcon } from '@phosphor-icons/react/dist/csr/FileArrowUp'
import { GearSixIcon } from '@phosphor-icons/react/dist/csr/GearSix'
import { GlobeIcon } from '@phosphor-icons/react/dist/csr/Globe'
import { ImageIcon } from '@phosphor-icons/react/dist/csr/Image'
import { InfoIcon } from '@phosphor-icons/react/dist/csr/Info'
import { LockKeyIcon } from '@phosphor-icons/react/dist/csr/LockKey'
import { MagnifyingGlassIcon } from '@phosphor-icons/react/dist/csr/MagnifyingGlass'
import { MapPinIcon } from '@phosphor-icons/react/dist/csr/MapPin'
import { MinusIcon } from '@phosphor-icons/react/dist/csr/Minus'
import { MoonIcon } from '@phosphor-icons/react/dist/csr/Moon'
import { PencilSimpleIcon } from '@phosphor-icons/react/dist/csr/PencilSimple'
import { PlusIcon } from '@phosphor-icons/react/dist/csr/Plus'
import { SignOutIcon } from '@phosphor-icons/react/dist/csr/SignOut'
import { StarIcon } from '@phosphor-icons/react/dist/csr/Star'
import { SunIcon } from '@phosphor-icons/react/dist/csr/Sun'
import { TagIcon } from '@phosphor-icons/react/dist/csr/Tag'
import { TicketIcon } from '@phosphor-icons/react/dist/csr/Ticket'
import { TrashIcon } from '@phosphor-icons/react/dist/csr/Trash'
import { UploadSimpleIcon } from '@phosphor-icons/react/dist/csr/UploadSimple'
import { UserCheckIcon } from '@phosphor-icons/react/dist/csr/UserCheck'
import { UserCircleIcon } from '@phosphor-icons/react/dist/csr/UserCircle'
import { UserPlusIcon } from '@phosphor-icons/react/dist/csr/UserPlus'
import { UserSwitchIcon } from '@phosphor-icons/react/dist/csr/UserSwitch'
import { WarningCircleIcon } from '@phosphor-icons/react/dist/csr/WarningCircle'
import { XIcon } from '@phosphor-icons/react/dist/csr/X'
import { XCircleIcon } from '@phosphor-icons/react/dist/csr/XCircle'

const STORE_ICONS = {
  'arrow-down': CaretDownIcon,
  'arrow-left': ArrowLeftIcon,
  'arrow-right': ArrowRightIcon,
  building: BuildingsIcon,
  'chart-bar': ChartBarIcon,
  check: CheckIcon,
  'chevron-left': CaretLeftIcon,
  'chevron-right': CaretRightIcon,
  'circle-check': CheckCircleIcon,
  clock: ClockIcon,
  close: XIcon,
  'close-circle': XCircleIcon,
  eye: EyeIcon,
  favourite: StarIcon,
  'file-upload': FileArrowUpIcon,
  'finance-money': CoinsIcon,
  globe: GlobeIcon,
  hide: EyeSlashIcon,
  image: ImageIcon,
  'import-export': ArrowsDownUpIcon,
  info: InfoIcon,
  'location-pin': MapPinIcon,
  lock: LockKeyIcon,
  logout: SignOutIcon,
  minus: MinusIcon,
  moon: MoonIcon,
  'overdue-time': ClockCountdownIcon,
  payments: CreditCardIcon,
  'pen-line': PencilSimpleIcon,
  plus: PlusIcon,
  redirect: ArrowSquareOutIcon,
  reload: ArrowClockwiseIcon,
  search: MagnifyingGlassIcon,
  settings: GearSixIcon,
  sun: SunIcon,
  tag: TagIcon,
  tariff: TicketIcon,
  trash: TrashIcon,
  upload: UploadSimpleIcon,
  'user-add': UserPlusIcon,
  'user-circle': UserCircleIcon,
  'user-switch': UserSwitchIcon,
  user_check: UserCheckIcon,
  warning: WarningCircleIcon,
} as const

export type StoreIconName = keyof typeof STORE_ICONS

interface StoreIconProps extends Omit<ComponentProps<typeof PlusIcon>, 'ref'> {
  name: StoreIconName
}

export function StoreIcon({ name, size = 16, weight = 'regular', className, ...props }: StoreIconProps) {
  //
  const Icon = STORE_ICONS[name]

  return <Icon className={className ? `store-icon ${className}` : 'store-icon'} size={size} weight={weight} aria-hidden={props['aria-label'] ? undefined : true} {...props} />
}
