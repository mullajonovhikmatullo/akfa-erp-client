import type { ReactNode } from 'react'


interface ThemeChoiceProps {
  value: 'light' | 'dark'
  selected: boolean
  title: string
  description: string
  icon: ReactNode
  onSelect: (value: 'light' | 'dark') => void
}

export function ThemeChoice({ value, selected, title, description, icon, onSelect }: ThemeChoiceProps) {
  //
  return (
    <button
      type="button"
      className={`settings-theme-choice settings-theme-choice--${value}${selected ? ' is-selected' : ''}`}
      role="radio"
      aria-checked={selected}
      onClick={() => onSelect(value)}
    >
      <span className="settings-theme-choice__preview" aria-hidden="true">
        <i className="settings-theme-choice__sidebar" />
        <i className="settings-theme-choice__header" />
        <i className="settings-theme-choice__card settings-theme-choice__card--one" />
        <i className="settings-theme-choice__card settings-theme-choice__card--two" />
      </span>
      <span className="settings-theme-choice__copy">
        <span className="settings-theme-choice__icon">{icon}</span>
        <span><strong>{title}</strong><small>{description}</small></span>
      </span>
      <span className="settings-theme-choice__check" aria-hidden="true"><i className="icons-check icon-size-12" /></span>
    </button>
  )
}
