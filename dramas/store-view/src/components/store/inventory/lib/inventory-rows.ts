export function formatInventoryQuantity(value: number) {
  //
  return new Intl.NumberFormat('uz-UZ', { maximumFractionDigits: 3 }).format(value)
}
