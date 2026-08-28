import type { uz } from './locales/uz';

type DeepString<T> = T extends string
  ? string
  : T extends readonly (infer Item)[]
    ? readonly DeepString<Item>[]
    : T extends object
      ? { [Key in keyof T]: DeepString<T[Key]> }
      : T;

// Every locale must keep the same keys as Uzbek, while translated values remain
// regular strings rather than Uzbek string literals.
export type TranslationDictionary = DeepString<typeof uz>;
