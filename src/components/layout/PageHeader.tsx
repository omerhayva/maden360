import type { ReactNode } from 'react';
import { Photo } from '@/components/ui/Photo';
import { photoFillClasses, photoScrimClasses } from '@/components/ui/styles';
import type { PhotoKey } from '@/config/photos';
import type { Crumb } from '@/lib/seo/structured-data';
import { Breadcrumbs } from './Breadcrumbs';
import { Container } from './Container';

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs: Crumb[];
  /**
   * Bölüm fotoğrafı (src/config/photos.ts). Verilirse başlık koyu, fotoğraflı zeminde gösterilir;
   * içine konan eylemler koyu zemine göre tasarlanmış olmalıdır (ör. SectionNav bileşenleri,
   * `inverse` düğmeler).
   */
  photo?: PhotoKey;
  children?: ReactNode;
}

/**
 * Sayfa başlığı. Kısa tutulur: içerik (ilanlar, firmalar) telefonda da ilk ekranda görünmeye
 * başlamalıdır. Başlığın üstüne etiket konmaz; açıklama tek iki cümledir.
 */
export function PageHeader({ title, description, breadcrumbs, photo, children }: PageHeaderProps) {
  if (photo) {
    return (
      <div className="photo-header relative isolate overflow-hidden bg-graphite-950 text-white">
        <Photo name={photo} priority className={photoFillClasses} />
        <div aria-hidden="true" className={photoScrimClasses} />
        <Container className="py-6 sm:py-8 lg:py-10">
          <Breadcrumbs items={breadcrumbs} tone="inverse" />
          <h1 className="mt-4 max-w-3xl text-3xl leading-tight font-semibold sm:text-4xl">
            {title}
          </h1>
          {description && (
            <p className="mt-2 max-w-2xl text-base leading-7 text-graphite-100 sm:text-lg sm:leading-8">
              {description}
            </p>
          )}
          {children}
        </Container>
      </div>
    );
  }

  return (
    <div className="border-b border-stone-300 bg-white">
      <Container className="py-6 lg:py-8">
        <Breadcrumbs items={breadcrumbs} />
        <h1 className="mt-4 text-3xl leading-tight font-semibold text-graphite-950 sm:text-4xl">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-3xl text-lg leading-8 text-graphite-700">{description}</p>
        )}
        {children}
      </Container>
    </div>
  );
}
