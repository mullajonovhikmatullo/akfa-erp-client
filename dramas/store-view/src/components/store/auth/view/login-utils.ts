import type { LoginLanguage } from './types';

export const rememberedUsernameKey = 'mavion-remembered-username';

export const languageOptions: Array<{ value: LoginLanguage; label: string; short: string }> = [
  { value: 'uz-la', label: "O'z", short: 'UZ' },
  { value: 'uz-cy', label: 'Ўз', short: 'Ўз' },
  { value: 'ru', label: 'Рус', short: 'RU' },
  { value: 'en', label: 'Eng', short: 'EN' },
];

export function readRememberedUsername() {
  return globalThis.localStorage?.getItem(rememberedUsernameKey) ?? '';
}
