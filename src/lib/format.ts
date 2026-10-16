/**
 * Türkçe sayı ve tarih biçimlendirme.
 * Ondalık ayırıcı virgül, binlik ayırıcı noktadır: 1.234,56
 */

const numberFormatters = new Map<string, Intl.NumberFormat>();

function getNumberFormatter(minDigits: number, maxDigits: number): Intl.NumberFormat {
  const key = `${minDigits}-${maxDigits}`;
  let formatter = numberFormatters.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat('tr-TR', {
      minimumFractionDigits: minDigits,
      maximumFractionDigits: maxDigits,
    });
    numberFormatters.set(key, formatter);
  }
  return formatter;
}

/**
 * Büyüklüğe göre uygun ondalık basamak sayısını seçer.
 * Büyük değerlerde gereksiz hassasiyet göstermez, küçük değerlerde anlamlı basamakları korur.
 */
export function autoDigits(value: number): number {
  const abs = Math.abs(value);
  if (abs === 0) return 0;
  if (abs >= 10000) return 0;
  if (abs >= 100) return 1;
  if (abs >= 1) return 2;
  if (abs >= 0.01) return 3;
  return 5;
}

export function formatNumber(value: number, maxDigits?: number, minDigits = 0): string {
  if (!Number.isFinite(value)) return '—';
  const digits = maxDigits ?? autoDigits(value);
  const formatted = getNumberFormatter(Math.min(minDigits, digits), digits).format(value);
  // "-0" gibi görünümleri önle
  return formatted === '-0' ? '0' : formatted;
}

const dateFormatter = new Intl.DateTimeFormat('tr-TR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

/** "2026-10-15" → "15 Ekim 2026" */
export function formatDate(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return isoDate;
  return dateFormatter.format(date);
}

/** İki ISO tarih arasındaki gün farkı (b - a). */
export function daysBetween(a: string, b: string): number {
  const ms = new Date(`${b}T00:00:00Z`).getTime() - new Date(`${a}T00:00:00Z`).getTime();
  return Math.round(ms / 86_400_000);
}
