/** Money stored as integer minor units (cents). Never use floating point. */

export type MoneyMinor = number;

export function toMinor(amountMajor: number): MoneyMinor {
  return Math.round(amountMajor * 100);
}

export function fromMinor(minor: MoneyMinor): number {
  return minor / 100;
}

export function formatMoney(
  minor: MoneyMinor,
  currency = "USD",
  locale = "en-US",
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(fromMinor(minor));
}

export function calcLineTotal(unitMinor: MoneyMinor, quantity: number): MoneyMinor {
  if (!Number.isInteger(unitMinor) || unitMinor < 0) {
    throw new Error("Invalid unit price");
  }
  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new Error("Invalid quantity");
  }
  return unitMinor * quantity;
}

export function sumMoney(amounts: MoneyMinor[]): MoneyMinor {
  return amounts.reduce((acc, n) => {
    if (!Number.isInteger(n)) throw new Error("Invalid money amount");
    return acc + n;
  }, 0);
}

export function applyPercentDiscount(
  subtotalMinor: MoneyMinor,
  percent: number,
): { discountMinor: MoneyMinor; totalMinor: MoneyMinor } {
  const safePercent = Math.min(100, Math.max(0, percent));
  const discountMinor = Math.round((subtotalMinor * safePercent) / 100);
  return {
    discountMinor,
    totalMinor: Math.max(0, subtotalMinor - discountMinor),
  };
}
