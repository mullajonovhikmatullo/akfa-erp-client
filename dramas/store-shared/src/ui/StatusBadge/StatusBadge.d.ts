import type { ReactNode } from 'react';
type Tone = 'success' | 'danger' | 'warning' | 'info' | 'muted';
interface StatusBadgeProps {
    tone?: Tone;
    dot?: boolean;
    children: ReactNode;
}
export declare function StatusBadge({ tone, dot, children }: StatusBadgeProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=StatusBadge.d.ts.map