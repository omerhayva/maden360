import { initials } from '@/lib/listings/format';

/** Firma logosu; logo yoksa baş harfler (sade, gri kutuda). */
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
        className={`shrink-0 rounded-xs border border-stone-300 bg-white object-contain p-1 ${className}`}
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center rounded-xs border border-stone-300 bg-stone-100 font-semibold text-graphite-700 [font-stretch:87.5%] ${className}`}
    >
      {initials(name)}
    </span>
  );
}
