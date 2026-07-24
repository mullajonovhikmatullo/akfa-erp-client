import { useState } from 'react'
import { Input } from 'antd'
import { EyeIcon, EyeSlashIcon, LockIcon } from '@phosphor-icons/react'
import { blockAutofill } from '@store/store-shared/lib/autofill'
import type { CSSProperties } from 'react'

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
      prefix={<LockIcon size={18} color="currentColor" style={{ color: 'var(--ink-4)' }} />}
      suffix={
        <button
          type="button"
          aria-label="Toggle password visibility"
          onClick={() => setVisible((value) => !value)}
          style={{
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            padding: 0,
            color: 'var(--ink-3)',
            display: 'flex',
            alignItems: 'center',
          }}
          tabIndex={-1}
        >
          {visible ? <EyeSlashIcon size={18} /> : <EyeIcon size={18} />}
        </button>
      }
      status={status}
      style={visible ? {} : ({ WebkitTextSecurity: 'disc', fontFamily: 'monospace' } as CSSProperties)}
    />
  )
}
