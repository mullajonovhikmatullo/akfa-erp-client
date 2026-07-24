import type { Currency, Product, SaleType } from '../core/domain';
export type ProductPriceKind = 'cost' | 'retail' | 'wholesale';
type ProductPrice = {
    amount: number;
    currency: Currency;
};
export declare function getProductPrice(product: Product, kind: ProductPriceKind): ProductPrice;
export declare function getSaleProductPrice(product: Product, saleType: SaleType): ProductPrice;
export declare function getProductPriceUzs(product: Product, kind: ProductPriceKind, exchangeRate: number): number;
export declare function getSaleProductPriceUzs(product: Product, saleType: SaleType, exchangeRate: number): number;
export {};
//# sourceMappingURL=productPricing.d.ts.map