export function blockAutofill(name: string) {
  return {
    name,
    autoComplete: 'new-password',
    'data-lpignore': 'true',
    'data-1p-ignore': 'true',
    'data-form-type': 'other',
  } as const;
}
