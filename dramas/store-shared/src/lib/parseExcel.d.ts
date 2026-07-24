export interface TemplateHint {
    label: string;
    items: string[];
}
export declare function parseExcelFile(file: File): Promise<Record<string, string>[]>;
export declare function downloadTemplate(headers: string[], exampleRows: string[][], fileName: string, hints?: TemplateHint[]): void;
export declare function normaliseKey(value: string): string;
export declare function getField(row: Record<string, string>, key: string): string;
export declare function parseExcelNumber(value: string): number | undefined;
export declare function hasMaxTwoDecimals(value: number): boolean;
export declare function isUuid(value: string): boolean;
//# sourceMappingURL=parseExcel.d.ts.map