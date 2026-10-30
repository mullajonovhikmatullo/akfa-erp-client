import { useEffect, useId, useRef, type ButtonHTMLAttributes, type ComponentProps, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Icon, type IconName } from './Icon.tsx'

const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(' ')

export { cx }

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

const BUTTON_STYLES: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-to-r from-volt to-volt-2 text-white shadow-glow hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:shadow-none',
  secondary: 'glass text-bone hover:border-volt/50 hover:bg-graphite-2 active:scale-[0.98] disabled:opacity-50',
  ghost: 'text-mist hover:text-bone hover:bg-white/5 active:scale-[0.98] disabled:opacity-40',
  danger: 'bg-blood/15 text-blood-2 border border-blood/30 hover:bg-blood/25 active:scale-[0.98] disabled:opacity-50',
}

export const Button = ({
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  className,
  children,
  ...props
}: ComponentProps<'button'> & {
  variant?: ButtonVariant
  size?: 'sm' | 'md' | 'lg'
  icon?: IconName
  iconRight?: IconName
}) => (
  <button
    type="button"
    className={cx(
      'inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition duration-150 select-none',
      size === 'sm' && 'min-h-10 px-3.5 text-sm',
      size === 'md' && 'min-h-12 px-5 text-[15px]',
      size === 'lg' && 'min-h-14 px-6 text-base',
      BUTTON_STYLES[variant],
      className,
    )}
    {...props}
  >
    {icon ? <Icon name={icon} size={size === 'sm' ? 16 : 20} /> : null}
    {children}
    {iconRight ? <Icon name={iconRight} size={size === 'sm' ? 16 : 20} /> : null}
  </button>
)

export const IconButton = ({
  icon,
  label,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { icon: IconName; label: string }) => (
  <button
    type="button"
    aria-label={label}
    title={label}
    className={cx(
      'inline-flex size-11 items-center justify-center rounded-xl text-mist transition hover:bg-white/5 hover:text-bone active:scale-95 disabled:opacity-40',
      className,
    )}
    {...props}
  >
    <Icon name={icon} />
  </button>
)

export const Card = ({ className, children, as: Tag = 'section', ...props }: { className?: string; children: ReactNode; as?: 'section' | 'div' | 'article' } & Record<string, unknown>) => (
  <Tag className={cx('glass rounded-3xl p-5', className)} {...props}>
    {children}
  </Tag>
)

export const SectionTitle = ({ children, action, id }: { children: ReactNode; action?: ReactNode; id?: string }) => (
  <div className="mb-3 flex items-center justify-between gap-3">
    <h2 id={id} className="font-display text-[13px] font-medium tracking-[0.14em] text-mist uppercase">
      {children}
    </h2>
    {action}
  </div>
)

export const ProgressBar = ({ value, label, className, tone = 'volt' }: { value: number; label: string; className?: string; tone?: 'volt' | 'ok' }) => {
  //
  const clamped = Math.max(0, Math.min(1, value))
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(clamped * 100)}
      className={cx('h-2 overflow-hidden rounded-full bg-white/8', className)}
    >
      <div
        className={cx('h-full rounded-full transition-[width] duration-700 ease-out', tone === 'volt' ? 'bar-shine' : 'bg-ok')}
        style={{ width: `${clamped * 100}%` }}
      />
    </div>
  )
}

export const Badge = ({ children, tone = 'neutral', className }: { children: ReactNode; tone?: 'neutral' | 'volt' | 'blood' | 'ok' | 'warn'; className?: string }) => (
  <span
    className={cx(
      'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold',
      tone === 'neutral' && 'bg-white/6 text-mist',
      tone === 'volt' && 'bg-volt/15 text-volt-3',
      tone === 'blood' && 'bg-blood/15 text-blood-2',
      tone === 'ok' && 'bg-ok/15 text-ok',
      tone === 'warn' && 'bg-warn/15 text-warn',
      className,
    )}
  >
    {children}
  </span>
)

export const Stat = ({ label, value, hint, icon }: { label: string; value: ReactNode; hint?: string; icon?: IconName }) => (
  <div className="rounded-2xl border border-line bg-white/[0.02] p-4">
    <div className="flex items-center gap-2 text-xs text-mist">
      {icon ? <Icon name={icon} size={14} className="text-volt-3" /> : null}
      {label}
    </div>
    <div className="mt-1.5 font-display text-2xl font-bold tracking-tight">{value}</div>
    {hint ? <div className="mt-0.5 text-xs text-fog">{hint}</div> : null}
  </div>
)

export const ChoiceCard = ({
  selected,
  onSelect,
  title,
  description,
  icon,
  multi = false,
}: {
  selected: boolean
  onSelect: () => void
  title: string
  description?: string
  icon?: IconName
  multi?: boolean
}) => (
  <button
    type="button"
    role={multi ? 'checkbox' : 'radio'}
    aria-checked={selected}
    onClick={onSelect}
    className={cx(
      'flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition duration-150 active:scale-[0.99]',
      selected ? 'border-volt/70 bg-volt/12 shadow-glow' : 'border-line bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]',
    )}
  >
    {icon ? (
      <span className={cx('flex size-10 shrink-0 items-center justify-center rounded-xl', selected ? 'bg-volt text-white' : 'bg-white/5 text-mist')}>
        <Icon name={icon} />
      </span>
    ) : null}
    <span className="min-w-0 flex-1">
      <span className="block font-semibold">{title}</span>
      {description ? <span className="mt-0.5 block text-sm text-mist">{description}</span> : null}
    </span>
    <span
      className={cx(
        'flex size-6 shrink-0 items-center justify-center border transition',
        multi ? 'rounded-md' : 'rounded-full',
        selected ? 'border-volt bg-volt text-white' : 'border-white/20',
      )}
      aria-hidden="true"
    >
      {selected ? <Icon name="check" size={14} strokeWidth={2.6} /> : null}
    </span>
  </button>
)

export const Segmented = <T extends string | number>({
  options,
  value,
  onChange,
  label,
}: {
  options: Array<{ value: T; label: string }>
  value: T
  onChange: (value: T) => void
  label: string
}) => (
  <div role="radiogroup" aria-label={label} className="flex gap-1 rounded-2xl border border-line bg-white/[0.02] p-1">
    {options.map((option) => (
      <button
        key={String(option.value)}
        type="button"
        role="radio"
        aria-checked={option.value === value}
        onClick={() => onChange(option.value)}
        className={cx(
          'min-h-11 flex-1 rounded-xl px-2 text-sm font-semibold transition',
          option.value === value ? 'bg-volt text-white shadow-glow' : 'text-mist hover:bg-white/5 hover:text-bone',
        )}
      >
        {option.label}
      </button>
    ))}
  </div>
)

export const NumberStepper = ({
  value,
  onChange,
  min = 0,
  max = 999,
  step = 1,
  label,
  suffix,
}: {
  value: number | null
  onChange: (value: number | null) => void
  min?: number
  max?: number
  step?: number
  label: string
  suffix?: string
}) => {
  //
  const id = useId()
  const current = value ?? 0
  const clamp = (next: number) => Math.max(min, Math.min(max, Math.round(next * 10) / 10))
  return (
    <div className="flex items-center gap-1 rounded-xl border border-line bg-white/[0.03]">
      <button
        type="button"
        aria-label={`${label}: kamaytirish`}
        className="flex size-10 items-center justify-center text-mist hover:text-bone"
        onClick={() => onChange(clamp(current - step))}
      >
        <Icon name="minus" size={16} />
      </button>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <input
        id={id}
        inputMode="decimal"
        type="number"
        value={value ?? ''}
        placeholder="—"
        onChange={(event) => onChange(event.target.value === '' ? null : clamp(Number(event.target.value)))}
        className="w-12 bg-transparent text-center font-display text-base font-semibold outline-none"
      />
      {suffix ? <span className="pr-1 text-xs text-fog">{suffix}</span> : null}
      <button
        type="button"
        aria-label={`${label}: oshirish`}
        className="flex size-10 items-center justify-center text-mist hover:text-bone"
        onClick={() => onChange(clamp(current + step))}
      >
        <Icon name="plus" size={16} />
      </button>
    </div>
  )
}

export const Sheet = ({
  open,
  onClose,
  title,
  children,
  wide = false,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  wide?: boolean
}) => {
  //
  const titleId = useId()
  const panelRef = useRef<HTMLDivElement>(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    if (!open) return undefined
    const previous = document.activeElement as HTMLElement | null
    const panel = panelRef.current
    panel?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCloseRef.current()
      if (event.key !== 'Tab' || !panel) return
      const focusable = panel.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (!first || !last) return
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
      previous?.focus()
    }
  }, [open])

  if (!open) return null
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      <div className="absolute inset-0 animate-[rise_0.2s_ease-out_both] bg-black/70 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cx(
          'glass relative max-h-[92dvh] w-full animate-rise overflow-y-auto rounded-t-3xl p-5 outline-none sm:rounded-3xl',
          wide ? 'sm:max-w-2xl' : 'sm:max-w-lg',
        )}
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/15 sm:hidden" aria-hidden="true" />
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 id={titleId} className="font-display text-lg font-bold">
            {title}
          </h2>
          <IconButton icon="x" label="Yopish" onClick={onClose} className="-mt-2 -mr-2" />
        </div>
        {children}
      </div>
    </div>,
    document.body,
  )
}

export const EmptyState = ({ icon, title, text, action }: { icon: IconName; title: string; text: string; action?: ReactNode }) => (
  <div className="flex flex-col items-center rounded-3xl border border-dashed border-white/10 px-6 py-10 text-center">
    <span className="mb-3 flex size-14 items-center justify-center rounded-2xl bg-volt/10 text-volt-3">
      <Icon name={icon} size={26} />
    </span>
    <h3 className="font-display text-base font-semibold">{title}</h3>
    <p className="mt-1 max-w-sm text-sm text-mist">{text}</p>
    {action ? <div className="mt-4">{action}</div> : null}
  </div>
)

export const Notice = ({ tone = 'info', title, children }: { tone?: 'info' | 'warn' | 'danger'; title?: string; children: ReactNode }) => (
  <div
    role={tone === 'danger' ? 'alert' : 'note'}
    className={cx(
      'flex gap-3 rounded-2xl border p-4 text-sm',
      tone === 'info' && 'border-volt/25 bg-volt/8 text-volt-3',
      tone === 'warn' && 'border-warn/25 bg-warn/8 text-warn',
      tone === 'danger' && 'border-blood/30 bg-blood/10 text-blood-2',
    )}
  >
    <Icon name={tone === 'info' ? 'info' : 'alert'} className="mt-0.5 shrink-0" />
    <div className="text-bone/90">
      {title ? <div className="mb-0.5 font-semibold text-bone">{title}</div> : null}
      {children}
    </div>
  </div>
)
