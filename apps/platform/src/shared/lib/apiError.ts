export const apiErrorMessage = (error: unknown, fallback: string) => {
  //
  const response = (error as { response?: { data?: { message?: unknown } } }).response;
  const message = response?.data?.message;
  if (typeof message === 'string' && message.trim()) return message;
  return fallback;
};
