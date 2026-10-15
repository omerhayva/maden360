import type { ReactNode } from 'react';
import type { Crumb } from '@/lib/seo/structured-data';
import { Breadcrumbs } from './Breadcrumbs';
import { Container } from './Container';

interface PageHeaderProps {
  title: string;
  description?: string;
  eyebrow?: string;
  breadcrumbs: Crumb[];
  children?: ReactNode;
}

export function PageHeader({
  title,
  description,
  eyebrow,
  breadcrumbs,
  children,
}: PageHeaderProps) {
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
