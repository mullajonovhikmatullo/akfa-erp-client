import type { ModalProps } from 'antd';
import type { ReactNode } from 'react';
interface AppModalProps extends Omit<ModalProps, 'footer'> {
    title: string;
    open: boolean;
    onClose: () => void;
    onConfirm?: () => void;
    confirmText?: string;
    confirmDanger?: boolean;
    loading?: boolean;
    children: ReactNode;
    width?: number;
    footer?: ReactNode | null;
}
export declare function AppModal({ title, open, onClose, onConfirm, confirmText, confirmDanger, loading, children, width, footer, ...rest }: AppModalProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=AppModal.d.ts.map