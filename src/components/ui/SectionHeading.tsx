import { ArrowLink } from './TextLink';

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
        <ArrowLink href={href} className="shrink-0">
          {linkLabel}
        </ArrowLink>
      )}
    </div>
  );
}
