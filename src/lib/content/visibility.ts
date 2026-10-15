import { isExpired, todayInTurkey } from '@/lib/listings/dates';
import type { ContentStatus } from './schemas';

/**
 * Yayın kuralı:
 *  - Üretim derlemesinde (npm run build) yalnızca "published" içerik yayımlanır.
 *  - Geliştirme sunucusunda (npm run dev) ve önizleme derlemesinde
 *    (npm run build:onizleme → CONTENT_PREVIEW=1) "draft" ve "review" içerikler de
 *    görünür; bu sayfalar uyarı bandı ve "noindex" etiketiyle işaretlenir.
 */
export function isPreviewMode(): boolean {
  return process.env.CONTENT_PREVIEW === '1' || process.env.NODE_ENV === 'development';
}

export function isVisible(status: ContentStatus): boolean {
  return status === 'published' || isPreviewMode();
}

/**
 * İlanlar (fuar standı, iş ilanı, aday profili, market ilanı) için ek kurallar:
 *  - Süresi dolan ilan üretim derlemesine alınmaz (tarayıcı tarafında da gizlenir).
 *  - Örnek içerik (example: true) yalnızca önizlemede görünür.
 * Önizlemede süresi dolmuş ilanlar da "Süresi doldu" işaretiyle gösterilir.
 */
export function isListingVisible(
  entry: { status: ContentStatus; expiresAt?: string; example?: boolean },
  today: string = todayInTurkey(),
): boolean {
  if (isPreviewMode()) return true;
  if (entry.example) return false;
  return entry.status === 'published' && !isExpired(entry.expiresAt, today);
}

export const statusLabels: Record<ContentStatus, string> = {
  draft: 'Taslak',
  review: 'İncelemede',
  published: 'Yayımlandı',
};

/** İlanlarda durum etiketleri ilan diline uyarlanır. */
export const listingStatusLabels: Record<ContentStatus, string> = {
  draft: 'Taslak',
  review: 'Onay bekliyor',
  published: 'Yayında',
};
