type Tone = 'success' | 'danger' | 'warning' | 'info' | 'muted';
interface BranchNameProps {
    name: string;
    maxWidth?: number | string;
    tone?: Tone;
    as?: 'text' | 'badge';
}
export declare function BranchName({ name, maxWidth, tone, as }: BranchNameProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=BranchName.d.ts.map