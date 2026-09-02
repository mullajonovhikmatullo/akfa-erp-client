import { Button, InputNumber } from 'antd';
import { MinusIcon, PlusIcon } from '@phosphor-icons/react';

interface QuantityStepperProps {
  value: number;
  max: number;
  unitLabel: string;
  onMinus: () => void;
  onPlus: () => void;
  onChange: (value: number | null) => void;
}

export function QuantityStepper({ value, max, unitLabel, onMinus, onPlus, onChange }: QuantityStepperProps) {
  //
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '30px minmax(86px, 1fr) 30px minmax(38px, auto)', gap: 4, alignItems: 'center' }}>
      <Button icon={<MinusIcon size={16} />} onClick={onMinus} disabled={value <= 1} style={{ width: 30, height: 30, padding: 0 }} />
      <InputNumber
        value={value > 0 ? value : null}
        onChange={(nextValue) => onChange(nextValue == null ? null : Number(nextValue))}
        min={0}
        max={max || undefined}
        step={1}
        controls={false}
        placeholder="0"
        style={{ width: '100%' }}
        formatter={(nextValue) => `${nextValue ?? ''}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
        parser={(nextValue) => Number(nextValue?.replace(/\s/g, '')) as unknown as 0}
      />
      <Button icon={<PlusIcon size={16} />} disabled={max > 0 && value >= max} onClick={onPlus} style={{ width: 30, height: 30, padding: 0 }} />
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
          padding: '0 6px',
          whiteSpace: 'nowrap',
        }}
      >
        {unitLabel}
      </span>
    </div>
  );
}
