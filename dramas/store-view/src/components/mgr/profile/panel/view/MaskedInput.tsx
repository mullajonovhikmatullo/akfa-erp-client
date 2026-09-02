import { useState } from 'react'
import { Input } from 'antd'

import { blockAutofill } from '@store/store-shared/lib/autofill'

interface MaskedInputProps {
  value?: string
  onChange?: (value: string) => void
  onBlur?: () => void
  inputName: string
  placeholder?: string
  status?: 'error' | undefined
}

export function MaskedInput({ value, onChange, onBlur, inputName, placeholder, status }: MaskedInputProps) {
  //
  const [visible, setVisible] = useState(false)
  return (
    <Input
      type="text"
      {...blockAutofill(inputName)}
      value={value}
      onChange={(event) => onChange?.(event.target.value)}
      onBlur={onBlur}
      placeholder={placeholder}
      prefix={<i className="icons-lock icon-size-18 u-text-quiet" />}
      suffix={<button type="button" aria-label="Toggle password visibility" onClick={() => setVisible((value) => !value)} className="u-items-center u-bg-none u-border-none u-text-muted u-cursor-pointer u-flex u-p-0" tabIndex={-1}>{visible ? <i className="icons-hide icon-size-18" /> : <i className="icons-eye icon-size-18" />}</button>}
      status={status}
      className={visible ? undefined : 'masked-input--concealed'}
    />
  )
}
