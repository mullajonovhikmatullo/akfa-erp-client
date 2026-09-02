export function UserAvatar({
  name,
  photo,
  size = 28,
}: {
  name?: string
  photo?: string | null
  size?: 28 | 40
}) {
  //
  const initials = (name ?? '?')
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()

  return (
    <span className={`user-avatar user-avatar--${size}`}>
      {photo ? (
        <img
          src={photo}
          alt=""
          className="u-rounded-inherit u-h-full u-object-cover u-w-full"
        />
      ) : initials}
    </span>
  )
}
