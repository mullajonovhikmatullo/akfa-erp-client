import type { StoreTranslator } from '@store/store-i18n'
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
  t: StoreTranslator
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

function readPrice(raw: Record<string, string>, field: string, t: StoreTranslator): PriceResult {
  //
  const rawValue = getField(raw, field)
  const value = parseExcelNumber(rawValue)
  if (rawValue && (value === undefined || !Number.isFinite(value))) {
    return { hasValue: true, error: t('productImport.priceInvalid', { field }) }
  }
  if (value !== undefined && value < 0) {
    return { hasValue: true, error: t('productImport.priceNegative', { field }) }
  }
  if (value !== undefined && !hasMaxTwoDecimals(value)) {
    return { hasValue: true, error: t('productImport.pricePrecision', { field }) }
  }
  return { value, hasValue: rawValue.length > 0 }
}

function getPriceValidationError(
  uzsPrices: PriceResult[],
  usdPrices: PriceResult[],
  t: StoreTranslator,
) {
  //
  const firstFieldError = [...uzsPrices, ...usdPrices].find((price) => price.error)?.error
  if (firstFieldError) return firstFieldError

  const uzsPriceCount = uzsPrices.filter((price) => price.hasValue).length
  const usdPriceCount = usdPrices.filter((price) => price.hasValue).length
  if (uzsPriceCount > 0 && uzsPriceCount !== 3) {
    return t('productImport.uzsPricesRequired')
  }
  if (usdPriceCount > 0 && usdPriceCount !== 3) {
    return t('productImport.usdPricesRequired')
  }
  if (uzsPriceCount === 0 && usdPriceCount === 0) {
    return t('productImport.pricesRequired')
  }
  if (uzsPriceCount === 3 && usdPriceCount === 3) {
    return t('productImport.singleCurrencyOnly')
  }
  return undefined
}

function getPriceOrderError(
  currency: Currency,
  cost: number,
  wholesale: number,
  retail: number,
  t: StoreTranslator,
) {
  //
  const suffix = currency === 'UZS' ? 'Uzs' : 'Usd'
  if (cost > wholesale) {
    return t('productImport.costAboveWholesale', {
      costField: `costPrice${suffix}`,
      wholesaleField: `wholesalePrice${suffix}`,
    })
  }
  if (wholesale > retail) {
    return t('productImport.wholesaleAboveRetail', {
      wholesaleField: `wholesalePrice${suffix}`,
      retailField: `retailPrice${suffix}`,
    })
  }
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
    if (!name) return { index, raw, error: t('validation.nameRequired') }
    if (name.length > 200) return { index, raw, error: t('validation.nameMax') }

    const unitRaw = getField(raw, 'unit')
    const unit = parseProductImportUnit(unitRaw)
    if (!unit) {
      return {
        index,
        raw,
        error: t('productImport.unitInvalid', { value: unitRaw || '-', values: unitHint }),
      }
    }

    const description = getField(raw, 'description') || undefined
    if (description && description.length > 500) {
      return { index, raw, error: t('productImport.descriptionMax') }
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
        error: t('productImport.categoryNotFound', { name: categoryName }),
      }
    }

    const legacyCategoryId = getField(raw, 'categoryId') || undefined
    if (legacyCategoryId && !isUuid(legacyCategoryId)) {
      return { index, raw, error: t('productImport.categoryIdInvalid') }
    }

    const thresholdRaw = getField(raw, 'lowStockThreshold')
    const lowStockThreshold = parseExcelNumber(thresholdRaw)
    if (thresholdRaw && (lowStockThreshold === undefined || !Number.isFinite(lowStockThreshold))) {
      return { index, raw, error: t('productImport.thresholdInvalid') }
    }
    const hasInvalidThresholdPrecision =
      lowStockThreshold !== undefined &&
      Math.abs(lowStockThreshold * 10000 - Math.round(lowStockThreshold * 10000)) >= 1e-9
    if (lowStockThreshold !== undefined && (lowStockThreshold < 0 || hasInvalidThresholdPrecision)) {
      return {
        index,
        raw,
        error: t('productImport.thresholdRange'),
      }
    }

    const uzsPrices = [
      readPrice(raw, 'costPriceUzs', t),
      readPrice(raw, 'retailPriceUzs', t),
      readPrice(raw, 'wholesalePriceUzs', t),
    ]
    const usdPrices = [
      readPrice(raw, 'costPriceUsd', t),
      readPrice(raw, 'retailPriceUsd', t),
      readPrice(raw, 'wholesalePriceUsd', t),
    ]
    const priceValidationError = getPriceValidationError(uzsPrices, usdPrices, t)
    if (priceValidationError) return { index, raw, error: priceValidationError }

    const hasUsdPrices = usdPrices.every((price) => price.hasValue)
    const [costPriceUzs, retailPriceUzs, wholesalePriceUzs] = hasUsdPrices
      ? [0, 0, 0]
      : uzsPrices.map((price) => price.value ?? 0)
    const [costPriceUsd, retailPriceUsd, wholesalePriceUsd] = usdPrices.map((price) => price.value)
    const priceOrderError = hasUsdPrices
      ? getPriceOrderError('USD', costPriceUsd!, wholesalePriceUsd!, retailPriceUsd!, t)
      : getPriceOrderError('UZS', costPriceUzs!, wholesalePriceUzs!, retailPriceUzs!, t)
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
