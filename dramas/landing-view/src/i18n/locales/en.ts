import type { TranslationDictionary } from '../types';

export const en: TranslationDictionary = {
  seo: {
    title: 'Mavion — all your branches on one screen',
    description:
      'Sales, stock, customer debt and expenses for multi-branch stores in one panel. Try it free for 14 days.',
  },
  language: { select: 'Select language', current: 'Current language: {language}' },
  theme: { toDark: 'Switch to dark mode', toLight: 'Switch to light mode' },
  navigation: {
    label: 'Main navigation',
    mobileLabel: 'Mobile navigation',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    skip: 'Skip to content',
    items: {
      features: 'Features',
      howItWorks: 'How it works',
      pricing: 'Pricing',
      faq: 'FAQ',
    },
  },
  brand: { tagline: 'Sales, stock and finance for stores with several branches.' },
  cta: { login: 'Log in', primary: 'Try free for 14 days', tour: 'See the system' },
  hero: {
    eyebrow: 'For stores with several branches',
    headingLead: 'All your branches —',
    headingAccent: 'on one screen',
    supporting: 'Sales, stock, debt and profit in real time. One panel instead of notebooks and Excel.',
    badges: ['No card required', '14 days free'],
  },
  mock: {
    label: 'Mavion dashboard preview (sample data)',
    sample: 'Sample data',
    title: 'Dashboard',
    branchAll: 'All branches',
    period: 'Today',
    kpis: { sales: 'Period sales', revenue: 'Revenue', debt: 'Debt', expense: 'Expenses' },
    chartTitle: 'Sales trend',
    donutTitle: 'Payment methods',
    methods: { cash: 'Cash', card: 'Card', transfer: 'Transfer', credit: 'On credit' },
    currency: 'UZS',
    millionShort: 'M',
  },
  pain: {
    kicker: 'Instead of notebooks and Excel',
    heading: 'Familiar problems — clear solutions',
    supporting: 'Mavion solves the everyday headaches of a store owner in one system.',
    beforeTitle: 'Today',
    afterTitle: 'With Mavion',
    rows: [
      {
        before: 'Debts live in a notebook and nobody is sure who owes what',
        after: 'Every customer’s balance, debt and payment history in one place',
      },
      {
        before: 'You call each branch to find out what is left in stock',
        after: 'Real stock for every branch and a list of items running low',
      },
      {
        before: 'Checking what was sold at the till is hard at the end of the day',
        after: 'Every sale shows who made it, at which branch and how it was paid',
      },
      {
        before: 'You convert dollar prices by hand every time',
        after: 'Dollar prices convert to so‘m automatically at the Central Bank rate',
      },
      {
        before: 'At month end you do not know the real profit',
        after: 'Net profit = paid − expenses, for any period',
      },
    ],
  },
  features: {
    kicker: 'Features',
    heading: 'Everything a store needs',
    supporting: 'From the till to analytics — every module is connected.',
    items: [
      { title: 'Fast checkout', text: 'Retail or wholesale, find products by code or name, add a new customer on the spot.' },
      { title: 'Customers and debt', text: 'Sell on credit or with partial payment, see debtors and take debt payments.' },
      { title: 'Stock and low-stock items', text: 'Goods received in batches, real stock and a “running low” threshold.' },
      { title: 'Transfers between branches', text: 'Move goods between branches; the receiving branch confirms.' },
      { title: 'Expenses and net profit', text: 'Record expenses by category and see net profit.' },
      { title: 'Analytics', text: 'Daily and period reports on sales, expenses, stock and debt.' },
      { title: 'Roles and branch admins', text: 'Assign an administrator to each branch — they only see their own branch.' },
      { title: 'So‘m, dollar and CBU rate', text: 'The rate comes from the Central Bank; manual changes need the owner’s password.' },
    ],
  },
  modules: {
    kicker: 'Modules',
    heading: 'See every section from the inside',
    supporting: 'Four main sections — sales, stock, finance and analytics.',
    tabsLabel: 'Mavion modules',
    tabs: {
      sales: {
        label: 'Sales',
        title: 'Checkout and customers',
        text: 'The sale screen is simple for cashiers: find the product, enter the quantity, pick a payment method.',
        points: [
          'Retail and wholesale sale types',
          'Payment: cash, card, transfer, mixed or on credit',
          'Partial payment — the rest goes to the customer’s debt',
          'Customer base, balance and payment history, Excel import',
        ],
      },
      warehouse: {
        label: 'Stock',
        title: 'Receipts, stock and transfers',
        text: 'See real stock per branch after receipts, sales and transfers.',
        points: [
          'Product code, unit (piece / kg), cost, wholesale and retail price',
          'Goods received in batches, with the supplier',
          'Total pieces, total kg and stock value',
          'Transfer status: pending or confirmed',
        ],
      },
      finance: {
        label: 'Finance',
        title: 'Expenses and subscription',
        text: 'Every expense is recorded with its category, branch and who entered it.',
        points: [
          'Expenses by category',
          'See which branch and who entered it',
          'Net profit = paid − expenses',
          'Subscription: plan, payment receipt and approval history',
        ],
      },
      analytics: {
        label: 'Analytics',
        title: 'Dashboard and analytics',
        text: 'Sales, expense, stock and debt figures for a day or any other period.',
        points: [
          'Hourly sales trend and payment method chart',
          'Average check and net profit',
          'Best sellers — by quantity and revenue',
          'Low-stock items and largest debtors',
        ],
      },
    },
    salesMock: {
      retail: 'Retail', wholesale: 'Wholesale', customer: 'Customer', customerName: 'Aziz Karimov',
      search: 'Search by code or name',
      items: [
        { name: 'Sugar 1 kg', qty: '2 pcs', price: '56 000' },
        { name: 'Coffee 200 g', qty: '1 pc', price: '$4.50' },
        { name: 'Rice', qty: '1.5 kg', price: '27 000' },
      ],
      total: 'Total', paid: 'Paid', debt: 'On credit',
      methods: ['Cash', 'Card', 'Transfer', 'Mixed', 'On credit'],
    },
    warehouseMock: {
      title: 'Stock levels', product: 'Product', stock: 'Stock', low: 'Low',
      rows: [
        { name: 'Cement M400', stock: '120 bags', low: false },
        { name: 'Mineral water 1.5 l', stock: '8 pcs', low: true },
        { name: 'Tile adhesive', stock: '46 bags', low: false },
      ],
      transfer: 'Transfer', transferRoute: 'Main → Chilonzor', pending: 'Pending', confirmed: 'Confirmed',
    },
    financeMock: {
      title: 'Expenses', rows: [
        { category: 'Rent', amount: '6 000 000' },
        { category: 'Salaries', amount: '9 500 000' },
        { category: 'Utilities', amount: '1 200 000' },
      ],
      netProfit: 'Net profit', paid: 'Paid', expenses: 'Expenses',
    },
    analyticsMock: {
      topTitle: 'Best sellers', top: ['Sugar', 'Mineral water', 'Rice', 'Coffee'],
      debtorsTitle: 'Largest debtors', debtors: [{ name: 'Baraka Market', amount: '4 200 000' }, { name: 'Javohir', amount: '1 850 000' }],
      avgCheck: 'Average check',
    },
  },
  branches: {
    kicker: 'Multiple branches',
    heading: 'The owner sees everything, an admin sees their branch',
    supporting:
      'Each branch gets an administrator. The owner views “All branches” or a single branch, and goods move between branches by transfer.',
    owner: 'Store owner', ownerNote: 'All branches',
    branchNames: ['Main branch', 'Chilonzor branch', 'Yunusobod branch'],
    admin: 'Branch admin', adminNote: 'Own branch only',
    transfer: 'Transfer', transferNote: 'The receiving branch confirms',
    points: [
      'Global filter: all branches or one branch',
      'A branch admin only sees their own branch’s data',
      'Transfer status: pending → confirmed',
    ],
  },
  howItWorks: {
    kicker: 'How it works',
    heading: 'Get started in three steps',
    steps: [
      { title: 'Sign up', text: 'Choose a plan, enter your store details — the 14-day trial starts right away.' },
      { title: 'Import products from Excel', text: 'Import products, categories and customers from an Excel file.' },
      { title: 'Start selling', text: 'Add branches and admins, then make your first sale at the till.' },
    ],
  },
  local: {
    kicker: 'Built for Uzbekistan',
    heading: 'Made for stores in Uzbekistan',
    items: [
      { title: '4 languages', text: 'Uzbek (Latin and Cyrillic), Russian and English.' },
      { title: 'So‘m and dollar', text: 'Prices in so‘m or dollars, and you choose the display currency.' },
      { title: 'Central Bank rate', text: 'The rate is fetched automatically; changes need the owner’s password.' },
      { title: 'Light and dark mode', text: 'Pick the theme that is easiest on your eyes.' },
      { title: 'Any device', text: 'Computer, tablet or phone — it runs in the browser.' },
      { title: 'Excel import', text: 'Bring your existing lists without retyping them.' },
    ],
  },
  testimonials: { heading: 'What our customers say' },
  pricing: {
    kicker: 'Pricing',
    heading: 'Simple, transparent prices',
    note: 'Payment starts only after the trial, on the plan you choose.',
    trialTitle: '14-day free trial',
    trialText: 'Every feature of your chosen plan is open. No card required.',
    afterTrial: 'Price after the trial',
    empty: 'No plans are available yet.',
    loadError: 'Could not load plans. Please try again later.',
    monthlyUnit: 'UZS / month', defaultCta: 'Start free trial',
    limits: {
      unlimitedBranches: 'Unlimited branches', mainStoreOnly: 'Main branch only',
      additionalBranches: '1 main + {count} additional branches', unlimitedUsers: 'Unlimited users',
      users: 'Up to {count} active users', unlimitedProducts: 'Unlimited products', products: 'Up to {count} active products',
    },
    plans: {
      START: { name: 'Start', badge: '', highlight: false, features: ['Basic reports', 'E-mail support'], cta: 'Start free trial' },
      BUSINESS: { name: 'Business', badge: 'Popular', highlight: true, features: ['Advanced reports', 'Transfer control', 'Priority support'], cta: 'Start free trial' },
      NETWORK: { name: 'Network', badge: '', highlight: false, features: [], cta: 'Contact us' },
    },
  },
  faq: {
    kicker: 'FAQ',
    heading: 'Frequently asked questions',
    items: [
      {
        question: 'What happens when the trial ends?',
        answer:
          'Nothing is charged automatically — no card is asked for. Your data stays saved and visible, and entering new sales and receipts resumes once the subscription payment is approved.',
      },
      {
        question: 'Is my data safe?',
        answer:
          'Each store’s data is kept separate, and staff only see the branch they are allowed to. Passwords are stored encrypted, and the database is backed up every day.',
      },
      {
        question: 'Can I import products from Excel?',
        answer: 'Yes. Products, categories and customers can be imported from an Excel file.',
      },
      {
        question: 'How does selling on credit work?',
        answer:
          'In the sale you pick the customer and choose full, partial or credit payment. The rest goes to the customer’s debt; later you take debt payments and see each customer’s history.',
      },
      {
        question: 'How is the dollar rate calculated?',
        answer:
          'The rate is fetched automatically from the Central Bank. Dollar-priced goods convert to so‘m at that rate and payment is taken in so‘m. Only the store owner’s password allows changing the rate by hand.',
      },
      {
        question: 'Can I add a branch later?',
        answer:
          'Yes, any time within your plan: Start — 1 main + 2 additional branches, Business — 1 main + 5 additional branches.',
      },
      {
        question: 'How do I pay for the subscription?',
        answer:
          'Make the payment and upload the receipt in the “Subscription and payments” section of the panel. Once the receipt is checked, the subscription is activated; all payment history is kept there.',
      },
      {
        question: 'Which devices does it work on?',
        answer:
          'Mavion runs in the browser — on a computer, tablet or phone, with nothing to install. It needs an internet connection.',
      },
    ],
  },
  finalCta: {
    heading: 'Run all your branches from one screen, starting today',
    text: '14 days free. No card required.',
    primary: 'Try free for 14 days', secondary: 'Log in',
  },
  footer: {
    product: 'Product', contact: 'Contact', address: 'Tashkent, Uzbekistan', telegram: 'Telegram',
    copyright: '© {year} Mavion. All rights reserved.',
  },
  registration: {
    close: 'Close', title: 'Create a free account',
    intro: 'Enter your details and your store dashboard will be ready in a few seconds.',
    storeSection: 'Store details', accountSection: 'Login details',
    fields: {
      storeName: 'Store name', storeNamePlaceholder: 'For example: Baraka Market', ownerName: 'Store owner',
      ownerNamePlaceholder: 'First and last name', phone: 'Phone number', email: 'Email', optional: 'optional',
      username: 'Username', usernamePlaceholder: 'Enter a username', password: 'Password', passwordPlaceholder: 'At least 6 characters',
      confirmPassword: 'Confirm password', confirmPasswordPlaceholder: 'Enter the password again',
    },
    showPassword: 'Show password', hidePassword: 'Hide password',
    showConfirmPassword: 'Show confirmation password', hideConfirmPassword: 'Hide confirmation password',
    submit: 'Create account', submitting: 'Creating account', successTitle: '{storeName} account is ready',
    successText: 'Your trial has started. A secure one-time login is ready.', openAdmin: 'Open admin panel',
    requestFailed: 'The request could not be sent. Please try again.',
    validation: {
      storeRequired: 'Enter the store name', storeMin: 'The store name must contain at least 2 characters',
      storeMax: 'The store name must not exceed 120 characters', ownerRequired: 'Enter the store owner’s name',
      ownerMin: 'The name must contain at least 2 characters', ownerMax: 'The name must not exceed 100 characters',
      phoneRequired: 'Enter a phone number', phoneFormat: 'The phone number must contain 9 digits',
      phoneCode: 'The mobile operator code is invalid', emailMax: 'The email must not exceed 120 characters',
      emailFormat: 'Enter a valid email address', usernameRequired: 'Enter a username',
      usernameMin: 'The username must contain at least 3 characters', usernameMax: 'The username must not exceed 50 characters',
      usernameFormat: 'Only Latin letters, numbers, and underscores are allowed', passwordRequired: 'Enter a password',
      passwordMin: 'The password must contain at least 6 characters', passwordMax: 'The password must not exceed 100 characters',
      confirmRequired: 'Enter the password again', confirmMismatch: 'The passwords do not match',
    },
  },
};
