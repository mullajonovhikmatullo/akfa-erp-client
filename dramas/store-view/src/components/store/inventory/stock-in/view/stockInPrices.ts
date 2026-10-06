import type { StockInCartItem } from './types'

type PricedItem = Pick<StockInCartItem, 'currency' | 'costPrice' | 'wholesalePrice' | 'retailPrice'>

export type StockInPriceError = 'costExceedsWholesale' | 'wholesaleExceedsRetail'

export function costPriceUzs(item: PricedItem, exchangeRate: number) {
  //
  return item.currency === 'USD' ? Number((item.costPrice * exchangeRate).toFixed(2)) : item.costPrice
}

export function getPriceError(item: PricedItem): StockInPriceError | null {
  //
  if (item.wholesalePrice > item.retailPrice) return 'wholesaleExceedsRetail'
  if (item.costPrice > item.wholesalePrice) return 'costExceedsWholesale'
  return null
}

export function hasValidPrices(item: PricedItem) {
  return getPriceError(item) === null
}
