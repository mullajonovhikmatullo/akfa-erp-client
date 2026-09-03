export const MAX_RECEIPT_BYTES = 4 * 1024 * 1024
export const ACCEPTED_RECEIPT_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
export const RECEIPT_ACCEPT = '.jpg,.jpeg,.png,.webp,.pdf'

export function isValidReceipt(file: File) {
  //
  return ACCEPTED_RECEIPT_TYPES.includes(file.type) && file.size <= MAX_RECEIPT_BYTES
}

export function readReceiptAsBase64(file: File) {
  //
  return new Promise<string>((resolve, reject) => {
    //
    const reader = new FileReader()
    reader.onload = () => {
      //
      const result = String(reader.result ?? '')
      const comma = result.indexOf(',')
      if (comma < 0) {
        reject(new Error('Invalid file'))
        return
      }
      resolve(result.slice(comma + 1))
    }
    reader.onerror = () => reject(reader.error ?? new Error('Unable to read file'))
    reader.readAsDataURL(file)
  })
}

