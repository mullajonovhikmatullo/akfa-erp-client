import type { Control, FieldErrors } from 'react-hook-form'

export type CategoryManagerFormValues = {
  newName: string
  editName: string
}

export type CategoryManagerFormControl = Control<CategoryManagerFormValues>
export type CategoryManagerFormErrors = FieldErrors<CategoryManagerFormValues>
