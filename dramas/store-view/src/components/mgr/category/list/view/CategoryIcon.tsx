interface CategoryIconProps {
  name: string
}

export function CategoryIcon({ name }: CategoryIconProps) {
  //
  const initial = name.trim()[0]?.toUpperCase() ?? '?'

  return (
    <span
      style={{
        width: 26,
        height: 26,
        borderRadius: 6,
        background: 'linear-gradient(135deg, #7c3aed, #7c3aedcc)',
        color: '#fff',
        fontSize: 11,
        fontWeight: 700,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {initial}
    </span>
  )
}
