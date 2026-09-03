import type { StoreTranslator } from '@store/store-i18n'
import { getField, isUuid, parseExcelNumber } from '@store/store-shared/lib/parse-excel'
import type { ParsedRow } from '@store/store-shared/ui/excel-import-button'
import type { CreateCustomerPayload } from '@store/store-stub'

export function createCustomerImportParser(isStoreOwner: boolean, t: StoreTranslator) {
  //
  return (raw: Record<string, string>, index: number): ParsedRow<CreateCustomerPayload> => {
    //
    const fullName = getField(raw, 'fullName')
    if (!fullName || fullName.length < 2) {
      return { index, raw, error: t('customerImport.fullNameMin') }
    }
    if (fullName.length > 150) {
      return { index, raw, error: t('customerImport.fullNameMax') }
    }

    const phone = getField(raw, 'phone') || undefined
    if (phone && !/^\+?[0-9\s\-()]{7,20}$/.test(phone)) {
      return { index, raw, error: t('customerImport.phoneInvalid') }
    }

    const address = getField(raw, 'address') || undefined
    if (address && address.length > 300) {
      return { index, raw, error: t('customerImport.addressMax') }
    }

    const balanceRaw = getField(raw, 'balance')
    const balance = parseExcelNumber(balanceRaw)
    if (balanceRaw && (balance === undefined || !Number.isFinite(balance))) {
      return { index, raw, error: t('customerImport.balanceInvalid') }
    }

    const branchId = getField(raw, 'branchId') || undefined
    if (branchId && !isUuid(branchId)) {
      return { index, raw, error: t('customerImport.branchIdInvalid') }
    }
    if (isStoreOwner && !branchId) {
      return { index, raw, error: t('customerImport.branchRequired') }
    }

    return {
      index,
      raw,
      data: { fullName, phone, address, branchId, balance },
    }
  }
}
