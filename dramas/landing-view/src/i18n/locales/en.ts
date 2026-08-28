import type { TranslationDictionary } from '../types';

export const en: TranslationDictionary = {
  seo: {
    title: 'Mavion — Manage all your branches in one place',
    description: 'A unified system for managing branches, sales, transfers, and customers.',
  },
  language: { select: 'Select language', current: 'Current language: {language}' },
  navigation: {
    label: 'Main navigation', mobileLabel: 'Mobile navigation', openMenu: 'Open menu', closeMenu: 'Close menu',
    items: { features: 'Features', howItWorks: 'How it works', pricing: 'Pricing', faq: 'FAQ', company: 'Company' },
  },
  brand: { tagline: 'The easiest way to manage all your branches in one system.' },
  cta: { login: 'Log in', primary: 'Try free for 14 days' },
  hero: {
    eyebrow: '14 days free · No credit card required', heading: 'Manage all your branches in one system',
    supporting: 'Track sales, revenue, expenses, and inventory in real time. Start today and use the system free for 14 days!',
    primaryCta: 'Try free for 14 days', secondaryCta: 'View demo',
    trial: '14 days completely free', note: 'No credit card required',
  },
  dashboard: {
    previewLabel: 'Mavion dashboard preview', period: 'JUL 14 – AUG 13', language: 'English',
    groups: { main: 'Home', sales: 'Sales', warehouse: 'Inventory', finance: 'Finance', analysis: 'Analysis', management: 'Management' },
    menu: {
      dashboard: 'Dashboard', sales: 'Sales', customers: 'Customers', categories: 'Categories', products: 'Products',
      transfers: 'Transfers', expenses: 'Expenses', reports: 'Reports', analytics: 'Analytics', branches: 'Branches',
      administrators: 'Administrators', settings: 'Settings',
    },
    breadcrumb: 'Home', branch: 'Main branch', admin: 'Admin', heading: 'Dashboard', welcome: 'Welcome, Admin',
    actions: { newSale: 'New sale', export: 'Export report', refresh: 'Refresh', analysis: 'Open analytics' },
    reviewPeriod: 'Selected period', comparison: 'Compared with last month', unpaidSales: 'Unpaid sales',
    metrics: ['Total sales', 'Total revenue', 'Credit sales', 'Total expenses'],
    chartTitle: 'Sales dynamics', chartLabel: 'Sales dynamics chart', shareTitle: 'Revenue share', total: 'Total',
    branches: ['Main branch', 'Chilanzar branch', 'Yunusabad branch', 'Sergeli branch'],
    summary: ['Average receipt', 'Current month revenue', 'Number of debtors'], currency: 'M UZS',
  },
  trust: {
    heading: 'Everything is ready to get started',
    items: ['14 days free', 'No credit card required', 'Quick setup', 'Cancel anytime', 'Support whenever you need it'],
  },
  problem: {
    heading: 'Why is management easier with Mavion?', supporting: 'Manage every process centrally and grow your business.',
    dashboardLabel: 'Mavion metrics',
    benefits: [
      { title: 'Real-time analytics and reports', text: 'Track sales, revenue, profit, and expenses in real time.' },
      { title: 'Unified branch oversight', text: 'Manage the activity of every branch from one dashboard.' },
      { title: 'Inventory and warehouse control', text: 'Easily manage product stock, incoming goods, and transfers.' },
      { title: 'Payment and debt control', text: 'Track cash and other payments while managing outstanding debt.' },
    ],
    stats: {
      income: 'Current revenue', activeBranches: 'Active branches', productCount: 'Number of products',
      topProducts: 'Top products', products: ['Mineral water', 'Sugar', 'Coffee', 'Rice'],
    },
  },
  features: {
    heading: 'Core features',
    items: [
      { title: 'Dashboard', text: 'See every key metric at a glance.' },
      { title: 'Sales and revenue', text: 'Track daily sales and revenue.' },
      { title: 'Products and inventory', text: 'Control stock, incoming goods, outgoing goods, and transfers.' },
      { title: 'Financial control', text: 'Monitor expenses, profit, and payments.' },
      { title: 'Reports', text: 'Get detailed analytics and reports.' },
      { title: 'Roles and permissions', text: 'Configure employee roles and permissions.' },
    ],
  },
  howItWorks: {
    heading: 'How does it work?',
    steps: [
      { title: 'Create an account', text: 'Sign up quickly and log in to the system.' },
      { title: 'Add your branches', text: 'Add all your branches to the system and configure them.' },
      { title: 'Start managing sales', text: 'Manage sales, transfers, and reports centrally.' },
    ],
  },
  pricing: {
    kicker: 'Simple, transparent pricing', heading: 'Start with a free 14-day trial',
    note: 'Every plan includes 14 free days. Billing for your selected plan begins only after the trial ends.',
    afterTrial: 'Price after the trial', empty: 'No plans are currently available.',
    loadError: 'Plans could not be loaded. Please try again later.', monthlyUnit: 'UZS / month',
    defaultCta: 'Start free trial',
    limits: {
      unlimitedBranches: 'Unlimited branches', mainStoreOnly: 'Main store only',
      additionalBranches: 'Main store + up to {count} branches', unlimitedUsers: 'Unlimited users',
      users: 'Up to {count} users', unlimitedProducts: 'Unlimited products', products: 'Up to {count} products',
    },
    plans: {
      START: { name: 'Start', badge: '', highlight: false, features: ['Core reports', 'Email support'], cta: 'Start free trial' },
      BUSINESS: { name: 'Business', badge: 'Most popular', highlight: true, features: ['Advanced reports', 'Transfer control', 'Priority support'], cta: 'Start free trial' },
      NETWORK: { name: 'Pro', badge: '', highlight: false, features: ['Custom features', 'Custom integrations', 'Dedicated manager', 'Dedicated support'], cta: 'Contact us' },
    },
  },
  faq: {
    heading: 'Frequently asked questions',
    items: [
      { question: 'What types of businesses is Mavion suitable for?', answer: 'Mavion is designed for retail stores, supermarkets, clothing and home-goods stores, and other multi-branch retail businesses.' },
      { question: 'How long does setup and launch take?', answer: 'Creating an account takes a few minutes. You can start working as soon as you add your branches and products.' },
      { question: 'Is my data secure?', answer: 'Yes. Data is stored on protected servers, and access is controlled through user permissions.' },
      { question: 'Does the system work without internet access?', answer: 'An internet connection is required to synchronize core data. You can continue once a stable connection is restored.' },
      { question: 'How do payments work?', answer: 'You can pay for your selected plan by bank transfer or through the available electronic payment methods.' },
      { question: 'Will I be charged automatically after the free trial?', answer: 'No. You choose a plan after the free trial ends, and no card details are required in advance.' },
    ],
  },
  finalCta: {
    heading: 'Manage all your branches in one system', text: 'Start today and use the system completely free for 14 days!',
    primary: 'Try free for 14 days', secondary: 'View demo',
  },
  footer: {
    contact: 'Contact', product: 'Product', company: 'Company', address: 'Tashkent, Uzbekistan',
    about: 'About us', copyright: '© 2026 Mavion. All rights reserved.',
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
