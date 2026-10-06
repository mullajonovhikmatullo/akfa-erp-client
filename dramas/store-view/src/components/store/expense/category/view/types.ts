import type { Control, FieldErrors } from 'react-hook-form'

export type CategoryCreateFormValues = {
  newName: string
}

export type CategoryEditFormValues = {
  editName: string
}

export type CategoryCreateFormControl = Control<CategoryCreateFormValues>
export type CategoryCreateFormErrors = FieldErrors<CategoryCreateFormValues>
export type CategoryEditFormControl = Control<CategoryEditFormValues>
export type CategoryEditFormErrors = FieldErrors<CategoryEditFormValues>
