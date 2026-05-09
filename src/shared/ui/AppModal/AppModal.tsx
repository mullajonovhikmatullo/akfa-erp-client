import { Modal, Button } from 'antd';
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

export function AppModal({
  title,
  open,
  onClose,
  onConfirm,
  confirmText = 'Save',
  confirmDanger = false,
  loading = false,
  children,
  width = 560,
  footer,
  ...rest
}: AppModalProps) {
  const defaultFooter =
    footer !== undefined
      ? footer
      : [
          <Button key="cancel" onClick={onClose} disabled={loading}>
            Cancel
          </Button>,
          onConfirm && (
            <Button
              key="confirm"
              type="primary"
              danger={confirmDanger}
              loading={loading}
              onClick={onConfirm}
            >
              {confirmText}
            </Button>
          ),
        ];

  return (
    <Modal
      title={title}
      open={open}
      onCancel={onClose}
      width={width}
      footer={defaultFooter}
      destroyOnHidden
      maskClosable={!loading}
      {...rest}
    >
      {children}
    </Modal>
  );
}
