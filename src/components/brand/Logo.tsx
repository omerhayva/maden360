import { siteConfig } from '@/config/site';

/**
 * Logo işareti: çapraz çekiçler. Topoğrafik haritalarda maden ocağını gösteren işarettir.
 * Rengi `currentColor` ile verilir (ör. `text-copper-700`). Tarayıcı ve uygulama simgeleri
 * aynı çizimden üretilir: scripts/generate-brand-assets.mjs (LOGO_GLYPH ile aynı tutun).
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden="true"
      focusable="false"
      className={className}
      fill="currentColor"
      stroke="currentColor"
    >
      <path d="M7.2 26.6 21.4 12.4" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M24.8 26.6 10.6 12.4" strokeWidth="2.6" strokeLinecap="round" />
      <rect
        x="-5.4"
        y="-2.3"
        width="10.8"
        height="4.6"
        rx="0.8"
        stroke="none"
        transform="translate(22.6 9.4) rotate(45)"
      />
      <rect
        x="-5.4"
        y="-2.3"
        width="10.8"
        height="4.6"
        rx="0.8"
        stroke="none"
        transform="translate(9.4 9.4) rotate(-45)"
      />
    </svg>
  );
}

/** Yazı logosu: tek renk, başlıklarla aynı yarı dar kesim. */
export function Wordmark({ className }: { className?: string }) {
  return <span className={`[font-stretch:87.5%] ${className ?? ''}`}>{siteConfig.name}</span>;
}
