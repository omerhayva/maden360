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

export const statusLabels: Record<ContentStatus, string> = {
  draft: 'Taslak',
  review: 'İncelemede',
  published: 'Yayımlandı',
};
