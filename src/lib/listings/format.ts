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
  /** Birim başına fiyatlarda: "ton", "gün", "metre" → "₺2.450 / ton" */
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

const moneyFormatters = new Map<string, Intl.NumberFormat>();

export function formatMoney(amount: number, currency: Currency): string {
  const digits = Number.isInteger(amount) ? 0 : 2;
  const key = `${currency}-${digits}`;
  let formatter = moneyFormatters.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency,
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    });
    moneyFormatters.set(key, formatter);
  }
  return formatter.format(amount);
}

/** "₺1.250.000 + KDV", "₺2.450 / ton (KDV dahil)", "Fiyat için iletişime geçin" */
export function formatPrice(price: Price | undefined): string {
  if (!price) return 'Fiyat için iletişime geçin';
  let text = formatMoney(price.amount, price.currency);
  if (price.per) text += ` / ${price.per}`;
  if (price.vat === 'haric') text += ` ${vatLabels.haric}`;
  if (price.vat === 'dahil') text += ` (${vatLabels.dahil})`;
  return text;
}

/** "₺45.000–60.000 net, aylık" */
export function formatSalary(salary: Salary): string {
  const { min, max, currency } = salary;
  const suffix = `${salaryBasisLabels[salary.basis]}, ${salaryPeriodLabels[salary.period]}`;
  if (min !== undefined && max !== undefined && min !== max) {
    const low = formatMoney(min, currency);
    const high = formatMoney(max, currency).replace(/^[^\d]+/, '');
    return `${low}–${high} ${suffix}`;
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
