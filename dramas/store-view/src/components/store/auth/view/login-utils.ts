import type { LoginLanguage } from './types';

export const rememberedUsernameKey = 'mavion-remembered-username';

export const languageOptions: Array<{ value: LoginLanguage; label: string }> = [
  { value: 'uz-la', label: "O'z" },
  { value: 'uz-cy', label: 'Ўз' },
  { value: 'ru', label: 'Рус' },
  { value: 'en', label: 'Eng' },
];

export function readRememberedUsername() {
  return globalThis.localStorage?.getItem(rememberedUsernameKey) ?? '';
}
