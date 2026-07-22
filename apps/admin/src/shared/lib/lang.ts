export type Lang = 'uz-cy' | 'uz-la' | 'ru' | 'en';

export function normalizeLang(lang: string): Lang {
  //
  if (lang === 'uz') return 'uz-la';
  if (['uz-cy', 'uz-la', 'ru', 'en'].includes(lang)) return lang as Lang;
  return 'uz-cy';
}
