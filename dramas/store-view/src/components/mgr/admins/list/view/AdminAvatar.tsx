interface AdminAvatarProps {
  name: string
}

export function AdminAvatar({ name }: AdminAvatarProps) {
  //
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()

  return (
    <span
      style={{
        width: 26,
        height: 26,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #0e7490, #0e7490cc)',
        color: '#fff',
        fontSize: 10,
        fontWeight: 700,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {initials}
    </span>
  )
}
