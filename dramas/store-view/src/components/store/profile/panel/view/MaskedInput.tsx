import { StoreIcon } from '@store/store-shared/ui/store-icon'
import { useState } from 'react'
import { Input } from 'antd'

import { useStoreT } from '@store/store-i18n'
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
  const t = useStoreT()
  const [visible, setVisible] = useState(false)
  return (
    <Input
      type="text"
      {...blockAutofill(inputName)}
      value={value}
      onChange={(event) => onChange?.(event.target.value)}
      onBlur={onBlur}
      placeholder={placeholder}
      prefix={<StoreIcon name="lock" size={18} className="u-text-quiet" />}
      suffix={<button type="button" aria-label={t('common.togglePasswordVisibility')} onClick={() => setVisible((value) => !value)} className="u-items-center u-bg-none u-border-none u-text-muted u-cursor-pointer u-flex u-p-0" tabIndex={-1}>{visible ? <StoreIcon name="hide" size={18} /> : <StoreIcon name="eye" size={18} />}</button>}
      status={status}
      className={visible ? undefined : 'masked-input--concealed'}
    />
  )
}
