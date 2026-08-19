export const PRODUCT_IMAGE_MAX_COUNT = 5
export const PRODUCT_IMAGE_MAX_SIZE_BYTES = 5 * 1024 * 1024
export const PRODUCT_IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp'

const supportedTypes = new Set(PRODUCT_IMAGE_ACCEPT.split(','))

export type Translate = (key: string) => string

export function productImageFileKey(file: File) {
  return `${file.name}:${file.size}:${file.lastModified}`
}

export function validateProductImageFile(file: File, t: Translate) {
  if (!supportedTypes.has(file.type)) return t('productImages.invalidType')
  if (file.size > PRODUCT_IMAGE_MAX_SIZE_BYTES) return t('productImages.tooLarge')
  return null
}

export function getApiErrorMessage(error: unknown, t: Translate, fallbackKey: string) {
  return getLocalizedApiErrorMessage(error, t, fallbackKey)
}
import { getLocalizedApiErrorMessage } from '@store/store-shared/lib/api-error'
