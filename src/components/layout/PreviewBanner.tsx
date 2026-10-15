import { Eye } from 'lucide-react';
import { isPreviewMode } from '@/lib/content/visibility';

/** Önizleme ortamında (taslaklar görünürken) sayfanın en üstünde gösterilir. */
export function PreviewBanner() {
  if (!isPreviewMode()) return null;
  return (
    <div
      role="region"
      aria-label="Önizleme ortamı bildirimi"
      className="no-print bg-amber-100 text-amber-950"
    >
      <p className="mx-auto flex max-w-7xl items-start gap-2 px-4 py-2 text-sm sm:items-center sm:px-6 lg:px-8">
        <Eye aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 sm:mt-0" />
        <span>
          <strong>Önizleme ortamı:</strong> taslak ve teknik incelemedeki içerikler de gösteriliyor.
          Bu ortam arama motorlarına kapalıdır.
        </span>
      </p>
    </div>
  );
}
