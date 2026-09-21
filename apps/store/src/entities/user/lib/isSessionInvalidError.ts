import type { AxiosError } from 'axios'

export function isSessionInvalidError(error: unknown) {
  //
  return (error as AxiosError | undefined)?.response?.status === 401
}
