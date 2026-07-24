interface PasswordStrengthProps {
  password: string
  t: (key: string) => string
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
  const color = score <= 1 ? '#ef4444' : score === 2 ? '#f97316' : score === 3 ? '#eab308' : '#22c55e'
  const label = score <= 1 ? t('pwd.veryWeak') : score === 2 ? t('pwd.weak') : score === 3 ? t('pwd.medium') : t('pwd.strong')

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <div style={{ display: 'flex', gap: 4, flex: 1 }}>
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              style={{
                flex: 1,
                height: 4,
                borderRadius: 2,
                background: item <= score ? color : 'var(--surface-2, #e2e8f0)',
                transition: 'background 0.2s',
              }}
            />
          ))}
        </div>
        <span style={{ fontSize: 11, fontWeight: 600, color, minWidth: 60, textAlign: 'right' }}>{label}</span>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {checks.map((check) => (
          <span
            key={check.label}
            style={{
              fontSize: 11,
              color: check.pass ? '#16a34a' : 'var(--ink-4)',
              display: 'flex',
              alignItems: 'center',
              gap: 3,
            }}
          >
            <span>{check.pass ? '✓' : '○'}</span> {check.label}
          </span>
        ))}
      </div>
    </div>
  )
}
