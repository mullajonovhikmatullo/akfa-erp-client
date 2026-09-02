import { Button, InputNumber } from 'antd';


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
    <div className="u-items-center u-grid u-gap-4 u-grid-cols-quantity-wide">
      <Button icon={<i className="icons-minus icon-size-16" />} onClick={onMinus} disabled={value <= 1} className="u-h-30 u-p-0 u-w-30" />
      <InputNumber<number>
        value={value > 0 ? value : null}
        onChange={(nextValue) => onChange(nextValue == null ? null : Number(nextValue))}
        min={0}
        max={max || undefined}
        step={1}
        controls={false}
        placeholder="0"
        className="u-w-full"
        formatter={(nextValue) => `${nextValue ?? ''}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
        parser={(nextValue) => Number(nextValue?.replace(/\s/g, ''))}
      />
      <Button icon={<i className="icons-plus icon-size-16" />} disabled={max > 0 && value >= max} onClick={onPlus} className="u-h-30 u-p-0 u-w-30" />
      <span
        className="u-items-center u-bg-surface-2 u-rounded-6 u-border-default u-text-muted u-inline-flex u-fs-11 u-fw-700 u-h-30 u-justify-center u-lh-none u-p-0-6 u-whitespace-nowrap"
      >
        {unitLabel}
      </span>
    </div>
  );
}
