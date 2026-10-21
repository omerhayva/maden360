import type { ReactNode } from 'react';
import { ButtonGroup } from './Button';

/**
 * Boş liste durumu: ne olduğunu söyleyen başlık, kısa açıklama ve bir sonraki adım için düğmeler.
 * Sayfa başlığında zaten birincil eylem bulunduğundan buradaki düğmeler ikincil (secondary)
 * seçilir; bir ekranda tek birincil düğme kuralı korunur. Sola hizalıdır, süs simgesi yoktur.
 */
export function EmptyState({
  title,
  children,
  actions,
}: {
  title: string;
  children?: ReactNode;
  /** ButtonLink / Button öğeleri */
  actions?: ReactNode;
}) {
  return (
    <div className="rounded-sm border border-stone-300 bg-white px-5 py-6">
      <p className="text-lg font-semibold text-graphite-950">{title}</p>
      {children && (
        <div className="mt-1 max-w-2xl text-sm leading-6 text-graphite-700">{children}</div>
      )}
      {actions && <ButtonGroup className="mt-4">{actions}</ButtonGroup>}
    </div>
  );
}
