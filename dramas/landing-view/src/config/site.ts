export const site = {
  brand: {
    name: "Mavion",
    tagline: "Filiallaringizni yagona tizimda boshqarish uchun eng qulay yechim.",
  },
  contact: {
    phone: "+998 94 602 28 24",
    email: "hellomavionuz@gmail.com",
    address: "Toshkent, O‘zbekiston",
  },
  nav: [
    { label: "Imkoniyatlar", href: "#imkoniyatlar" },
    { label: "Qanday ishlaydi", href: "#qanday-ishlaydi" },
    { label: "Tariflar", href: "#tariflar" },
    { label: "Savollar", href: "#savollar" },
    { label: "Kompaniya", href: "#kompaniya" },
  ],
  cta: {
    login: "Kirish",
    primary: "1 oy bepul sinab ko‘ring",
  },
  hero: {
    eyebrow: "1 oy bepul · Hech qanday karta kerak emas",
    heading: "Barcha filiallaringizni yagona tizimda boshqaring",
    supporting:
      "Savdolar, tushumlar, xarajatlar va zaxiralarni real vaqtda kuzating. Bugun boshlang va tizimdan 1 oy bepul foydalaning!",
    primaryCta: "1 oy bepul sinab ko‘ring",
    secondaryCta: "Demo ko‘rish",
    trial: "1 oy to‘liq bepul",
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
    line: "Boshlash uchun hammasi tayyor",
    logos: ["1 oy bepul", "Karta talab qilinmaydi", "Tez sozlash", "Istalgan vaqtda bekor qilish", "Yordam doimo yoningizda"],
  },
  problem: {
    heading: "Nega Mavion bilan boshqarish oson?",
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
      title: "Mavion bilan: yagona tizim",
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
    heading: "1 oy bepul sinovdan keyin tariflar",
    note: "Bepul sinov muddati tugagach, o‘z biznesingizga mos tarifni tanlang.",
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
      q: "Mavion qanday bizneslar uchun mos?",
      a: "Mavion chakana savdo, supermarket, kiyim-kechak, uy-ro‘zg‘or va ko‘p filialli boshqa savdo bizneslari uchun mos.",
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
    heading: "Barcha filiallaringizni yagona tizimda boshqaring",
    text: "Bugun boshlang va tizimdan 1 oy to‘liq bepul foydalaning!",
    primary: "1 oy bepul sinab ko‘ring",
    secondary: "Demo ko‘rish",
  },
  footer: {
    columns: [
      {
        title: "Aloqa",
        links: [
          { label: "+998 94 602 28 24", href: "tel:+998946022824" },
          { label: "hellomavionuz@gmail.com", href: "mailto:hellomavionuz@gmail.com" },
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
          { label: "Aloqa", href: "mailto:hellomavionuz@gmail.com" },
        ],
      },
    ],
    copyright: "© 2026 Mavion. Barcha huquqlar himoyalangan.",
  },
  subscriptionFlow: {
    heading: "Tizimni ishga tushirish oson",
    steps: ["Ariza yuboriladi", "Akkaunt yaratiladi", "Filiallar qo‘shiladi", "Ish boshlanadi"],
    note: "14 kunlik bepul sinov avtomatik boshlanadi.",
  },
  productDetail: {
    heading: "Barcha filiallar yagona ko‘rinishda",
    records: [
      { id: "MV-10582", owner: "Baraka Market", adminUrl: "baraka.mavion.uz", plan: "Business", source: "Landing", status: "Faol" },
      { id: "MV-10581", owner: "Orzu Home", adminUrl: "orzu.mavion.uz", plan: "Start", source: "Landing", status: "Kutilmoqda" },
      { id: "MV-10580", owner: "Ideal Savdo", adminUrl: "ideal.mavion.uz", plan: "Pro", source: "Platform admin", status: "Tekshiruvda" },
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
