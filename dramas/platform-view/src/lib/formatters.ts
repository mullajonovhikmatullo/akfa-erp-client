import dayjs from 'dayjs';

const uzbekMonths = [
  'yanvar',
  'fevral',
  'mart',
  'aprel',
  'may',
  'iyun',
  'iyul',
  'avgust',
  'sentabr',
  'oktabr',
  'noyabr',
  'dekabr',
];

const uzbekMonthNames = [
  'Yanvar',
  'Fevral',
  'Mart',
  'Aprel',
  'May',
  'Iyun',
  'Iyul',
  'Avgust',
  'Sentabr',
  'Oktabr',
  'Noyabr',
  'Dekabr',
];

export const formatUzbekDate = (value: string | Date) => {
  //
  const date = dayjs(value);
  return `${date.date()}-${uzbekMonths[date.month()]}, ${date.year()}`;
};

export const formatUzbekShortDateTime = (value: string | Date) => {
  //
  const date = dayjs(value);
  return `${date.date()}-${uzbekMonths[date.month()]}, ${date.format('HH:mm')}`;
};

export const formatCalendarMonth = (value: dayjs.Dayjs) => uzbekMonthNames[value.month()];

export const formatTime = (value: string | Date) => dayjs(value).format('HH:mm');

export const formatCurrencyUZS = (amount: number) =>
  `${new Intl.NumberFormat('ru-RU', {
    maximumFractionDigits: 0,
  })
    .format(amount)
    .replace(/\u00A0/g, ' ')} UZS`;

export const formatCompactCurrencyUZS = (amount: number) => {
  //
  const absoluteAmount = Math.abs(amount);

  if (absoluteAmount < 1000) {
    return formatCurrencyUZS(amount);
  }

  const compactUnit = absoluteAmount >= 1_000_000 ? 'mln' : 'k';
  const compactValue = amount / (compactUnit === 'mln' ? 1_000_000 : 1000);
  const maximumFractionDigits = Math.abs(compactValue) >= 100 ? 0 : 1;
  const formattedValue = new Intl.NumberFormat('ru-RU', {
    maximumFractionDigits,
  })
    .format(compactValue)
    .replace(/\u00A0/g, ' ');

  return `${formattedValue}${compactUnit} UZS`;
};

export const formatPercent = (value: number) => `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;

export const formatMillionUZS = (value: number) => `${value.toFixed(1)} mln UZS`;
