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
  eyebrow?: string;
  breadcrumbs: Crumb[];
  /**
   * Bölüm fotoğrafı (src/config/photos.ts). Verilirse başlık koyu, fotoğraflı zeminde gösterilir;
   * içine konan eylemler koyu zemine göre tasarlanmış olmalıdır (ör. SectionNav bileşenleri,
   * `inverse` düğmeler).
   */
  photo?: PhotoKey;
  children?: ReactNode;
}

export function PageHeader({
  title,
  description,
  eyebrow,
  breadcrumbs,
  photo,
  children,
}: PageHeaderProps) {
  if (photo) {
    return (
      <div className="photo-header relative isolate overflow-hidden bg-graphite-950 text-white">
        <Photo name={photo} priority className={photoFillClasses} />
        <div aria-hidden="true" className={photoScrimClasses} />
        <Container className="py-10 sm:py-12 lg:py-16">
          <Breadcrumbs items={breadcrumbs} tone="inverse" />
          {eyebrow && (
            <p className="mt-6 text-sm font-semibold uppercase tracking-wide text-copper-300">
              {eyebrow}
            </p>
          )}
          <h1
            className={`${eyebrow ? 'mt-2' : 'mt-6'} max-w-3xl text-3xl font-bold tracking-tight text-balance sm:text-4xl lg:text-5xl`}
          >
            {title}
          </h1>
          {description && (
            <p className="mt-4 max-w-3xl text-lg leading-8 text-graphite-100">{description}</p>
          )}
          {children}
        </Container>
      </div>
    );
  }

  return (
    <div className="border-b border-stone-200 bg-white">
      <Container className="py-8 lg:py-10">
        <Breadcrumbs items={breadcrumbs} />
        {eyebrow && (
          <p className="mt-5 text-sm font-semibold uppercase tracking-wide text-copper-700">
            {eyebrow}
          </p>
        )}
        <h1
          className={`${eyebrow ? 'mt-2' : 'mt-5'} text-3xl font-bold tracking-tight text-graphite-950 sm:text-4xl`}
        >
          {title}
        </h1>
        {description && (
          <p className="mt-3 max-w-3xl text-lg leading-8 text-graphite-700">{description}</p>
        )}
        {children}
      </Container>
    </div>
  );
}
