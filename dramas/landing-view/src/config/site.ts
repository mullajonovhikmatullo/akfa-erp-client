export const site = {
  brand: {
    name: "Store Manager",
    tagline: "Ko‘p filialli savdo bizneslari uchun boshqaruv tizimi.",
  },
  contact: {
    phone: "+998 71 200 20 20",
    email: "hello@storemanager.uz",
    address: "Toshkent, O‘zbekiston",
  },
  nav: [
    { label: "Imkoniyatlar", href: "#imkoniyatlar" },
    { label: "Qanday ishlaydi", href: "#qanday-ishlaydi" },
    { label: "Tariflar", href: "#tariflar" },
    { label: "Savollar", href: "#savollar" },
  ],
  cta: {
    login: "Kirish",
    primary: "Bepul boshlash",
  },
  hero: {
    eyebrow: "Ko‘p filialli savdo uchun yagona tizim",
    heading: "Barcha filiallaringizni bitta joydan boshqaring",
    supporting:
      "Sotuvlar, filiallar, mahsulot transferlari va mijozlar bilan ishlash jarayonlarini sodda va tushunarli ERP tizimida boshqaring.",
    primaryCta: "Bepul boshlash",
    secondaryCta: "Tizimni ko‘rish",
    trial: "14 kunlik bepul sinov",
    note: "Karta talab qilinmaydi",
  },
  dashboard: {
    company: "Main Branch",
    period: "14 IYUL – 13 AVG",
    metrics: [
      { label: "Jami savdo", value: "92.8", unit: "M so‘m", tone: "blue" },
      { label: "Jami tushum", value: "67.7", unit: "M so‘m", tone: "green" },
      { label: "Jami mahsulot", value: "25.1", unit: "M so‘m", tone: "red" },
      { label: "Jami xarajatlar", value: "28.5", unit: "M so‘m", tone: "orange" },
    ],
    branches: [
      { name: "Main Branch", value: "67.7 M so‘m", color: "#3f6ee8" },
      { name: "Chilonzor filial", value: "25.1 M so‘m", color: "#8b6de3" },
      { name: "Yunusobod", value: "7.4 M so‘m", color: "#61b983" },
      { name: "Sergeli", value: "3.1 M so‘m", color: "#ef9a4d" },
    ],
  },
  trust: {
    line: "Bizga ishonayotgan bizneslar",
    logos: ["Baraka Market", "Orzu Home", "Ideal Savdo", "Nova Retail"],
  },
  problem: {
    heading: "Filiallar ko‘paygani sari nazorat murakkablashmasligi kerak",
    before: {
      title: "Avval: parokanda jarayonlar",
      items: [
        "Har bir filialda alohida nazorat",
        "Ma’lumotlar kechikib keladi",
        "Transferlar qo‘lda yuritiladi",
        "Hisobotlarni yig‘ish qiyin",
        "Xatolar va yo‘qotishlar ortadi",
      ],
    },
    after: {
      title: "Store Manager bilan: yagona tizim",
      items: [
        "Barcha filiallar bitta panelda",
        "Real vaqt rejimida ma’lumotlar",
        "Transferlar nazoratda va tezkor",
        "Hisobotlar bir zumda tayyor",
        "Samaradorlik va foyda oshadi",
      ],
    },
  },
  features: [
    {
      id: "analytics",
      title: "Boshqaruv paneli va analitika",
      description: "Sotuvlar, tushum, xarajatlar va natijalar bo‘yicha real vaqt hisobotlari.",
      visual: "chart" as const,
    },
    {
      id: "branches",
      title: "Filiallarni boshqarish",
      description: "Barcha filiallar faoliyatini bitta joydan nazorat qiling va boshqaring.",
      visual: "branches" as const,
    },
    {
      id: "transfers",
      title: "Mahsulot transferlari",
      description: "Filiallar o‘rtasida mahsulot harakatini tez va oson boshqaring.",
      visual: "transfers" as const,
    },
    {
      id: "customers",
      title: "Mijozlar bilan ishlash",
      description: "Mijozlar ma’lumotlarini saqlang va qarzdorlikni nazorat qiling.",
      visual: "customers" as const,
    },
    {
      id: "sales",
      title: "Sotuvlarni boshqarish",
      description: "Sotuv jarayonini tezlashtiring va kassa tushumini nazorat qiling.",
      visual: "sales" as const,
    },
  ],
  howItWorks: {
    heading: "Qanday ishlaydi?",
    steps: [
      {
        n: "1",
        title: "Akkaunt yarating",
        text: "Tez va oson ro‘yxatdan o‘ting va tizimga kiring.",
        icon: "user" as const,
      },
      {
        n: "2",
        title: "Filiallaringizni qo‘shing",
        text: "Barcha filiallaringizni tizimga qo‘shing va sozlang.",
        icon: "building" as const,
      },
      {
        n: "3",
        title: "Savdoni boshqarishni boshlang",
        text: "Sotuvlar, transferlar va hisobotlarni markazdan boshqaring.",
        icon: "growth" as const,
      },
    ],
  },
  pricing: {
    heading: "Sizga mos tarifni tanlang",
    note: "Barcha tariflarda 14 kunlik bepul sinov mavjud.",
    plans: [
      {
        code: "START" as const,
        name: "Start",
        price: "199 000",
        unit: "so‘m / oy",
        highlight: false,
        label: "",
        features: [
          "Bitta asos filial",
          "5 tagacha filial",
          "Asosiy hisobotlar",
          "E-mail qo‘llab-quvvatlash",
        ],
        cta: "Tanlash",
      },
      {
        code: "BUSINESS" as const,
        name: "Business",
        price: "399 000",
        unit: "so‘m / oy",
        highlight: true,
        label: "Eng ko‘p tanlanadi",
        features: [
          "Cheksiz filial",
          "Kengaytirilgan hisobotlar",
          "Transferlar nazorati",
          "Prioritet qo‘llab-quvvatlash",
        ],
        cta: "Tanlash",
      },
      {
        code: "NETWORK" as const,
        name: "Pro",
        price: "Shaxsiy tarif",
        unit: "",
        highlight: false,
        label: "",
        features: [
          "Individual funksiyalar",
          "Maxsus integratsiyalar",
          "Dedicated menejer",
          "Maxsus qo‘llab-quvvatlash",
        ],
        cta: "Bog‘lanish",
      },
    ],
  },
  faq: [
    {
      q: "Store Manager qanday bizneslar uchun mos?",
      a: "Store Manager chakana savdo, supermarket, kiyim-kechak, uy-ro‘zg‘or va ko‘p filialli boshqa savdo bizneslari uchun mos.",
    },
    {
      q: "Tizimni o‘rnatish va ishga tushirish qancha vaqt oladi?",
      a: "Akkaunt ochish bir necha daqiqa oladi. Filial va mahsulotlarni kiritgach darhol ishlashni boshlashingiz mumkin.",
    },
    {
      q: "Ma’lumotlarim xavfsizligi ta’minlanganmi?",
      a: "Ha. Ma’lumotlar himoyalangan serverlarda saqlanadi va foydalanuvchi ruxsatlari orqali nazorat qilinadi.",
    },
    {
      q: "Internet bo‘lmasa tizim ishlaydimi?",
      a: "Asosiy ma’lumotlarni sinxronlashtirish uchun internet kerak. Barqaror aloqa tiklangach ishni davom ettirish mumkin.",
    },
    {
      q: "To‘lov qanday amalga oshiriladi?",
      a: "To‘lov tanlangan tarif bo‘yicha bank o‘tkazmasi yoki taqdim etilgan elektron to‘lov usullari orqali amalga oshiriladi.",
    },
    {
      q: "Bepul sinovdan so‘ng avtomatik to‘lov olinadimi?",
      a: "Yo‘q. Bepul sinov tugagach siz tarifni o‘zingiz tanlaysiz; karta ma’lumotlari oldindan talab qilinmaydi.",
    },
  ],
  finalCta: {
    heading: "Filiallaringizni yagona tizimda boshqarishni boshlang",
    text: "14 kun davomida Store Manager imkoniyatlarini bepul sinab ko‘ring.",
    primary: "Bepul akkaunt yaratish",
    secondary: "Tariflarni ko‘rish",
  },
  footer: {
    columns: [
      {
        title: "Aloqa",
        links: [
          { label: "+998 71 200 20 20", href: "tel:+998712002020" },
          { label: "hello@storemanager.uz", href: "mailto:hello@storemanager.uz" },
          { label: "Toshkent, O‘zbekiston", href: "https://maps.google.com/?q=Toshkent%2C+O%27zbekiston" },
        ],
      },
      {
        title: "Mahsulot",
        links: [
          { label: "Imkoniyatlar", href: "#imkoniyatlar" },
          { label: "Tariflar", href: "#tariflar" },
          { label: "Qanday ishlaydi", href: "#qanday-ishlaydi" },
          { label: "Savollar", href: "#savollar" },
        ],
      },
      {
        title: "Kompaniya",
        links: [
          { label: "Biz haqimizda", href: "#biz-haqimizda" },
          { label: "Aloqa", href: "mailto:hello@storemanager.uz" },
        ],
      },
    ],
    copyright: "© 2026 Store Manager. Barcha huquqlar himoyalangan.",
  },
  subscriptionFlow: {
    heading: "Tizimni ishga tushirish oson",
    steps: ["Ariza yuboriladi", "Akkaunt yaratiladi", "Filiallar qo‘shiladi", "Ish boshlanadi"],
    note: "14 kunlik bepul sinov avtomatik boshlanadi.",
  },
  productDetail: {
    heading: "Barcha filiallar yagona ko‘rinishda",
    records: [
      { id: "SM-10582", owner: "Baraka Market", adminUrl: "baraka.storemanager.uz", plan: "Business", source: "Landing", status: "Faol" },
      { id: "SM-10581", owner: "Orzu Home", adminUrl: "orzu.storemanager.uz", plan: "Start", source: "Landing", status: "Kutilmoqda" },
      { id: "SM-10580", owner: "Ideal Savdo", adminUrl: "ideal.storemanager.uz", plan: "Pro", source: "Platform admin", status: "Tekshiruvda" },
    ],
  },
  testimonials: [
    {
      name: "Javohir M.",
      role: "3 ta filial egasi",
      quote: "Filiallar bo‘yicha sotuv va qoldiqni bitta joyda ko‘rish juda qulay.",
    },
    {
      name: "Madina R.",
      role: "Savdo tarmog‘i rahbari",
      quote: "Hisobotlarni tayyorlashga ketadigan vaqtimiz ancha qisqardi.",
    },
  ],
};

export type Site = typeof site;
