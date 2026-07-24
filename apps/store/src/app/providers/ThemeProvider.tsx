import { ConfigProvider, theme as antdTheme } from 'antd';
import type { Locale } from 'antd/es/locale';
import type { ReactNode } from 'react';
import { useState, useEffect } from 'react';
import { useUIStore } from '@/app/stores/ui.store';
import { normalizeLang, type Lang } from '@/shared/lib/lang';

const { darkAlgorithm, defaultAlgorithm } = antdTheme;

const BASE_TOKENS = {
  borderRadius: 8,
  borderRadiusLG: 12,
  fontFamily: "'Inter Tight', system-ui, sans-serif",
  fontSize: 14,
  lineHeight: 1.5,
  controlHeight: 36,
  colorSuccess: '#16a34a',
  colorWarning: '#d97706',
  colorError: '#dc2626',
};

const LIGHT_TOKENS = {
  ...BASE_TOKENS,
  colorPrimary: '#1e4dd8',
  colorInfo: '#1e4dd8',
  colorBorder: '#e6e9ef',
  colorBorderSecondary: '#eef0f4',
  colorBgBase: '#f8fafc',
  colorBgContainer: '#ffffff',
  colorTextBase: '#0f172a',
};

const DARK_TOKENS = {
  ...BASE_TOKENS,
  colorPrimary: '#4f7cff',
  colorInfo: '#4f7cff',
  colorBorder: '#334155',
  colorBorderSecondary: '#243047',
  colorBgBase: '#0f172a',
  colorBgContainer: '#1e293b',
  colorTextBase: '#f1f5f9',
};

const SHARED_COMPONENTS = {
  Button: { controlHeight: 36, fontWeight: 500, primaryShadow: 'none' },
  Select: { controlHeight: 36 },
  Input: { controlHeight: 36 },
  Form: { itemMarginBottom: 16 },
  Card: { paddingLG: 20 },
};

const COMMON_PICKER_FORMATS = {
  yearFormat: 'YYYY',
  dayFormat: 'D',
  cellMeridiemFormat: 'A',
  monthBeforeYear: true,
};

const PICKER_LABELS = {
  uz: {
    locale: 'uz_UZ',
    today: 'Бугун',
    now: 'Ҳозир',
    backToToday: 'Бугунга қайтиш',
    clear: 'Тозалаш',
    week: 'Ҳафта',
    month: 'Ой',
    year: 'Йил',
    timeSelect: 'Вақтни танланг',
    dateSelect: 'Санани танланг',
    weekSelect: 'Ҳафтани танланг',
    monthSelect: 'Ойни танланг',
    yearSelect: 'Йилни танланг',
    decadeSelect: 'Ўн йилликни танланг',
    previousMonth: 'Олдинги ой',
    nextMonth: 'Кейинги ой',
    previousYear: 'Олдинги йил',
    nextYear: 'Кейинги йил',
    previousDecade: 'Олдинги ўн йиллик',
    nextDecade: 'Кейинги ўн йиллик',
    previousCentury: 'Олдинги аср',
    nextCentury: 'Кейинги аср',
  },
  'uz-latn': {
    locale: 'uz_UZ',
    today: 'Bugun',
    now: 'Hozir',
    backToToday: 'Bugunga qaytish',
    clear: 'Tozalash',
    week: 'Hafta',
    month: 'Oy',
    year: 'Yil',
    timeSelect: 'Vaqtni tanlang',
    dateSelect: 'Sanani tanlang',
    weekSelect: 'Haftani tanlang',
    monthSelect: 'Oyni tanlang',
    yearSelect: 'Yilni tanlang',
    decadeSelect: "O'n yillikni tanlang",
    previousMonth: 'Oldingi oy',
    nextMonth: 'Keyingi oy',
    previousYear: 'Oldingi yil',
    nextYear: 'Keyingi yil',
    previousDecade: "Oldingi o'n yillik",
    nextDecade: "Keyingi o'n yillik",
    previousCentury: 'Oldingi asr',
    nextCentury: 'Keyingi asr',
  },
  ru: {
    locale: 'ru_RU',
    today: 'Сегодня',
    now: 'Сейчас',
    backToToday: 'Текущая дата',
    clear: 'Очистить',
    week: 'Неделя',
    month: 'Месяц',
    year: 'Год',
    timeSelect: 'Выбрать время',
    dateSelect: 'Выбрать дату',
    weekSelect: 'Выбрать неделю',
    monthSelect: 'Выбрать месяц',
    yearSelect: 'Выбрать год',
    decadeSelect: 'Выбрать десятилетие',
    previousMonth: 'Предыдущий месяц',
    nextMonth: 'Следующий месяц',
    previousYear: 'Предыдущий год',
    nextYear: 'Следующий год',
    previousDecade: 'Предыдущее десятилетие',
    nextDecade: 'Следующее десятилетие',
    previousCentury: 'Предыдущий век',
    nextCentury: 'Следующий век',
  },
  en: {
    locale: 'en_US',
    today: 'Today',
    now: 'Now',
    backToToday: 'Back to today',
    clear: 'Clear',
    week: 'Week',
    month: 'Month',
    year: 'Year',
    timeSelect: 'Select time',
    dateSelect: 'Select date',
    weekSelect: 'Choose a week',
    monthSelect: 'Choose a month',
    yearSelect: 'Choose a year',
    decadeSelect: 'Choose a decade',
    previousMonth: 'Previous month',
    nextMonth: 'Next month',
    previousYear: 'Previous year',
    nextYear: 'Next year',
    previousDecade: 'Previous decade',
    nextDecade: 'Next decade',
    previousCentury: 'Previous century',
    nextCentury: 'Next century',
  },
};

const createLocale = ({
  locale,
  placeholder,
  close,
  noData,
  filterTitle,
  filterReset,
  filterSearchPlaceholder,
  selectAll,
  selectInvert,
  sortTitle,
  expand,
  collapse,
  okText,
  cancelText,
  searchPlaceholder,
  itemUnit,
  itemsUnit,
  datePlaceholder,
  rangePlaceholder,
  timePlaceholder,
  optional,
  requiredTemplate,
}: {
  locale: string;
  placeholder: string;
  close: string;
  noData: string;
  filterTitle: string;
  filterReset: string;
  filterSearchPlaceholder: string;
  selectAll: string;
  selectInvert: string;
  sortTitle: string;
  expand: string;
  collapse: string;
  okText: string;
  cancelText: string;
  searchPlaceholder: string;
  itemUnit: string;
  itemsUnit: string;
  datePlaceholder: string;
  rangePlaceholder: [string, string];
  timePlaceholder: string;
  optional: string;
  requiredTemplate: string;
}): Locale => {
  //
  const picker = PICKER_LABELS[locale as keyof typeof PICKER_LABELS] ?? PICKER_LABELS.en;

  return ({
    locale,
    global: { placeholder, close },
    Table: {
      filterTitle,
      filterConfirm: okText,
      filterReset,
      filterEmptyText: noData,
      filterCheckAll: selectAll,
      filterSearchPlaceholder,
      emptyText: noData,
      selectAll,
      selectInvert,
      selectNone: filterReset,
      selectionAll: selectAll,
      sortTitle,
      expand,
      collapse,
    },
    DatePicker: {
      lang: {
        ...COMMON_PICKER_FORMATS,
        ...picker,
        ok: okText,
        locale: picker.locale,
        placeholder: datePlaceholder,
        yearPlaceholder: picker.yearSelect,
        quarterPlaceholder: picker.decadeSelect,
        monthPlaceholder: picker.monthSelect,
        weekPlaceholder: picker.weekSelect,
        rangePlaceholder,
        rangeYearPlaceholder: rangePlaceholder,
        rangeQuarterPlaceholder: rangePlaceholder,
        rangeMonthPlaceholder: rangePlaceholder,
        rangeWeekPlaceholder: rangePlaceholder,
      },
      timePickerLocale: {
        placeholder: timePlaceholder,
        rangePlaceholder,
      },
    },
    TimePicker: {
      placeholder: timePlaceholder,
      rangePlaceholder,
    },
    Modal: { okText, cancelText, justOkText: okText },
    Popconfirm: { okText, cancelText },
    Transfer: {
      titles: ['', ''],
      searchPlaceholder,
      itemUnit,
      itemsUnit,
      remove: cancelText,
      selectCurrent: selectAll,
      selectAll,
      deselectAll: filterReset,
      removeAll: filterReset,
      selectInvert,
    },
    Empty: { description: noData },
    Form: {
      optional,
      defaultValidateMessages: {
        required: requiredTemplate,
      },
    },
  }) as unknown as Locale;
};

const ANTD_LOCALES: Record<Lang, Locale> = {
  'uz-cy': createLocale({
    locale: 'uz',
    placeholder: 'Танланг',
    close: 'Ёпиш',
    noData: 'Маълумот йўқ',
    filterTitle: 'Филтр',
    filterReset: 'Тозалаш',
    filterSearchPlaceholder: 'Филтрларда қидириш',
    selectAll: 'Барчасини танлаш',
    selectInvert: 'Танловни алмаштириш',
    sortTitle: 'Саралаш',
    expand: 'Қаторни очиш',
    collapse: 'Қаторни ёпиш',
    okText: 'OK',
    cancelText: 'Бекор қилиш',
    searchPlaceholder: 'Қидириш',
    itemUnit: 'та',
    itemsUnit: 'та',
    datePlaceholder: 'Санани танланг',
    rangePlaceholder: ['Бошланиш санаси', 'Тугаш санаси'],
    timePlaceholder: 'Вақтни танланг',
    optional: '(ихтиёрий)',
    requiredTemplate: '${label} киритилиши шарт',
  }),
  'uz-la': createLocale({
    locale: 'uz-latn',
    placeholder: 'Tanlang',
    close: 'Yopish',
    noData: "Ma'lumot yo'q",
    filterTitle: 'Filtr',
    filterReset: 'Tozalash',
    filterSearchPlaceholder: 'Filtrlarda qidirish',
    selectAll: 'Barchasini tanlash',
    selectInvert: 'Tanlovni almashtirish',
    sortTitle: 'Saralash',
    expand: 'Qatorni ochish',
    collapse: 'Qatorni yopish',
    okText: 'OK',
    cancelText: 'Bekor qilish',
    searchPlaceholder: 'Qidirish',
    itemUnit: 'ta',
    itemsUnit: 'ta',
    datePlaceholder: 'Sanani tanlang',
    rangePlaceholder: ['Boshlanish sanasi', 'Tugash sanasi'],
    timePlaceholder: 'Vaqtni tanlang',
    optional: '(ixtiyoriy)',
    requiredTemplate: '${label} kiritilishi shart',
  }),
  ru: createLocale({
    locale: 'ru',
    placeholder: 'Выберите',
    close: 'Закрыть',
    noData: 'Нет данных',
    filterTitle: 'Фильтр',
    filterReset: 'Сбросить',
    filterSearchPlaceholder: 'Поиск в фильтрах',
    selectAll: 'Выбрать все',
    selectInvert: 'Инвертировать выбор',
    sortTitle: 'Сортировка',
    expand: 'Развернуть строку',
    collapse: 'Свернуть строку',
    okText: 'OK',
    cancelText: 'Отмена',
    searchPlaceholder: 'Поиск',
    itemUnit: 'элем.',
    itemsUnit: 'элем.',
    datePlaceholder: 'Выберите дату',
    rangePlaceholder: ['Дата начала', 'Дата окончания'],
    timePlaceholder: 'Выберите время',
    optional: '(необязательно)',
    requiredTemplate: 'Пожалуйста, введите ${label}',
  }),
  en: createLocale({
    locale: 'en',
    placeholder: 'Select',
    close: 'Close',
    noData: 'No data',
    filterTitle: 'Filter',
    filterReset: 'Reset',
    filterSearchPlaceholder: 'Search in filters',
    selectAll: 'Select all',
    selectInvert: 'Invert selection',
    sortTitle: 'Sort',
    expand: 'Expand row',
    collapse: 'Collapse row',
    okText: 'OK',
    cancelText: 'Cancel',
    searchPlaceholder: 'Search',
    itemUnit: 'item',
    itemsUnit: 'items',
    datePlaceholder: 'Select date',
    rangePlaceholder: ['Start date', 'End date'],
    timePlaceholder: 'Select time',
    optional: '(optional)',
    requiredTemplate: 'Please enter ${label}',
  }),
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  //
  const themeMode = useUIStore((s) => s.theme);
  const lang = useUIStore((s) => s.lang);

  const [isDark, setIsDark] = useState<boolean>(() => {
    //
    if (themeMode === 'dark') return true;
    if (themeMode === 'light') return false;
    return typeof window !== 'undefined'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
      : false;
  });

  useEffect(() => {
    //
    if (themeMode !== 'system') {
      setIsDark(themeMode === 'dark');
      return;
    }
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDark(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [themeMode]);

  useEffect(() => {
    //
    const html = document.documentElement;
    if (isDark) html.classList.add('dark');
    else html.classList.remove('dark');
  }, [isDark]);

  const locale = ANTD_LOCALES[normalizeLang(lang)];

  return (
    <ConfigProvider
      locale={locale}
      theme={{
        algorithm: isDark ? darkAlgorithm : defaultAlgorithm,
        token: isDark ? DARK_TOKENS : LIGHT_TOKENS,
        components: {
          ...SHARED_COMPONENTS,
          Table: {
            headerBg: isDark ? '#1a2236' : '#f3f5f9',
            headerColor: isDark ? '#94a3b8' : '#475569',
            rowHoverBg: isDark ? 'rgba(79,124,255,.06)' : '#f8fafc',
            borderColor: isDark ? '#334155' : '#e6e9ef',
          },
          Menu: {
            itemBg: 'transparent',
            itemSelectedBg: isDark ? 'rgba(79,124,255,.12)' : 'rgba(30,77,216,.08)',
            itemSelectedColor: isDark ? '#4f7cff' : '#1e4dd8',
            itemHoverBg: isDark ? 'rgba(255,255,255,.05)' : 'rgba(15,23,42,.04)',
          },
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}
