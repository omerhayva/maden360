import type { ReactNode } from 'react';
import { ButtonGroup } from './Button';

/**
 * Boş liste durumu: ne olduğunu söyleyen başlık, kısa açıklama ve bir sonraki adım için düğmeler.
 * Sayfa başlığında zaten birincil eylem bulunduğundan buradaki düğmeler ikincil (secondary)
 * seçilir; bir ekranda tek birincil düğme kuralı korunur.
 */
export function EmptyState({
  title,
  children,
  icon,
  actions,
}: {
  title: string;
  children?: ReactNode;
  /** Simge (lucide); 24 px'e ölçeklenir */
  icon?: ReactNode;
  /** ButtonLink / Button öğeleri */
  actions?: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-dashed border-graphite-300 bg-white px-6 py-10 text-center">
      {icon && (
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-copper-50 text-copper-700 [&_svg]:size-6">
          {icon}
        </div>
      )}
      <p className="text-lg font-semibold text-graphite-950">{title}</p>
      {children && (
        <div className="mx-auto mt-2 max-w-xl text-sm leading-6 text-graphite-600">{children}</div>
      )}
      {actions && <ButtonGroup className="mt-6 sm:justify-center">{actions}</ButtonGroup>}
    </div>
  );
}
