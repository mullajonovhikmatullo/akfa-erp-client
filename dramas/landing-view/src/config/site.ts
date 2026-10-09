// Non-translatable brand, contact, and anchor data live here. All visible copy is
// intentionally kept in the i18n dictionaries.
export const site = {
  brand: {
    name: 'Mavion',
    url: 'https://mavion.uz/',
  },
  contact: {
    phone: '+998 94 602 28 24',
    phoneHref: 'tel:+998946022824',
    email: 'hellomavionuz@gmail.com',
    emailHref: 'mailto:hellomavionuz@gmail.com',
    // TODO: add the real Telegram channel or support bot, e.g. 'https://t.me/mavion_uz'. Hidden while null.
    telegramHref: null as string | null,
    // TODO: add real social profiles ({ key: 'instagram', href: '...' }). The footer hides this row while empty.
    socials: [] as ReadonlyArray<{ key: 'instagram' | 'facebook' | 'youtube'; href: string }>,
  },
  navigation: [
    { key: 'features', href: '#imkoniyatlar' },
    { key: 'howItWorks', href: '#qanday-ishlaydi' },
    { key: 'pricing', href: '#tariflar' },
    { key: 'faq', href: '#savollar' },
  ],
} as const;

export type Site = typeof site;
