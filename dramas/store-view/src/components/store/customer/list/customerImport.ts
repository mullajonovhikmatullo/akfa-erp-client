import { getField, isUuid, parseExcelNumber } from '@store/store-shared/lib/parse-excel'
import type { ParsedRow } from '@store/store-shared/ui/excel-import-button'
import type { CreateCustomerPayload } from '@store/store-stub'

export function createCustomerImportParser(isStoreOwner: boolean) {
  //
  return (raw: Record<string, string>, index: number): ParsedRow<CreateCustomerPayload> => {
    //
    const fullName = getField(raw, 'fullName')
    if (!fullName || fullName.length < 2) {
      return { index, raw, error: "fullName kamida 2 belgi bo'lishi kerak" }
    }
    if (fullName.length > 150) {
      return { index, raw, error: 'fullName 150 belgidan oshmasligi kerak' }
    }

    const phone = getField(raw, 'phone') || undefined
    if (phone && !/^\+?[0-9\s\-()]{7,20}$/.test(phone)) {
      return { index, raw, error: "phone formati noto'g'ri" }
    }

    const address = getField(raw, 'address') || undefined
    if (address && address.length > 300) {
      return { index, raw, error: 'address 300 belgidan oshmasligi kerak' }
    }

    const balanceRaw = getField(raw, 'balance')
    const balance = parseExcelNumber(balanceRaw)
    if (balanceRaw && (balance === undefined || !Number.isFinite(balance))) {
      return { index, raw, error: "balance noto'g'ri kiritilgan (son bo'lishi kerak)" }
    }

    const branchId = getField(raw, 'branchId') || undefined
    if (branchId && !isUuid(branchId)) {
      return { index, raw, error: "branchId UUID formatida bo'lishi kerak" }
    }
    if (isStoreOwner && !branchId) {
      return { index, raw, error: 'branchId kiritilishi shart' }
    }

    return {
      index,
      raw,
      data: { fullName, phone, address, branchId, balance },
    }
  }
}
