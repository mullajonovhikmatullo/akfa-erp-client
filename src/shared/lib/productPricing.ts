import type { Currency, Product, SaleType } from '@/shared/types/domain';

export type ProductPriceKind = 'cost' | 'retail' | 'wholesale';

type ProductPrice = {
  amount: number;
  currency: Currency;
};

const PRICE_FIELDS: Record<ProductPriceKind, { uzs: keyof Product; usd: keyof Product }> = {
  cost: { uzs: 'costPriceUzs', usd: 'costPriceUsd' },
  retail: { uzs: 'retailPriceUzs', usd: 'retailPriceUsd' },
  wholesale: { uzs: 'wholesalePriceUzs', usd: 'wholesalePriceUsd' },
};

export function getProductPrice(product: Product, kind: ProductPriceKind): ProductPrice {
  const fields = PRICE_FIELDS[kind];
  const uzs = Number(product[fields.uzs] ?? 0);
  const usdRaw = product[fields.usd];
  const usd = usdRaw == null ? null : Number(usdRaw);

  if (uzs > 0 || usd == null || usd <= 0) {
    return { amount: uzs, currency: 'UZS' };
  }

  return { amount: usd, currency: 'USD' };
}

export function getSaleProductPrice(product: Product, saleType: SaleType): ProductPrice {
  return getProductPrice(product, saleType === 'RETAIL' ? 'retail' : 'wholesale');
}

export function getProductPriceUzs(product: Product, kind: ProductPriceKind, exchangeRate: number): number {
  const price = getProductPrice(product, kind);
  return price.currency === 'USD'
    ? Number((price.amount * exchangeRate).toFixed(2))
    : price.amount;
}

export function getSaleProductPriceUzs(product: Product, saleType: SaleType, exchangeRate: number): number {
  const price = getSaleProductPrice(product, saleType);
  return price.currency === 'USD'
    ? Number((price.amount * exchangeRate).toFixed(2))
    : price.amount;
}
