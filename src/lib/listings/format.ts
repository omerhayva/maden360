import {
  quantityUnitLabels,
  salaryBasisLabels,
  salaryPeriodLabels,
  vatLabels,
  type Currency,
  type QuantityUnit,
  type RefPrefix,
  type SalaryBasis,
  type SalaryPeriod,
  type Vat,
} from './options';

/** Market ilanı fiyatı */
export interface Price {
  amount: number;
  currency: Currency;
  /** Birim başına fiyatlarda: "ton", "gün", "metre" → "2.450 TL/ton" */
  per?: string;
  vat?: Vat;
  negotiable?: boolean;
}

export interface Salary {
  min?: number;
  max?: number;
  currency: Currency;
  period: SalaryPeriod;
  basis: SalaryBasis;
}

/** Para birimi kısaltmaları; ilan sitelerindeki yazımla: "4.750.000 TL", "210 USD" */
const CURRENCY_CODES: Record<Currency, string> = { TRY: 'TL', USD: 'USD', EUR: 'EUR' };

const amountFormatters = new Map<number, Intl.NumberFormat>();

/** "4.750.000", "2.450,50" (Türkçe sayı yazımı; tam sayılarda kuruş gösterilmez) */
function formatAmount(amount: number): string {
  const digits = Number.isInteger(amount) ? 0 : 2;
  let formatter = amountFormatters.get(digits);
  if (!formatter) {
    formatter = new Intl.NumberFormat('tr-TR', {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    });
    amountFormatters.set(digits, formatter);
  }
  return formatter.format(amount);
}

/** "4.750.000 TL", "210 USD" */
export function formatMoney(amount: number, currency: Currency): string {
  return `${formatAmount(amount)} ${CURRENCY_CODES[currency]}`;
}

/** "1.250.000 TL + KDV", "2.450 TL/ton (KDV dahil)", "Fiyat sorunuz" */
export function formatPrice(price: Price | undefined): string {
  if (!price) return 'Fiyat sorunuz';
  let text = formatMoney(price.amount, price.currency);
  if (price.per) text += `/${price.per}`;
  if (price.vat === 'haric') text += ` ${vatLabels.haric}`;
  if (price.vat === 'dahil') text += ` (${vatLabels.dahil})`;
  return text;
}

/** "45.000–60.000 TL net, aylık" */
export function formatSalary(salary: Salary): string {
  const { min, max, currency } = salary;
  const suffix = `${salaryBasisLabels[salary.basis]}, ${salaryPeriodLabels[salary.period]}`;
  if (min !== undefined && max !== undefined && min !== max) {
    return `${formatAmount(min)}–${formatAmount(max)} ${CURRENCY_CODES[currency]} ${suffix}`;
  }
  const single = min ?? max;
  if (single === undefined) return 'Ücret belirtilmedi';
  return `${min === undefined ? 'En fazla ' : max === undefined ? 'En az ' : ''}${formatMoney(single, currency)} ${suffix}`;
}

export function formatQuantity(value: number, unit: QuantityUnit): string {
  return `${new Intl.NumberFormat('tr-TR').format(value)} ${quantityUnitLabels[unit]}`;
}

const COMPANY_SUFFIXES = new Set(['ltd', 'şti', 'aş', 'san', 'tic', 've', 'inc', 'co', 'ltdşti']);

/** Firma adından baş harfler: "Anadolu Karot Sondaj Ltd. Şti." → "AK" */
export function initials(name: string): string {
  const words = name
    .split(/\s+/)
    .map((word) => word.replace(/[.,()]/g, ''))
    .filter(
      (word) => /\p{L}/u.test(word) && !COMPANY_SUFFIXES.has(word.toLocaleLowerCase('tr-TR')),
    );
  const letters = words.slice(0, 2).map((word) => word.charAt(0).toLocaleUpperCase('tr-TR'));
  return letters.join('') || '?';
}

const REF_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/** Başvuru numarası üretir: createRef("MKT", "2026-10-16") → "MKT-20261016-K7QX" */
export function createRef(
  prefix: RefPrefix,
  today: string,
  random: () => number = Math.random,
): string {
  let suffix = '';
  for (let i = 0; i < 4; i += 1) {
    suffix += REF_ALPHABET.charAt(Math.floor(random() * REF_ALPHABET.length));
  }
  return `${prefix}-${today.replaceAll('-', '')}-${suffix}`;
}
