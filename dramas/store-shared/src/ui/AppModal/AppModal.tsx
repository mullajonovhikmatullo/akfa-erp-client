import { Modal } from 'antd'
import type { ModalProps } from 'antd'
import type { ReactNode } from 'react'

interface AppModalProps extends Omit<ModalProps, 'footer'> {
  title: string
  open: boolean
  onClose: () => void
  children: ReactNode
  width?: number
  footer: ReactNode | null
}

export function AppModal({
  title,
  open,
  onClose,
  children,
  width = 560,
  footer,
  ...rest
}: AppModalProps) {
  //
  return (
    <Modal
      className="app-modal"
      title={title}
      open={open}
      onCancel={onClose}
      width={width}
      footer={footer}
      destroyOnHidden
      maskClosable
      {...rest}
    >
      {children}
    </Modal>
  )
}
