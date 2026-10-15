import { initials } from '@/lib/listings/format';

/** Firma logosu; logo yoksa baş harfler. */
export function StandAvatar({
  name,
  logo,
  className = '',
}: {
  name: string;
  logo?: string;
  className?: string;
}) {
  if (logo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- statik dışa aktarım
      <img
        src={logo}
        alt={`${name} logosu`}
        className={`shrink-0 rounded-lg border border-stone-200 bg-white object-contain p-1 ${className}`}
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center rounded-lg bg-graphite-900 font-bold tracking-wide text-copper-400 ${className}`}
    >
      {initials(name)}
    </span>
  );
}
