import { storage } from "./storage";

const DEFAULT_SETTINGS = {
  currency: "NPR",
  shopName: "Topup Ledger",
};

export function getSettings() {
  return { ...DEFAULT_SETTINGS, ...storage.getValue(storage.KEYS.settings, {}) };
}

export function saveSettings(patch) {
  const next = { ...getSettings(), ...patch };
  storage.setValue(storage.KEYS.settings, next);
  return next;
}

const CURRENCY_SYMBOL = {
  NPR: "Rs",
  USD: "$",
  INR: "\u20B9",
  PKR: "Rs",
  BDT: "\u09F3",
};

export function formatMoney(amount, currency = getSettings().currency) {
  const symbol = CURRENCY_SYMBOL[currency] || currency;
  const value = Number(amount || 0);
  const formatted = value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${symbol} ${formatted}`;
}

export function formatDate(iso, opts = {}) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "\u2014";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    ...opts,
  });
}

export function formatDateTime(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "\u2014";
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function isoDateOnly(iso) {
  return new Date(iso).toISOString().slice(0, 10);
}

export function monthKey(iso) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}
