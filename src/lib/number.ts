/**
 * Türkçe ve uluslararası yazımları kabul eden sayı ayrıştırıcı.
 *
 * Kurallar:
 *  - "2,65" ve "2.65" → 2,65 (tek ayırıcı ondalık kabul edilir)
 *  - "1.250.000" veya "1,250,000" → 1 250 000 (birden çok aynı ayırıcı binlik kabul edilir)
 *  - "1.234,5" → 1234,5 ve "1,234.5" → 1234,5 (en sağdaki ayırıcı ondalıktır)
 *  - Boşluklar yok sayılır: "1 250" → 1250
 *  - Binlik gruplar 3 haneli olmalıdır; "1.23.4" geçersizdir.
 *
 * Belirsiz yazımlar ("2.700" gibi) ondalık olarak okunur. Arayüz, okunan değeri
 * kullanıcıya göstererek yanlış yorumlamayı fark etmesini sağlar.
 */

export type ParsedNumber =
  { kind: 'empty' } | { kind: 'invalid' } | { kind: 'value'; value: number };

function validGrouping(integerPart: string, separator: string): boolean {
  const groups = integerPart.split(separator);
  if (groups.length === 1) return true;
  const [first, ...rest] = groups;
  return (
    first !== undefined && /^-?\d{1,3}$/.test(first) && rest.every((group) => /^\d{3}$/.test(group))
  );
}

export function parseDecimal(raw: string | undefined | null): ParsedNumber {
  if (raw === undefined || raw === null) return { kind: 'empty' };
  let text = raw
    .trim()
    .replace(/[\s\u00A0\u202F]/g, '')
    .replace(/[\u2212\u2013]/g, '-')
    .replace(/^\+/, '');
  if (text === '') return { kind: 'empty' };

  const commaCount = (text.match(/,/g) ?? []).length;
  const dotCount = (text.match(/\./g) ?? []).length;

  if (commaCount > 0 && dotCount > 0) {
    const decimalSeparator = text.lastIndexOf(',') > text.lastIndexOf('.') ? ',' : '.';
    const thousandsSeparator = decimalSeparator === ',' ? '.' : ',';
    const decimalIndex = text.lastIndexOf(decimalSeparator);
    const integerPart = text.slice(0, decimalIndex);
    const fractionPart = text.slice(decimalIndex + 1);
    if (integerPart.includes(decimalSeparator) || !validGrouping(integerPart, thousandsSeparator)) {
      return { kind: 'invalid' };
    }
    text = `${integerPart.split(thousandsSeparator).join('')}.${fractionPart}`;
  } else if (commaCount > 1 || dotCount > 1) {
    const separator = commaCount > 1 ? ',' : '.';
    if (!validGrouping(text, separator)) return { kind: 'invalid' };
    text = text.split(separator).join('');
  } else if (commaCount === 1) {
    text = text.replace(',', '.');
  }

  if (!/^-?(?:\d+\.?\d*|\.\d+)$/.test(text)) return { kind: 'invalid' };
  const value = Number(text);
  return Number.isFinite(value) ? { kind: 'value', value } : { kind: 'invalid' };
}
