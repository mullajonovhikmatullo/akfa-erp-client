import type { StoreTranslator } from '@store/store-i18n'
import { getField } from '@store/store-shared/lib/parse-excel'
import type { ParsedRow } from '@store/store-shared/ui/excel-import-button'
import type { CreateCategoryPayload } from '@store/store-stub'

export function createCategoryImportParser(t: StoreTranslator) {
  //
  return (raw: Record<string, string>, index: number): ParsedRow<CreateCategoryPayload> => {
    //
    const name = getField(raw, 'name')
    if (!name) return { index, raw, error: t('categories.parseErrorName') }
    if (name.length > 100) return { index, raw, error: t('categoryImport.nameMax') }

    const description = getField(raw, 'description') || undefined
    if (description && description.length > 500) {
      return { index, raw, error: t('categoryImport.descriptionMax') }
    }
    return { index, raw, data: { name, description } }
  }
}
