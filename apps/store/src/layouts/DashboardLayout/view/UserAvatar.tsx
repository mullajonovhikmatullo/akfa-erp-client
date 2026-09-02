export function UserAvatar({
  name,
  photo,
  size = 28,
}: {
  name?: string
  photo?: string | null
  size?: number
}) {
  //
  const tone = '#0476D0'
  const initials = (name ?? '?')
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()

  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: `linear-gradient(135deg, ${tone}, ${tone}cc)`,
        color: '#fff',
        fontSize: size * 0.42,
        fontWeight: 600,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {photo ? (
        <img
          src={photo}
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }}
        />
      ) : initials}
    </span>
  )
}
