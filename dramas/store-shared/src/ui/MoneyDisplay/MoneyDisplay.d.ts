import type { Currency } from '../../core/domain';
interface MoneyDisplayProps {
    amount: number;
    currency?: Currency;
    compact?: boolean;
    colorize?: boolean;
    noConvert?: boolean;
    displayCurrency?: Currency;
    exchangeRate?: number;
}
export declare function MoneyDisplay({ amount, currency, compact, colorize, noConvert, displayCurrency, exchangeRate, }: MoneyDisplayProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=MoneyDisplay.d.ts.map