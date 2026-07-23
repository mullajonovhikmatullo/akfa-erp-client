// Single source of truth for the Kvon Admin landing page.
// Backend is not connected yet, so this copy describes the admin onboarding UI flow.

export const site = {
  brand: {
    name: "Kvon Admin",
    tagline:
      "Do‘kon egalari uchun shaxsiy admin panel, tenantlar esa global admin orqali boshqariladi.",
  },
  contact: {
    phone: "+998 71 200 20 20",
    email: "hello@kvon.uz",
    address: "Toshkent, O‘zbekiston",
  },
  nav: [
    { label: "Admin imkoniyatlari", href: "#imkoniyatlar" },
    { label: "Ochilish jarayoni", href: "#qanday-ishlaydi" },
    { label: "Tariflar", href: "#tariflar" },
    { label: "Savollar", href: "#savollar" },
  ],
  cta: {
    login: "Adminga kirish",
    primary: "Admin ochish",
  },
  hero: {
    eyebrow: "Do‘kon egasi uchun tayyor admin panel",
    heading: "Landing orqali o‘z do‘koningizga admin panel oching",
    supporting:
      "Kvon Admin do‘kon egasiga sotuv, filial, mahsulot, xodim va mijozlarni boshqaradigan shaxsiy admin muhit beradi. Har bir ochilgan admin global admin orqali yuritiladi.",
    primaryCta: "Admin ochish",
    secondaryCta: "Adminni ko‘rish",
    note: "Shaxsiy admin panel · Tenant nazorati · Global admin boshqaruvi",
  },
  dashboard: {
    company: "Ziyo Market Admin",
    period: "Bugun",
    status: "Tenant holati: Global admin tomonidan aktiv",
    metrics: [
      { label: "Bugungi savdo", value: "48 750 000", unit: "so‘m", delta: "+12.4%" },
      { label: "Faol filiallar", value: "4", unit: "ta", delta: "+1" },
      { label: "Admin xodimlar", value: "18", unit: "ta", delta: "+3" },
      { label: "Tarif muddati", value: "29", unit: "kun", delta: "aktiv" },
    ],
    chart: [
      { day: "Du", value: 31.2 },
      { day: "Se", value: 36.8 },
      { day: "Ch", value: 34.1 },
      { day: "Pa", value: 42.6 },
      { day: "Ju", value: 47.4 },
      { day: "Sh", value: 58.9 },
      { day: "Ya", value: 49.7 },
    ],
    branches: [
      { name: "Chilonzor", value: "12.8 mln" },
      { name: "Yunusobod", value: "10.6 mln" },
      { name: "Sergeli", value: "8.9 mln" },
      { name: "Olmazor", value: "7.4 mln" },
    ],
    activity: [
      "Global admin tenantni aktiv qildi",
      "Do‘kon egasi yangi xodim qo‘shdi",
      "Business tarifi 29 kun faol",
      "Chilonzor filialiga kassir roli berildi",
    ],
  },
  trust: {
    line: "Landing orqali admin panel ochadigan do‘kon egalari uchun",
    logos: ["Ziyo Market", "Orzu Home", "Ideal Savdo", "Nova Retail"],
  },
  problem: {
    heading: "Har bir do‘kon uchun admin ochish jarayoni tartibli bo‘lishi kerak",
    description:
      "Do‘kon egasi alohida admin muhitda ishlaydi, global admin esa tenant, tarif, holat va kirish ruxsatlarini markazdan nazorat qiladi.",
    before: {
      title: "Qo‘lda yuritiladigan onboarding",
      items: [
        "Admin panelni kim ochgani va kimga biriktirilgani noaniq",
        "Do‘kon egasi, filial va xodim ma’lumotlari tarqoq saqlanadi",
        "Tarif muddati va tenant holati alohida jadvalda tekshiriladi",
        "Admin ruxsatlari qo‘lda berilib, nazorat qiyinlashadi",
        "Global admin uchun tenantlar bo‘yicha umumiy ko‘rinish yo‘q",
      ],
    },
    after: {
      title: "Kvon Admin bilan tenant modeli",
      items: [
        "Landingdan kelgan ariza bitta admin ochish oqimiga tushadi",
        "Har bir do‘kon uchun alohida tenant va admin muhit tayyorlanadi",
        "Global admin tarif, muddat va aktivlik holatini boshqaradi",
        "Do‘kon egasi o‘z filial, mahsulot va xodimlarini panelda yuritadi",
        "Barcha adminlar global ro‘yxatda kuzatiladi",
      ],
    },
  },
  features: [
    {
      id: "tenant-admin",
      eyebrow: "Tenant admin",
      heading: "Do‘kon egasi uchun shaxsiy boshqaruv paneli",
      description:
        "Har bir do‘kon alohida admin panel oladi. Egasi savdo, filiallar, mahsulotlar, xodimlar va mijozlarni bir joydan boshqaradi.",
      points: [
        "Sotuv, mahsulot va filial statistikasi",
        "Admin xodimlar va rollar",
        "Tenant holati global admin bilan sinxron",
      ],
      screenshot: "dashboard" as const,
      imagePosition: "right" as const,
    },
    {
      id: "roles",
      eyebrow: "Filial va rollar",
      heading: "Do‘kon ichidagi admin huquqlari aniq ajratiladi",
      description:
        "Do‘kon egasi filial boshqaruvchisi, kassir va operator kabi rollarni belgilaydi. Har bir xodim faqat kerakli bo‘limni ko‘radi.",
      points: [
        "Filial kesimida xodimlar ro‘yxati",
        "Rol va ruxsatlarni boshqarish",
        "Faol, tekshiruvdagi va yopiq filial holatlari",
      ],
      screenshot: "branches" as const,
      imagePosition: "left" as const,
    },
    {
      id: "activation",
      eyebrow: "Admin faollashtirish",
      heading: "Landingdan kelgan ariza global admin orqali faollashadi",
      description:
        "Backend ulanmaguncha oqim UI darajasida ko‘rsatiladi: ariza olinadi, tenant yaratiladi, tarif belgilanadi va do‘kon egasiga admin kirishi beriladi.",
      points: [
        "Ariza, tenant, tarif va login bosqichlari",
        "Global admin tasdiqlash nuqtasi",
        "Do‘kon egasiga tayyor admin URL",
      ],
      screenshot: "transfer" as const,
      imagePosition: "right" as const,
    },
    {
      id: "global-admin",
      eyebrow: "Global admin",
      heading: "Barcha do‘kon adminlari markazdan boshqariladi",
      description:
        "Global admin tenantlar ro‘yxati, tarif holati, do‘kon egasi kontaktlari va admin domenlarini kuzatadi.",
      points: [
        "Yangi arizalar va faol tenantlar",
        "Tarif, muddat va bloklash holatlari",
        "Admin URL va egasi kontaktlari",
      ],
      screenshot: "customers" as const,
      imagePosition: "left" as const,
    },
  ],
  howItWorks: {
    heading: "Do‘kon egasi admin panelini ochish oqimi sodda",
    steps: [
      {
        n: "01",
        title: "Landingdan ariza qoldiriladi",
        text: "Do‘kon egasi telefon, do‘kon nomi va kerakli tarif ma’lumotlarini kiritadi.",
      },
      {
        n: "02",
        title: "Global admin tenantni tayyorlaydi",
        text: "Global admin arizani tekshiradi, tenant yaratadi va tarif muddatini belgilaydi.",
      },
      {
        n: "03",
        title: "Do‘kon egasi admin panelda ishlaydi",
        text: "Egasi o‘z adminiga kirib filial, mahsulot, xodim, sotuv va mijozlarni boshqaradi.",
      },
    ],
  },
  pricing: {
    heading: "Admin panel uchun mos tarifni tanlang",
    note: "Tariflar global admin tomonidan tenantga biriktiriladi. Backend ulanmaguncha bu oqim UI sifatida ko‘rsatiladi.",
    plans: [
      {
        name: "Start Admin",
        price: "199 000",
        unit: "so‘m / oy",
        highlight: false,
        features: [
          "1 ta do‘kon admini",
          "1 ta filial",
          "5 tagacha xodim",
          "Sotuv va mahsulot boshqaruvi",
          "Global admin ro‘yxatida tenant",
        ],
        cta: "Start admin ochish",
      },
      {
        name: "Business Admin",
        price: "399 000",
        unit: "so‘m / oy",
        highlight: true,
        label: "Ko‘p filial uchun",
        features: [
          "5 tagacha filial",
          "20 tagacha admin xodim",
          "Filiallar va rollar",
          "Mijozlar bazasi",
          "Dashboard va Excel eksport",
          "Global admin orqali tarif nazorati",
        ],
        cta: "Business admin ochish",
      },
      {
        name: "Network Admin",
        price: "Shaxsiy",
        unit: "tarif",
        highlight: false,
        features: [
          "Cheklanmagan filiallar",
          "Moslashtirilgan tenant limitlari",
          "Ko‘p admin rollari",
          "Ustuvor yordam",
          "Global admin monitoringi",
        ],
        cta: "Global admin bilan bog‘lanish",
      },
    ],
  },
  subscriptionFlow: {
    heading: "Admin faollashishi global admin orqali yuritiladi",
    steps: [
      "Ariza yuboriladi",
      "Tenant yaratiladi",
      "Tarif belgilanadi",
      "Admin panel faollashadi",
    ],
    note:
      "Hozir backend ulanmagan: landing admin ochish oqimini UI sifatida ko‘rsatadi. Keyingi bosqichda arizalar, to‘lov va faollashtirish API orqali avtomatlashtiriladi.",
  },
  productDetail: {
    heading: "Global admin uchun admin ochish arizalari va tenantlar ko‘rinishi",
    records: [
      {
        id: "ADM-10582",
        owner: "Ziyo Market",
        adminUrl: "ziyo.kvon.uz",
        plan: "Business",
        source: "Landing",
        status: "Faol",
      },
      {
        id: "ADM-10581",
        owner: "Orzu Home",
        adminUrl: "orzu.kvon.uz",
        plan: "Start",
        source: "Landing",
        status: "Kutilmoqda",
      },
      {
        id: "ADM-10580",
        owner: "Ideal Savdo",
        adminUrl: "ideal.kvon.uz",
        plan: "Network",
        source: "Global admin",
        status: "Tekshiruvda",
      },
      {
        id: "ADM-10579",
        owner: "Nova Retail",
        adminUrl: "nova.kvon.uz",
        plan: "Business",
        source: "Landing",
        status: "Faol",
      },
      {
        id: "ADM-10578",
        owner: "Atlas Market",
        adminUrl: "atlas.kvon.uz",
        plan: "Start",
        source: "Landing",
        status: "Bloklangan",
      },
    ],
  },
  testimonials: [
    {
      name: "Javohir M.",
      role: "3 ta filial egasi",
      quote:
        "Landingdan admin ochish oqimi tushunarli. Global admin tasdiqlagandan keyin do‘kon panelida xodim va filiallarni tez sozladik.",
    },
    {
      name: "Madina R.",
      role: "Global admin operatori",
      quote:
        "Tenantlar, tarif muddatlari va admin URLlarni bitta joydan ko‘rish ishni ancha tartibga soldi.",
    },
  ],
  faq: [
    {
      q: "Kvon Admin kimlar uchun?",
      a: "Kvon Admin o‘z do‘koni uchun alohida admin panel ochmoqchi bo‘lgan do‘kon egalari va ularni markazdan boshqaradigan global admin jamoasi uchun.",
    },
    {
      q: "Do‘kon egasi landing orqali nimaga ega bo‘ladi?",
      a: "Do‘kon egasi landing orqali admin ochish arizasini boshlaydi. Global admin tenantni tayyorlagandan so‘ng egaga shaxsiy admin panel beriladi.",
    },
    {
      q: "Global admin nima qiladi?",
      a: "Global admin tenantlarni yaratadi, tarif va muddatlarni belgilaydi, admin holatini aktiv yoki bloklangan qilib yuritadi va arizalarni kuzatadi.",
    },
    {
      q: "Backend hozir ulanganmi?",
      a: "Yo‘q. Hozir landing UI admin ochish va global admin boshqaruvi haqida gapiradi. Ariza, to‘lov va faollashtirish keyingi backend bosqichida ulanadi.",
    },
    {
      q: "Har bir do‘kon alohida admin panel oladimi?",
      a: "Ha. Model bo‘yicha har bir do‘kon alohida tenant/admin muhitga ega bo‘ladi, global admin esa ularning holatini markazdan boshqaradi.",
    },
    {
      q: "Xodimlarga alohida ruxsat berish mumkinmi?",
      a: "Ha. Do‘kon egasi admin panel ichida sotuvchi, kassir, filial boshqaruvchisi va boshqa rollarni alohida belgilashi mumkin.",
    },
    {
      q: "Admin panel telefon va planshetda ishlaydimi?",
      a: "UI responsive tarzda tayyorlangan. Kompyuter, planshet va smartfonlarda admin jarayonlari qulay ko‘rinadi.",
    },
  ],
  finalCta: {
    heading: "Do‘koningiz uchun shaxsiy admin panel ochishni boshlang",
    text: "Landingdan ariza boshlang, global admin esa tenant va tarifni tayyorlaydi.",
    primary: "Admin ochish",
    secondary: "Tariflarni ko‘rish",
  },
  footer: {
    columns: [
      {
        title: "Admin panel",
        links: ["Imkoniyatlar", "Tariflar", "Admin ochish"],
      },
      {
        title: "Boshqaruv",
        links: ["Global admin", "Tenantlar", "Rollar"],
      },
      {
        title: "Huquqiy",
        links: ["Foydalanish shartlari", "Maxfiylik siyosati", "Ommaviy oferta"],
      },
    ],
    copyright: "© 2026 Kvon Admin. Barcha huquqlar himoyalangan.",
  },
};

export type Site = typeof site;
