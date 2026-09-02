interface CategoryIconProps {
  name: string
}

export function CategoryIcon({ name }: CategoryIconProps) {
  //
  const initial = name.trim()[0]?.toUpperCase() ?? '?'

  return (
    <span
      className="u-items-center u-bg-gradient-purple u-rounded-6 u-text-white u-inline-flex u-shrink-0 u-fs-11 u-fw-700 u-h-26 u-justify-center u-w-26"
    >
      {initial}
    </span>
  )
}
