export const createOwnerSetupUrl = (setupCode: string) => {
  const configuredUrl = import.meta.env.VITE_STORE_LOGIN_URL;
  if (!configuredUrl && !import.meta.env.DEV) {
    throw new Error('VITE_STORE_LOGIN_URL production muhiti uchun majburiy');
  }

  const url = new URL(
    configuredUrl ?? 'http://127.0.0.1:5173/auth/login',
    window.location.origin,
  );
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('VITE_STORE_LOGIN_URL faqat http yoki https bo‘lishi kerak');
  }
  if (url.pathname === '/' || url.pathname === '') {
    url.pathname = '/auth/login';
  }
  url.username = '';
  url.password = '';
  url.search = '';
  url.hash = new URLSearchParams({ setup: setupCode }).toString();
  return url.toString();
};
