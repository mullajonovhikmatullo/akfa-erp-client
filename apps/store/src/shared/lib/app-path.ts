const APP_BASE_PATH = import.meta.env.BASE_URL ?? '/'

export function withAppBasePath(path: string) {
  //
  const base = APP_BASE_PATH.replace(/\/?$/, '/')
  return `${base}${path.replace(/^\//, '')}`
}
