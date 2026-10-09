export const uz = {
  seo: {
    title: 'Mavion — barcha filiallaringiz bitta ekranda',
    description:
      'Ko‘p filialli do‘konlar uchun savdo, ombor, qarz va xarajatlarni bitta paneldan boshqarish tizimi. 14 kun bepul sinab ko‘ring.',
  },
  language: { select: 'Tilni tanlash', current: 'Joriy til: {language}' },
  theme: { toDark: 'To‘q rejimga o‘tish', toLight: 'Yorug‘ rejimga o‘tish' },
  navigation: {
    label: 'Asosiy navigatsiya',
    mobileLabel: 'Mobil navigatsiya',
    openMenu: 'Menyuni ochish',
    closeMenu: 'Menyuni yopish',
    skip: 'Asosiy mazmunga o‘tish',
    items: {
      features: 'Imkoniyatlar',
      howItWorks: 'Qanday ishlaydi',
      pricing: 'Tariflar',
      faq: 'FAQ',
    },
  },
  brand: { tagline: 'Ko‘p filialli do‘konlar uchun savdo, ombor va moliya boshqaruvi.' },
  cta: { login: 'Kirish', primary: '14 kun bepul sinab ko‘rish', tour: 'Tizimni ko‘rish' },
  hero: {
    eyebrow: 'Ko‘p filialli do‘konlar uchun',
    headingLead: 'Barcha filiallaringiz —',
    headingAccent: 'bitta ekranda',
    supporting: 'Savdo, ombor, qarz va foyda real vaqtda. Daftar va Excel o‘rniga hammasi bitta panelda.',
    badges: ['Karta talab qilinmaydi', '14 kun bepul'],
  },
  mock: {
    label: 'Mavion boshqaruv paneli ko‘rinishi (namunaviy ma’lumotlar)',
    sample: 'Namunaviy ma’lumotlar',
    title: 'Boshqaruv paneli',
    branchAll: 'Barcha filiallar',
    period: 'Bugun',
    kpis: { sales: 'Davr savdosi', revenue: 'Tushum', debt: 'Qarz', expense: 'Xarajat' },
    chartTitle: 'Savdo dinamikasi',
    donutTitle: 'To‘lov usullari',
    methods: { cash: 'Naqd', card: 'Karta', transfer: 'O‘tkazma', credit: 'Qarzga' },
    currency: 'so‘m',
    millionShort: 'mln',
  },
  pain: {
    kicker: 'Daftar va Excel o‘rniga',
    heading: 'Tanish muammolar — aniq yechimlar',
    supporting: 'Mavion do‘kon egasi har kuni duch keladigan chalkashliklarni bitta tizimda yechadi.',
    beforeTitle: 'Hozir',
    afterTitle: 'Mavion bilan',
    rows: [
      {
        before: 'Qarzlar daftarda yoziladi, kim qancha qarzligi aniq emas',
        after: 'Har bir mijozning balansi, qarzi va to‘lov tarixi bir joyda',
      },
      {
        before: 'Qaysi filialda qancha tovar qolganini bilish uchun qo‘ng‘iroq qilasiz',
        after: 'Har bir filialning real qoldig‘i va kam qolgan tovarlar ro‘yxati',
      },
      {
        before: 'Kassada nima sotilganini kechqurun tekshirib chiqish qiyin',
        after: 'Har bir sotuv kim tomonidan, qaysi filialda va qanday to‘lov bilan qilingani yozib boriladi',
      },
      {
        before: 'Dollardagi tovar narxini har safar qo‘lda hisoblaysiz',
        after: 'Dollardagi narx Markaziy bank kursi bo‘yicha avtomatik so‘mga aylanadi',
      },
      {
        before: 'Oy oxirida aniq foyda qancha bo‘lganini bilmaysiz',
        after: 'Sof foyda = to‘langan summa − xarajatlar, istalgan davr uchun',
      },
    ],
  },
  features: {
    kicker: 'Imkoniyatlar',
    heading: 'Do‘kon uchun kerak bo‘lgan hamma narsa',
    supporting: 'Kassadan tortib analitikagacha — har bir modul bir-biri bilan bog‘langan.',
    items: [
      { title: 'Tezkor kassa', text: 'Chakana yoki ulgurji sotuv, mahsulotni kod yoki nom bo‘yicha qidirish, joyida yangi mijoz qo‘shish.' },
      { title: 'Mijozlar va qarzlar', text: 'Qarzga yoki qisman to‘lov bilan sotish, qarzdorlar ro‘yxati va qarz to‘lovlarini qabul qilish.' },
      { title: 'Ombor va kam qolgan tovarlar', text: 'Tovar kirimi partiyalar bo‘yicha, real qoldiq va “kam qolish” chegarasi.' },
      { title: 'Filiallararo transfer', text: 'Tovarni filiallar orasida ko‘chiring, qabul qiluvchi filial tasdiqlaydi.' },
      { title: 'Xarajatlar va sof foyda', text: 'Xarajatlarni kategoriyalar bo‘yicha yozing va sof foydani ko‘ring.' },
      { title: 'Analitika', text: 'Savdo, xarajat, ombor va qarzdorlik bo‘yicha kunlik va davriy hisobotlar.' },
      { title: 'Rollar va filial adminlari', text: 'Har bir filialga administrator biriktiring — u faqat o‘z filialini ko‘radi.' },
      { title: 'So‘m, dollar va MB kursi', text: 'Kurs Markaziy bankdan olinadi, qo‘lda o‘zgartirish faqat egasining paroli bilan.' },
    ],
  },
  modules: {
    kicker: 'Modullar',
    heading: 'Har bir bo‘lim ichidan ko‘ring',
    supporting: 'To‘rt asosiy bo‘lim — savdo, ombor, moliya va tahlil.',
    tabsLabel: 'Mavion modullari',
    tabs: {
      sales: {
        label: 'Savdo',
        title: 'Kassa va mijozlar',
        text: 'Sotuv oynasi kassir uchun sodda: mahsulotni toping, miqdorni kiriting, to‘lov usulini tanlang.',
        points: [
          'Chakana va ulgurji sotuv turlari',
          'To‘lov: naqd, karta, o‘tkazma, aralash yoki qarzga',
          'Qisman to‘lov — qolgan summa mijozning qarziga yoziladi',
          'Mijozlar bazasi, balans va to‘lov tarixi, Excel import',
        ],
      },
      warehouse: {
        label: 'Ombor',
        title: 'Kirim, qoldiq va transferlar',
        text: 'Kirim, sotuv va transferlardan keyingi real qoldiqni har bir filial bo‘yicha ko‘ring.',
        points: [
          'Mahsulot kodi, o‘lchov birligi (dona / kg), tan, optom va dona narx',
          'Tovar kirimi partiyalar bo‘yicha, yetkazib beruvchi bilan',
          'Jami dona, jami kg va qoldiq qiymati',
          'Transferlar holati: kutilmoqda yoki tasdiqlangan',
        ],
      },
      finance: {
        label: 'Moliya',
        title: 'Xarajatlar va obuna',
        text: 'Har bir xarajat kategoriya, filial va kirituvchi bilan yoziladi.',
        points: [
          'Xarajatlar kategoriyalar bo‘yicha',
          'Qaysi filialda kim kiritgani ko‘rinadi',
          'Sof foyda = to‘langan summa − xarajatlar',
          'Obuna: tarif, to‘lov cheki va tasdiqlash tarixi',
        ],
      },
      analytics: {
        label: 'Tahlil',
        title: 'Boshqaruv paneli va analitika',
        text: 'Kunlik va boshqa davrlar uchun savdo, xarajat, ombor va qarzdorlik ko‘rsatkichlari.',
        points: [
          'Soatbay savdo dinamikasi va to‘lov usullari diagrammasi',
          'O‘rtacha chek va sof foyda',
          'Eng ko‘p sotilganlar — soni va tushumi bo‘yicha',
          'Kam qolgan mahsulotlar va yirik qarzdorlar',
        ],
      },
    },
    salesMock: {
      retail: 'Chakana', wholesale: 'Ulgurji', customer: 'Mijoz', customerName: 'Aziz Karimov',
      search: 'Kod yoki nom bo‘yicha qidirish',
      items: [
        { name: 'Shakar 1 kg', qty: '2 dona', price: '56 000' },
        { name: 'Kofe 200 g', qty: '1 dona', price: '$4.50' },
        { name: 'Guruch', qty: '1.5 kg', price: '27 000' },
      ],
      total: 'Jami', paid: 'To‘langan', debt: 'Qarzga',
      methods: ['Naqd', 'Karta', 'O‘tkazma', 'Aralash', 'Qarzga'],
    },
    warehouseMock: {
      title: 'Ombor qoldig‘i', product: 'Mahsulot', stock: 'Qoldiq', low: 'Kam qoldi',
      rows: [
        { name: 'Sement M400', stock: '120 qop', low: false },
        { name: 'Mineral suv 1.5 l', stock: '8 dona', low: true },
        { name: 'Kafel yelimi', stock: '46 qop', low: false },
      ],
      transfer: 'Transfer', transferRoute: 'Asosiy → Chilonzor', pending: 'Kutilmoqda', confirmed: 'Tasdiqlangan',
    },
    financeMock: {
      title: 'Xarajatlar', rows: [
        { category: 'Ijara', amount: '6 000 000' },
        { category: 'Ish haqi', amount: '9 500 000' },
        { category: 'Kommunal', amount: '1 200 000' },
      ],
      netProfit: 'Sof foyda', paid: 'To‘langan', expenses: 'Xarajatlar',
    },
    analyticsMock: {
      topTitle: 'Eng ko‘p sotilganlar', top: ['Shakar', 'Mineral suv', 'Guruch', 'Kofe'],
      debtorsTitle: 'Yirik qarzdorlar', debtors: [{ name: 'Baraka Market', amount: '4 200 000' }, { name: 'Javohir', amount: '1 850 000' }],
      avgCheck: 'O‘rtacha chek',
    },
  },
  branches: {
    kicker: 'Ko‘p filial',
    heading: 'Egasi hammasini ko‘radi, admin — o‘z filialini',
    supporting:
      'Har bir filialga administrator biriktiriladi. Egasi “Barcha filiallar” yoki bitta filial bo‘yicha ko‘radi, tovar esa filiallar orasida transfer bilan ko‘chadi.',
    owner: 'Do‘kon egasi', ownerNote: 'Barcha filiallar',
    branchNames: ['Asosiy filial', 'Chilonzor filiali', 'Yunusobod filiali'],
    admin: 'Filial admini', adminNote: 'Faqat o‘z filiali',
    transfer: 'Transfer', transferNote: 'Qabul qiluvchi filial tasdiqlaydi',
    points: [
      'Global filtr: barcha filiallar yoki bitta filial',
      'Filial admini faqat o‘z filialining ma’lumotlarini ko‘radi',
      'Transfer holati: kutilmoqda → tasdiqlangan',
    ],
  },
  howItWorks: {
    kicker: 'Qanday ishlaydi',
    heading: 'Uch qadamda ishga tushiring',
    steps: [
      { title: 'Ro‘yxatdan o‘ting', text: 'Tarifni tanlang, do‘kon ma’lumotlarini kiriting — 14 kunlik sinov darhol boshlanadi.' },
      { title: 'Mahsulotlarni Excel’dan yuklang', text: 'Mahsulotlar, kategoriyalar va mijozlarni Excel fayldan import qiling.' },
      { title: 'Sotishni boshlang', text: 'Filial va adminlarni qo‘shing, kassada birinchi sotuvni qiling.' },
    ],
  },
  local: {
    kicker: 'Mahalliy moslik',
    heading: 'O‘zbekistondagi do‘konlar uchun qurilgan',
    items: [
      { title: '4 til', text: 'O‘zbekcha (lotin va kirill), ruscha va inglizcha.' },
      { title: 'So‘m va dollar', text: 'Narxlar so‘mda yoki dollarda, ko‘rinish valyutasini tanlaysiz.' },
      { title: 'Markaziy bank kursi', text: 'Kurs avtomatik olinadi, o‘zgartirish faqat egasining paroli bilan.' },
      { title: 'Yorug‘ va to‘q rejim', text: 'Ko‘zga qulay mavzuni tanlang.' },
      { title: 'Har qanday qurilmada', text: 'Kompyuter, planshet yoki telefonda — brauzer orqali ishlaydi.' },
      { title: 'Excel import', text: 'Mavjud ro‘yxatlaringizni qaytadan yozmasdan yuklang.' },
    ],
  },
  testimonials: { heading: 'Mijozlarimiz fikri' },
  pricing: {
    kicker: 'Tariflar',
    heading: 'Oddiy va shaffof narxlar',
    note: 'To‘lov faqat sinov muddati tugagach, tanlangan tarif bo‘yicha boshlanadi.',
    trialTitle: '14 kun bepul sinov',
    trialText: 'Tanlagan tarifingizning barcha imkoniyatlari ochiq. Karta talab qilinmaydi.',
    afterTrial: 'Sinovdan keyingi narx',
    empty: 'Tariflar hozircha mavjud emas.',
    loadError: 'Tariflarni yuklab bo‘lmadi. Iltimos, keyinroq qayta urinib ko‘ring.',
    monthlyUnit: 'so‘m / oy', defaultCta: 'Bepul sinovni boshlash',
    limits: {
      unlimitedBranches: 'Cheksiz filial', mainStoreOnly: 'Faqat asosiy filial',
      additionalBranches: '1 asosiy + {count} qo‘shimcha filial', unlimitedUsers: 'Cheksiz foydalanuvchi',
      users: '{count} tagacha faol foydalanuvchi', unlimitedProducts: 'Cheksiz mahsulot', products: '{count} tagacha faol mahsulot',
    },
    plans: {
      START: { name: 'Start', badge: '', highlight: false, features: ['Asosiy hisobotlar', 'E-mail orqali qo‘llab-quvvatlash'], cta: 'Bepul sinovni boshlash' },
      BUSINESS: { name: 'Business', badge: 'Ommabop', highlight: true, features: ['Kengaytirilgan hisobotlar', 'Transferlar nazorati', 'Prioritet qo‘llab-quvvatlash'], cta: 'Bepul sinovni boshlash' },
      NETWORK: { name: 'Network', badge: '', highlight: false, features: [], cta: 'Bog‘lanish' },
    },
  },
  faq: {
    kicker: 'FAQ',
    heading: 'Ko‘p so‘raladigan savollar',
    items: [
      {
        question: 'Sinov muddati tugagach nima bo‘ladi?',
        answer:
          'Hech narsa avtomatik yechilmaydi — karta so‘ralmaydi. Ma’lumotlaringiz saqlanib qoladi va ko‘rinib turadi, yangi sotuv va kirim kiritish esa obuna to‘lovi tasdiqlangach davom etadi.',
      },
      {
        question: 'Ma’lumotlarim xavfsizmi?',
        answer:
          'Har bir do‘konning ma’lumotlari alohida saqlanadi, xodimlar faqat ruxsat berilgan filialni ko‘radi. Parollar shifrlangan holda saqlanadi, ma’lumotlar bazasidan har kuni zaxira nusxa olinadi.',
      },
      {
        question: 'Mahsulotlarni Excel’dan yuklasa bo‘ladimi?',
        answer: 'Ha. Mahsulotlar, kategoriyalar va mijozlarni Excel fayldan import qilish mumkin.',
      },
      {
        question: 'Qarzga sotish qanday ishlaydi?',
        answer:
          'Sotuvda mijozni tanlaysiz va to‘liq, qisman yoki qarzga to‘lovni belgilaysiz. Qolgan summa mijozning qarziga yoziladi, keyin qarz to‘lovlarini qabul qilasiz va har bir mijozning tarixini ko‘rasiz.',
      },
      {
        question: 'Dollar kursi qanday hisoblanadi?',
        answer:
          'Kurs avtomatik Markaziy bankdan olinadi. Dollardagi narxli tovarlar shu kurs bo‘yicha so‘mga aylanadi, to‘lov esa so‘mda qabul qilinadi. Kursni qo‘lda o‘zgartirish faqat do‘kon egasining paroli bilan mumkin.',
      },
      {
        question: 'Keyinroq filial qo‘shsam bo‘ladimi?',
        answer:
          'Ha, tarifingiz doirasida istalgan vaqtda: Start — 1 asosiy + 2 qo‘shimcha filial, Business — 1 asosiy + 5 qo‘shimcha filial.',
      },
      {
        question: 'Obuna to‘lovi qanday qilinadi?',
        answer:
          'To‘lovni amalga oshirib, to‘lov chekini paneldagi “Obuna va to‘lovlar” bo‘limiga yuklaysiz. Chek tekshirilgach obuna faollashadi, barcha to‘lovlar tarixi shu yerda saqlanadi.',
      },
      {
        question: 'Qaysi qurilmalarda ishlaydi?',
        answer:
          'Mavion brauzerda ishlaydi — kompyuter, planshet yoki telefonda alohida dastur o‘rnatish shart emas. Ishlash uchun internet kerak.',
      },
    ],
  },
  finalCta: {
    heading: 'Filiallaringizni bugundan bitta ekranda boshqaring',
    text: '14 kun bepul. Karta talab qilinmaydi.',
    primary: '14 kun bepul sinab ko‘rish', secondary: 'Kirish',
  },
  footer: {
    product: 'Mahsulot', contact: 'Aloqa', address: 'Toshkent, O‘zbekiston', telegram: 'Telegram',
    copyright: '© {year} Mavion. Barcha huquqlar himoyalangan.',
  },
  registration: {
    close: 'Yopish', title: 'Bepul akkaunt yaratish',
    intro: 'Ma’lumotlarni kiriting — do‘kon boshqaruv paneli bir necha soniyada tayyor bo‘ladi.',
    storeSection: 'Do‘kon ma’lumotlari', accountSection: 'Kirish ma’lumotlari',
    fields: {
      storeName: 'Do‘kon nomi', storeNamePlaceholder: 'Masalan: Baraka Market', ownerName: 'Do‘kon egasi',
      ownerNamePlaceholder: 'Ism va familiya', phone: 'Telefon raqami', email: 'Email', optional: 'ixtiyoriy',
      username: 'Login', usernamePlaceholder: 'Login kiriting', password: 'Parol', passwordPlaceholder: 'Kamida 6 ta belgi',
      confirmPassword: 'Parolni tasdiqlang', confirmPasswordPlaceholder: 'Parolni qayta kiriting',
    },
    showPassword: 'Parolni ko‘rsatish', hidePassword: 'Parolni yashirish',
    showConfirmPassword: 'Tasdiqlash parolini ko‘rsatish', hideConfirmPassword: 'Tasdiqlash parolini yashirish',
    submit: 'Akkaunt yaratish', submitting: 'Akkaunt yaratilmoqda', successTitle: '{storeName} akkaunti tayyor',
    successText: 'Sinov muddati boshlandi. Bir martalik xavfsiz kirish tayyor.', openAdmin: 'Adminga o‘tish',
    requestFailed: 'So‘rovni yuborib bo‘lmadi. Iltimos, qayta urinib ko‘ring.',
    validation: {
      storeRequired: 'Do‘kon nomini kiriting', storeMin: 'Do‘kon nomi kamida 2 ta belgidan iborat bo‘lsin',
      storeMax: 'Do‘kon nomi 120 ta belgidan oshmasin', ownerRequired: 'Do‘kon egasining ismini kiriting',
      ownerMin: 'Ism kamida 2 ta belgidan iborat bo‘lsin', ownerMax: 'Ism 100 ta belgidan oshmasin',
      phoneRequired: 'Telefon raqamini kiriting', phoneFormat: 'Telefon raqami 9 ta raqamdan iborat bo‘lsin',
      phoneCode: 'Mobil operator kodi noto‘g‘ri', emailMax: 'Email 120 ta belgidan oshmasin',
      emailFormat: 'Email manzilini to‘g‘ri kiriting', usernameRequired: 'Loginni kiriting',
      usernameMin: 'Login kamida 3 ta belgidan iborat bo‘lsin', usernameMax: 'Login 50 ta belgidan oshmasin',
      usernameFormat: 'Faqat lotin harflari, raqam va pastki chiziq mumkin', passwordRequired: 'Parolni kiriting',
      passwordMin: 'Parol kamida 6 ta belgidan iborat bo‘lsin', passwordMax: 'Parol 100 ta belgidan oshmasin',
      confirmRequired: 'Parolni qayta kiriting', confirmMismatch: 'Parollar mos kelmadi',
    },
  },
} as const;
