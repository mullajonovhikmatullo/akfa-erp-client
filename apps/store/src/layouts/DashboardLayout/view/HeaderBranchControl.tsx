import { Controller, type Control } from 'react-hook-form'
import { Select } from 'antd'
import { MapPinIcon } from '@phosphor-icons/react'
import type { Branch } from '@store/store-stub'
import type { HeaderBranchFormValues } from '../hooks/useHeaderBranchSelection'

interface HeaderBranchControlProps {
  activeBranch?: Branch
  branches: Branch[]
  control: Control<HeaderBranchFormValues>
  isStoreOwner: boolean
  onBranchChange: (branchId: string) => void
  t: (key: string) => string
  userBranch?: Branch
}

export function HeaderBranchControl({
  activeBranch,
  branches,
  control,
  isStoreOwner,
  onBranchChange,
  t,
  userBranch,
}: HeaderBranchControlProps) {
  //
  if (!isStoreOwner) {
    return (
      <span className="branchchip topbar-hide-mobile">
        <span className="dot" /> {activeBranch?.name ?? userBranch?.name}
      </span>
    )
  }

  return (
    <Controller
      name="activeBranchId"
      control={control}
      render={({ field }) => (
        <Select
          value={field.value}
          onChange={(value) => {
            //
            field.onChange(value)
            onBranchChange(value)
          }}
          className="topbar__branch-select topbar-hide-mobile"
          suffixIcon={<MapPinIcon size={16} />}
          options={[
            { value: '__all__', label: t('header.allBranches') },
            ...branches.map((branch) => ({ value: branch.id, label: branch.name })),
          ]}
        />
      )}
    />
  )
}
