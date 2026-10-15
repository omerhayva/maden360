import { daysBetween } from '@/lib/format';

/**
 * İlan tarihleri Türkiye saatine göre değerlendirilir: bitiş tarihi (expiresAt)
 * o günün sonuna kadar geçerlidir. Bu dosya hem derlemede hem tarayıcıda çalışır;
 * böylece statik sitede süresi dolan ilanlar bir sonraki derlemeyi beklemeden
 * ziyaretçinin tarayıcısında gizlenebilir.
 */

export const LISTING_TIME_ZONE = 'Europe/Istanbul';

const dayFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: LISTING_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/** Türkiye saatine göre bugünün tarihi (YYYY-AA-GG). */
export function todayInTurkey(now: Date = new Date()): string {
  return dayFormatter.format(now);
}

/** Bitiş tarihi geçtiyse true (bitiş günü dahil geçerlidir). */
export function isExpired(expiresAt: string | undefined, today: string): boolean {
  return Boolean(expiresAt) && (expiresAt as string) < today;
}

/** Bitişe kalan gün (bugün bitiyorsa 0, geçtiyse negatif). */
export function daysLeft(expiresAt: string, today: string): number {
  return daysBetween(today, expiresAt);
}

/** ISO tarihe gün ekler: addDays("2026-10-16", 60) → "2026-12-15" */
export function addDays(isoDate: string, days: number): string {
  const date = new Date(`${isoDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}
