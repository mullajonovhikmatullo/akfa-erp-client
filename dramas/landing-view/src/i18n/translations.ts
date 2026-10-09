import { en } from './locales/en';
import { ru } from './locales/ru';
import { uz } from './locales/uz';

export const translations = { uz, ru, en } as const;

export type Language = keyof typeof translations;

export const languageOptions: ReadonlyArray<{
  code: Language;
  shortLabel: string;
  nativeLabel: string;
}> = [
  { code: 'uz', shortLabel: 'UZ', nativeLabel: 'O‘zbekcha' },
  { code: 'ru', shortLabel: 'RU', nativeLabel: 'Русский' },
  { code: 'en', shortLabel: 'EN', nativeLabel: 'English' },
];

export const languageLocales: Record<Language, string> = {
  uz: 'ru-RU',
  ru: 'ru-RU',
  en: 'en-US',
};

export function formatMessage(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => String(values[key] ?? match));
}
