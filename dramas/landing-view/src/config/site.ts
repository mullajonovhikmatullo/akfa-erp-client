// Non-translatable brand, contact, and anchor data live here. All visible copy is
// intentionally kept in the i18n dictionaries.
export const site = {
  brand: {
    name: 'Mavion',
  },
  contact: {
    phone: '+998 94 602 28 24',
    phoneHref: 'tel:+998946022824',
    email: 'hellomavionuz@gmail.com',
    emailHref: 'mailto:hellomavionuz@gmail.com',
    mapHref: 'https://maps.google.com/?q=Toshkent%2C+O%27zbekiston',
  },
  navigation: [
    { key: 'features', href: '#imkoniyatlar' },
    { key: 'howItWorks', href: '#qanday-ishlaydi' },
    { key: 'pricing', href: '#tariflar' },
    { key: 'faq', href: '#savollar' },
    { key: 'company', href: '#kompaniya' },
  ],
} as const;

export type Site = typeof site;
