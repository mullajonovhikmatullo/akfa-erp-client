import { PRODUCT_UNIT_LABELS } from '@store/store-shared/core'
import { getField, hasMaxTwoDecimals, isUuid, parseExcelNumber } from '@store/store-shared/lib/parse-excel'
import type { ParsedRow } from '@store/store-shared/ui/excel-import-button'
import type { Category, CreateProductPayload, Currency, ProductUnit } from '@store/store-stub'

const PRODUCT_IMPORT_UNIT_ALIASES: Record<ProductUnit, string[]> = {
  KG: ['KG', 'KGS', 'KILOGRAM', 'KILOGRAMM', 'КГ', 'КИЛО', 'КИЛОГРАММ'],
  PIECE: ['PIECE', 'PIECES', 'PCS', 'PC', 'DONA', 'ДОНА', 'ШТ', 'ШТУК', 'ШТУКА'],
}

export const PRODUCT_IMPORT_UNITS = Object.keys(PRODUCT_IMPORT_UNIT_ALIASES) as ProductUnit[]
export const PRODUCT_FILTER_CURRENCIES: Currency[] = ['UZS', 'USD']

interface ProductImportParserOptions {
  categories: Category[]
  branchId: string
  t: (key: string) => string
}

interface PriceResult {
  value?: number
  hasValue: boolean
  error?: string
}

function normaliseUnitValue(value: string) {
  //
  return value.trim().toUpperCase().replace(/[.\s_-]+/g, '')
}

function parseProductImportUnit(value: string): ProductUnit | undefined {
  //
  const normalised = normaliseUnitValue(value)
  if (!normalised) return undefined

  return PRODUCT_IMPORT_UNITS.find((unit) => {
    //
    const acceptedValues = [unit, PRODUCT_UNIT_LABELS[unit], ...PRODUCT_IMPORT_UNIT_ALIASES[unit]]
    return acceptedValues.some((accepted) => normaliseUnitValue(accepted) === normalised)
  })
}

function normaliseLookupValue(value: string) {
  //
  return value.trim().toLowerCase().replace(/\s+/g, ' ')
}

function readPrice(raw: Record<string, string>, field: string): PriceResult {
  //
  const rawValue = getField(raw, field)
  const value = parseExcelNumber(rawValue)
  if (rawValue && (value === undefined || !Number.isFinite(value))) {
    return { hasValue: true, error: `${field} noto'g'ri kiritilgan` }
  }
  if (value !== undefined && value < 0) {
    return { hasValue: true, error: `${field} manfiy bo'lishi mumkin emas` }
  }
  if (value !== undefined && !hasMaxTwoDecimals(value)) {
    return { hasValue: true, error: `${field} ko'pi bilan 2 xonali kasr bo'lishi kerak` }
  }
  return { value, hasValue: rawValue.length > 0 }
}

function getPriceValidationError(
  uzsPrices: PriceResult[],
  usdPrices: PriceResult[],
) {
  //
  const firstFieldError = [...uzsPrices, ...usdPrices].find((price) => price.error)?.error
  if (firstFieldError) return firstFieldError

  const uzsPriceCount = uzsPrices.filter((price) => price.hasValue).length
  const usdPriceCount = usdPrices.filter((price) => price.hasValue).length
  if (uzsPriceCount > 0 && uzsPriceCount !== 3) {
    return "UZS narxlarining 3 tasi ham to'ldirilishi kerak: costPriceUzs, retailPriceUzs, wholesalePriceUzs"
  }
  if (usdPriceCount > 0 && usdPriceCount !== 3) {
    return "USD narxlarining 3 tasi ham to'ldirilishi kerak: costPriceUsd, retailPriceUsd, wholesalePriceUsd"
  }
  if (uzsPriceCount === 0 && usdPriceCount === 0) {
    return "Narxlar kiritilishi kerak: 3 ta UZS yoki 3 ta USD narxni to'ldiring"
  }
  if (uzsPriceCount === 3 && usdPriceCount === 3) {
    return 'Faqat bitta valyuta narxlarini kiriting: yoki 3 ta UZS, yoki 3 ta USD'
  }
  return undefined
}

function getPriceOrderError(
  currency: Currency,
  cost: number,
  wholesale: number,
  retail: number,
) {
  //
  if (cost > wholesale) return `costPrice${currency === 'UZS' ? 'Uzs' : 'Usd'} wholesalePrice${currency === 'UZS' ? 'Uzs' : 'Usd'} dan oshmasligi kerak`
  if (wholesale > retail) return `wholesalePrice${currency === 'UZS' ? 'Uzs' : 'Usd'} retailPrice${currency === 'UZS' ? 'Uzs' : 'Usd'} dan oshmasligi kerak`
  return undefined
}

export function createProductImportParser({
  categories,
  branchId,
  t,
}: ProductImportParserOptions) {
  //
  const unitHint = PRODUCT_IMPORT_UNITS.map((unit) => `${unit} / ${t(`units.${unit}`)}`).join(', ')

  return (raw: Record<string, string>, index: number): ParsedRow<CreateProductPayload> => {
    //
    const name = getField(raw, 'name')
    if (!name) return { index, raw, error: 'Nomi kiritilishi shart' }
    if (name.length > 200) return { index, raw, error: 'name 200 belgidan oshmasligi kerak' }

    const unitRaw = getField(raw, 'unit')
    const unit = parseProductImportUnit(unitRaw)
    if (!unit) {
      return {
        index,
        raw,
        error: `"${unitRaw || '-'}" noto'g'ri o'lchov birligi. To'g'ri qiymatlar: ${unitHint}`,
      }
    }

    const description = getField(raw, 'description') || undefined
    if (description && description.length > 500) {
      return { index, raw, error: 'description 500 belgidan oshmasligi kerak' }
    }

    const sku = getField(raw, 'sku') || undefined
    if (sku && (sku.length > 100 || !/^[A-Za-z0-9_-]+$/.test(sku))) {
      return { index, raw, error: t('validation.skuPattern') }
    }

    const categoryName = getField(raw, 'categoryName') || getField(raw, 'category')
    const matchedCategory = categoryName
      ? categories.find((category) => normaliseLookupValue(category.name) === normaliseLookupValue(categoryName))
      : undefined
    if (categoryName && !matchedCategory) {
      return {
        index,
        raw,
        error: `"${categoryName}" kategoriyasi topilmadi. Kategoriyani template ichidagi Values sahifasidan tanlang`,
      }
    }

    const legacyCategoryId = getField(raw, 'categoryId') || undefined
    if (legacyCategoryId && !isUuid(legacyCategoryId)) {
      return { index, raw, error: "categoryId UUID formatida bo'lishi kerak" }
    }

    const thresholdRaw = getField(raw, 'lowStockThreshold')
    const lowStockThreshold = parseExcelNumber(thresholdRaw)
    if (thresholdRaw && (lowStockThreshold === undefined || !Number.isFinite(lowStockThreshold))) {
      return { index, raw, error: "lowStockThreshold noto'g'ri kiritilgan" }
    }
    const hasInvalidThresholdPrecision =
      lowStockThreshold !== undefined &&
      Math.abs(lowStockThreshold * 10000 - Math.round(lowStockThreshold * 10000)) >= 1e-9
    if (lowStockThreshold !== undefined && (lowStockThreshold < 0 || hasInvalidThresholdPrecision)) {
      return {
        index,
        raw,
        error: "lowStockThreshold manfiy bo'lmasligi va 4 xonagacha kasr bo'lishi kerak",
      }
    }

    const uzsPrices = [
      readPrice(raw, 'costPriceUzs'),
      readPrice(raw, 'retailPriceUzs'),
      readPrice(raw, 'wholesalePriceUzs'),
    ]
    const usdPrices = [
      readPrice(raw, 'costPriceUsd'),
      readPrice(raw, 'retailPriceUsd'),
      readPrice(raw, 'wholesalePriceUsd'),
    ]
    const priceValidationError = getPriceValidationError(uzsPrices, usdPrices)
    if (priceValidationError) return { index, raw, error: priceValidationError }

    const hasUsdPrices = usdPrices.every((price) => price.hasValue)
    const [costPriceUzs, retailPriceUzs, wholesalePriceUzs] = hasUsdPrices
      ? [0, 0, 0]
      : uzsPrices.map((price) => price.value ?? 0)
    const [costPriceUsd, retailPriceUsd, wholesalePriceUsd] = usdPrices.map((price) => price.value)
    const priceOrderError = hasUsdPrices
      ? getPriceOrderError('USD', costPriceUsd!, wholesalePriceUsd!, retailPriceUsd!)
      : getPriceOrderError('UZS', costPriceUzs!, wholesalePriceUzs!, retailPriceUzs!)
    if (priceOrderError) return { index, raw, error: priceOrderError }

    return {
      index,
      raw,
      data: {
        name,
        description,
        sku,
        categoryId: matchedCategory?.id ?? legacyCategoryId,
        branchId,
        unit,
        lowStockThreshold,
        costPriceUzs: costPriceUzs!,
        retailPriceUzs: retailPriceUzs!,
        wholesalePriceUzs: wholesalePriceUzs!,
        costPriceUsd: hasUsdPrices ? costPriceUsd : undefined,
        retailPriceUsd: hasUsdPrices ? retailPriceUsd : undefined,
        wholesalePriceUsd: hasUsdPrices ? wholesalePriceUsd : undefined,
      },
    }
  }
}
