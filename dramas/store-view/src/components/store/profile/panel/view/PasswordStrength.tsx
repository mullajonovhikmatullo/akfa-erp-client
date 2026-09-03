import type { StoreTranslator } from '@store/store-i18n'
interface PasswordStrengthProps {
  password: string
  t: StoreTranslator
}

export function PasswordStrength({ password, t }: PasswordStrengthProps) {
  //
  if (!password) return null
  const checks = [
    { label: t('pwd.minLen'), pass: password.length >= 6 },
    { label: t('pwd.hasNum'), pass: /\d/.test(password) },
    { label: t('pwd.hasLetter'), pass: /[a-zA-Z]/.test(password) },
    { label: t('pwd.maxLen'), pass: password.length <= 100 },
  ]
  const score = checks.filter((check) => check.pass).length
  const label = score <= 1 ? t('pwd.veryWeak') : score === 2 ? t('pwd.weak') : score === 3 ? t('pwd.medium') : t('pwd.strong')
  return (
    <div className={`password-strength password-strength--${score}`}>
      <div className="u-items-center u-flex u-gap-8 u-mb-8"><div className="u-flex u-flex-1 u-gap-4">{[1, 2, 3, 4].map((item) => <div key={item} className={`password-strength__bar${item <= score ? ' password-strength__bar--active' : ''}`} />)}</div><span className="password-strength__label">{label}</span></div>
      <div className="u-flex u-flex-wrap u-gap-6">{checks.map((check) => <span key={check.label} className={`password-strength__check${check.pass ? ' password-strength__check--passed' : ''}`}><span>{check.pass ? '✓' : '○'}</span> {check.label}</span>)}</div>
    </div>
  )
}
