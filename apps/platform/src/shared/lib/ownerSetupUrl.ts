export const createOwnerSetupUrl = (setupCode: string) => {
  const configuredUrl = import.meta.env.VITE_STORE_LOGIN_URL;
  const url = new URL(
    configuredUrl ?? '/store/auth/login',
    window.location.origin,
  );
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('VITE_STORE_LOGIN_URL faqat http yoki https bo‘lishi kerak');
  }
  if (url.pathname === '/' || url.pathname === '') {
    url.pathname = '/store/auth/login';
  }
  url.username = '';
  url.password = '';
  url.search = '';
  url.hash = new URLSearchParams({ setup: setupCode }).toString();
  return url.toString();
};
