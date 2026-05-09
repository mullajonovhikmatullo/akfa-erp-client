/**
 * shared/formatters.jsx — money, units, dates.
 */

import dayjs from 'dayjs';

function fmtUZS(n) {
  if (n == null || isNaN(n)) return "—";
  const sign = n < 0 ? "-" : "";
  const abs = Math.abs(Math.round(n));
  return `${sign}${abs.toLocaleString("ru-RU").replace(/,/g, " ")} so'm`;
}
function fmtUSD(n) {
  if (n == null || isNaN(n)) return "—";
  const sign = n < 0 ? "-" : "";
  return `${sign}$${Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}
function fmtMoney(n, currency, rate) {
  if (currency === "USD") return fmtUSD(n);
  return fmtUZS(n);
}
// convert between UZS and USD using state rate
function toUZS(n, currency, rate) {
  if (currency === "USD") return n * rate;
  return n;
}
function toUSD(n, currency, rate) {
  if (currency === "UZS") return n / rate;
  return n;
}
function fmtCompactUZS(n) {
  if (n == null) return "—";
  const a = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (a >= 1e9) return `${sign}${(a/1e9).toFixed(2)} B so'm`;
  if (a >= 1e6) return `${sign}${(a/1e6).toFixed(1)} M so'm`;
  if (a >= 1e3) return `${sign}${(a/1e3).toFixed(0)}K so'm`;
  return `${sign}${a} so'm`;
}
function fmtDate(d) {
  if (!d) return "—";
  return dayjs(d).format("DD MMM YYYY");
}
function fmtDateTime(d) {
  if (!d) return "—";
  return dayjs(d).format("DD MMM, HH:mm");
}

export const fmt = { fmtUZS, fmtUSD, fmtMoney, toUZS, toUSD, fmtCompactUZS, fmtDate, fmtDateTime };
