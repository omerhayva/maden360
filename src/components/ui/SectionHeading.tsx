import { TextLink } from './TextLink';

interface SectionHeadingProps {
  id?: string;
  title: string;
  description?: string;
  href?: string;
  linkLabel?: string;
  as?: 'h2' | 'h3';
}

/** Bölüm başlığı; varsa sağında "Tümü" bağlantısı. Süs çizgisi veya üst etiket kullanılmaz. */
export function SectionHeading({
  id,
  title,
  description,
  href,
  linkLabel,
  as: Tag = 'h2',
}: SectionHeadingProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-4">
      <div className="min-w-0">
        <Tag id={id} className="text-2xl leading-tight font-semibold text-graphite-950">
          {title}
        </Tag>
        {description && <p className="mt-1 max-w-2xl text-graphite-600">{description}</p>}
      </div>
      {href && linkLabel && (
        <TextLink href={href} className="shrink-0">
          {linkLabel}
        </TextLink>
      )}
    </div>
  );
}
