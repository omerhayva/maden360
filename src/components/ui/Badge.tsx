import type { ReactNode } from 'react';

const tones = {
  neutral: 'border-stone-300 bg-stone-50 text-graphite-700',
  copper: 'border-copper-200 bg-copper-50 text-copper-800',
  amber: 'border-amber-300 bg-amber-50 text-amber-900',
  green: 'border-emerald-300 bg-emerald-50 text-emerald-900',
  slate: 'border-graphite-300 bg-graphite-100 text-graphite-800',
  dark: 'border-graphite-800 bg-graphite-800 text-white',
} as const;

export type BadgeTone = keyof typeof tones;

/** Kısa durum etiketi (ilan türü, yayın durumu). Simge kullanılmaz; metin yeterlidir. */
export function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: BadgeTone }) {
  return (
    <span
      className={`inline-flex items-center rounded-xs border px-1.5 py-px text-xs leading-5 font-semibold ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
