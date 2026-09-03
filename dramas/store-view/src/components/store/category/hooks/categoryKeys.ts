export const categoryKeys = {
  all: ['categories'] as const,
  list: () => ['categories', 'list'] as const,
  summary: () => ['categories', 'summary'] as const,
}
