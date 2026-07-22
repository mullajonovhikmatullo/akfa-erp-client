import type { NameValueList } from '../api/types'

export const modifiedNameValues = <T extends Record<string, any>>(
  source: Partial<T> | undefined,
  next: Partial<T>,
  updatable: readonly (keyof T)[],
): NameValueList<T> => ({
  nameValues: updatable
    .filter((key) => source?.[key] !== next[key])
    .map((key) => ({ name: key, value: next[key] })),
})
