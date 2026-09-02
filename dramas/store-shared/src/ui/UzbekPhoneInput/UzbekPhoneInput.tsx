import { forwardRef, useImperativeHandle, useLayoutEffect, useRef } from 'react'
import { Input } from 'antd'
import type { InputRef } from 'antd'
import { formatUzbekPhone, normalizeUzbekPhone } from '../../lib/uzbekPhone'

function UzbekistanFlagIcon() {
  //
  return (
    <svg width="20" height="14" viewBox="0 0 20 14" aria-hidden="true" className="u-rounded-2 u-block">
      <rect width="20" height="14" fill="#fff" />
      <rect width="20" height="4.4" fill="#1eb5e9" />
      <rect y="4.4" width="20" height="0.55" fill="#ce1126" />
      <rect y="9.05" width="20" height="0.55" fill="#ce1126" />
      <rect y="9.6" width="20" height="4.4" fill="#1f9d55" />
      <circle cx="3.25" cy="2.2" r="1.35" fill="#fff" />
      <circle cx="3.7" cy="2.2" r="1.12" fill="#1eb5e9" />
      <g fill="#fff">
        <circle cx="6" cy="1.25" r="0.22" />
        <circle cx="7.1" cy="1.25" r="0.22" />
        <circle cx="8.2" cy="1.25" r="0.22" />
        <circle cx="6.55" cy="2.2" r="0.22" />
        <circle cx="7.65" cy="2.2" r="0.22" />
        <circle cx="8.75" cy="2.2" r="0.22" />
        <circle cx="6" cy="3.15" r="0.22" />
        <circle cx="7.1" cy="3.15" r="0.22" />
        <circle cx="8.2" cy="3.15" r="0.22" />
      </g>
    </svg>
  )
}

export interface UzbekPhoneInputProps {
  value?: string
  onChange?: (value: string) => void
  onBlur?: () => void
  disabled?: boolean
  status?: '' | 'warning' | 'error'
  id?: string
  name?: string
}

export const UzbekPhoneInput = forwardRef<InputRef, UzbekPhoneInputProps>(function UzbekPhoneInput(
  { value = '', onChange, onBlur, disabled, status, id, name },
  ref,
) {
  //
  const inputRef = useRef<InputRef>(null)
  const caretDigitIndex = useRef<number | null>(null)
  useImperativeHandle(ref, () => inputRef.current as InputRef)

  useLayoutEffect(() => {
    //
    const digitIndex = caretDigitIndex.current
    const input = inputRef.current?.input
    if (digitIndex === null || !input) return

    const formattedValue = formatUzbekPhone(value)
    let seenDigits = 0
    let caretPosition = formattedValue.length
    if (digitIndex === 0) caretPosition = 0
    else {
      for (let index = 0; index < formattedValue.length; index += 1) {
        if (/\d/.test(formattedValue.charAt(index))) seenDigits += 1
        if (seenDigits === digitIndex) {
          caretPosition = index + 1
          break
        }
      }
    }

    input.setSelectionRange(caretPosition, caretPosition)
    caretDigitIndex.current = null
  }, [value])

  return (
    <Input
      ref={inputRef}
      id={id}
      name={name}
      value={formatUzbekPhone(value)}
      onChange={(event) => {
        //
        const caretPosition = event.target.selectionStart ?? event.target.value.length
        caretDigitIndex.current = event.target.value.slice(0, caretPosition).replace(/\D/g, '').length
        onChange?.(normalizeUzbekPhone(event.target.value))
      }}
      onBlur={onBlur}
      disabled={disabled}
      status={status}
      type="tel"
      inputMode="numeric"
      autoComplete="tel"
      placeholder="90 123 45 67"
      maxLength={17}
      addonBefore={
        <span className="u-items-center u-inline-flex u-fw-600 u-gap-6">
          <UzbekistanFlagIcon />
          +998
        </span>
      }
    />
  )
})
