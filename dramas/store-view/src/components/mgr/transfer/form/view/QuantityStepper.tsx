import { Button, InputNumber } from 'antd'
import { MinusIcon, PlusIcon } from '@phosphor-icons/react'

const MIN_QTY = 1

interface QuantityStepperProps {
  value: number
  max: number
  unitLabel: string
  onMinus: () => void
  onPlus: () => void
  onChange: (value: number | null) => void
}

export function QuantityStepper({ value, max, unitLabel, onMinus, onPlus, onChange }: QuantityStepperProps) {
  //
  const effectiveMax = Math.max(max, MIN_QTY)

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '30px minmax(96px, 1fr) 30px 38px', gap: 4, alignItems: 'center' }}>
      <Button icon={<MinusIcon size={16} />} onClick={onMinus} disabled={value <= MIN_QTY} style={{ width: 30, height: 30, padding: 0 }} />
      <InputNumber
        value={value > 0 ? value : null}
        onChange={(nextValue) => onChange(nextValue == null ? null : Number(nextValue))}
        onFocus={(event) => event.target.select()}
        min={MIN_QTY}
        step={1}
        precision={0}
        controls={false}
        status={value > max ? 'error' : undefined}
        placeholder="0"
        style={{ width: '100%' }}
        formatter={(nextValue) => `${nextValue ?? ''}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
        parser={(nextValue) => Number(nextValue?.replace(/\s/g, '')) as unknown as 0}
      />
      <Button icon={<PlusIcon size={16} />} onClick={onPlus} disabled={value >= effectiveMax} style={{ width: 30, height: 30, padding: 0 }} />
      <span
        style={{
          height: 30,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid var(--border)',
          borderRadius: 6,
          background: 'var(--surface-2)',
          color: 'var(--ink-3)',
          fontSize: 11,
          fontWeight: 700,
          lineHeight: 1,
          whiteSpace: 'nowrap',
        }}
      >
        {unitLabel}
      </span>
    </div>
  )
}
