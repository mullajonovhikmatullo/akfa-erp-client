export type MavionLogoVariant = 'light' | 'dark'

export interface MavionLogoProps {
  className?: string
  compact?: boolean
  label?: string
  size?: number
  variant?: MavionLogoVariant
  wordmarkSize?: number
}

const publicAssetBaseUrl = (
  (import.meta as ImportMeta & { env?: { BASE_URL?: string } }).env?.BASE_URL ?? '/'
).replace(/\/?$/, '/')

export function MavionLogo({
  className = '',
  compact = false,
  label = 'Mavion',
  size = 40,
  variant,
  wordmarkSize = size * 0.7,
}: MavionLogoProps) {
  //
  const brandAssetBaseUrl = `${publicAssetBaseUrl}brand`
  const wordmarkColor = variant === 'dark'
    ? '#F8FAFC'
    : variant === 'light'
      ? '#0B1530'
      : 'var(--mavion-logo-wordmark, #0B1530)'

  return (
    <div
      aria-label={label}
      className={`mavion-logo mavion-logo--${variant ?? 'auto'}${compact ? ' mavion-logo--compact' : ''}${className ? ` ${className}` : ''}`}
      role="img"
      style={{
        alignItems: 'center',
        color: wordmarkColor,
        display: 'inline-flex',
        flexShrink: 0,
        gap: compact ? 0 : Math.round(size * 0.25),
        lineHeight: 1,
        whiteSpace: 'nowrap',
      }}
    >
      <img
        alt=""
        aria-hidden="true"
        className="mavion-logo__mark"
        draggable={false}
        height={size}
        sizes={`${size}px`}
        src={`${brandAssetBaseUrl}/mavion-icon-512.png`}
        srcSet={`${brandAssetBaseUrl}/mavion-icon-64.png 64w, ${brandAssetBaseUrl}/mavion-icon-128.png 128w, ${brandAssetBaseUrl}/mavion-icon-256.png 256w, ${brandAssetBaseUrl}/mavion-icon-512.png 512w`}
        style={{
          display: 'block',
          flex: '0 0 auto',
        }}
        width={size}
      />
      {compact ? null : (
        <span
          aria-hidden="true"
          className="mavion-logo__wordmark"
          style={{
            color: 'currentColor',
            fontFamily: '"Inter Tight", Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
            fontSize: wordmarkSize,
            fontWeight: 700,
            letterSpacing: '-0.03em',
            lineHeight: 1,
          }}
        >
          Mavion
        </span>
      )}
    </div>
  )
}
