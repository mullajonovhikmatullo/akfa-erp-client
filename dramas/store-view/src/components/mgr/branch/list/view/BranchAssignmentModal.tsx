import { Controller, type Control } from 'react-hook-form'
import { Form, Modal, Select } from 'antd'
import { SelectLoadingContent } from '@store/store-shared/ui/select-loading-content'
import type { Branch } from '@store/store-stub'

export type AssignBranchFormValues = {
  userId?: string | null
}

export type BranchAssignmentOption = {
  value: string
  label: string
  disabled?: boolean
}

interface BranchAssignmentModalProps {
  t: (key: string) => string
  target: Branch | null
  control: Control<AssignBranchFormValues>
  options: BranchAssignmentOption[]
  loading: boolean
  pending: boolean
  onCancel: () => void
  onSubmit: () => void
}

export function BranchAssignmentModal({
  t,
  target,
  control,
  options,
  loading,
  pending,
  onCancel,
  onSubmit,
}: BranchAssignmentModalProps) {
  //
  return (
    <Modal
      title={`${t('branches.assignTitle')} — ${target?.name ?? ''}`}
      open={Boolean(target)}
      onCancel={onCancel}
      onOk={onSubmit}
      okText={t('branches.assignBtn')}
      confirmLoading={pending}
      destroyOnHidden
    >
      <div className="u-text-muted u-fs-13 u-mb-12">{t('branches.assignHint')}</div>
      <Form layout="vertical">
        <Form.Item label={t('branches.assignLabel')}>
          <Controller
            name="userId"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                onChange={field.onChange}
                allowClear
                placeholder={t('branches.assignPlaceholder')}
                loading={loading}
                notFoundContent={loading ? <SelectLoadingContent /> : undefined}
                options={options}
              />
            )}
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}
