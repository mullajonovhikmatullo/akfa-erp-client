import type { Currency } from '../core/domain';
export declare function formatUZS(n: number): string;
export declare function formatUSD(n: number): string;
export declare function formatCompactUZS(n: number): string;
export declare function formatMoney(n: number, currency: Currency, compact?: boolean): string;
export declare function toUZS(amount: number, currency: Currency, rate: number): number;
export declare function toUSD(amount: number, currency: Currency, rate: number): number;
export declare function formatDate(d: string | null | undefined): string;
export declare function formatDateTime(d: string | null | undefined): string;
export declare function formatRelative(d: string | null | undefined): string;
//# sourceMappingURL=formatters.d.ts.map