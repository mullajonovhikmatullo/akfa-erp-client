import type { TemplateHint } from '../../lib/parseExcel';
type Translate = (key: string) => string;
export interface ParsedRow<T> {
    index: number;
    raw: Record<string, string>;
    data?: T;
    error?: string;
}
export interface ExcelImportButtonProps<T> {
    t: Translate;
    entityLabel: string;
    templateHeaders: string[];
    templateExamples: string[][];
    templateFileName: string;
    parseRow: (raw: Record<string, string>, index: number) => ParsedRow<T>;
    createFn: (data: T) => Promise<unknown>;
    onComplete?: () => void;
    disabled?: boolean;
    disabledReason?: string;
    hints?: TemplateHint[];
}
export declare function ExcelImportButton<T>({ t, entityLabel, templateHeaders, templateExamples, templateFileName, parseRow, createFn, onComplete, disabled, disabledReason, hints, }: ExcelImportButtonProps<T>): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=ExcelImportButton.d.ts.map