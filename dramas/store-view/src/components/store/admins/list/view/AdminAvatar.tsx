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
      className="u-items-center u-bg-gradient-teal u-rounded-full u-text-white u-inline-flex u-shrink-0 u-fs-10 u-fw-700 u-h-26 u-justify-center u-w-26"
    >
      {initials}
    </span>
  )
}
