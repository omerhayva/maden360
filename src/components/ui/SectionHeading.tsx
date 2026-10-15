import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface SectionHeadingProps {
  id?: string;
  title: string;
  description?: string;
  href?: string;
  linkLabel?: string;
  as?: 'h2' | 'h3';
}

export function SectionHeading({
  id,
  title,
  description,
  href,
  linkLabel,
  as: Tag = 'h2',
}: SectionHeadingProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <Tag id={id} className="text-2xl font-bold tracking-tight text-graphite-950">
          {title}
        </Tag>
        {description && <p className="mt-1 max-w-2xl text-graphite-600">{description}</p>}
      </div>
      {href && linkLabel && (
        <Link
          href={href}
          className="inline-flex min-h-11 shrink-0 items-center gap-1 text-sm font-semibold text-copper-700 hover:text-copper-800 hover:underline"
        >
          {linkLabel}
          <ArrowRight aria-hidden="true" className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}
