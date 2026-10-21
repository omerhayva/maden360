/**
 * Marka görsellerini üretir:
 *   src/app/icon.svg                  → tarayıcı sekmesi simgesi (yuvarlak köşeli)
 *   src/app/apple-icon.png            → 180×180, iOS ana ekran simgesi (tam kare)
 *   public/icon-192.png, icon-512.png → web uygulaması bildirimi (manifest) simgeleri (tam kare)
 *   public/og-image.jpg               → 1200×630 sosyal medya paylaşım görseli
 *
 * Kullanım: npm run generate:brand
 *
 * Logo işareti: çapraz çekiçler (topoğrafik haritalarda maden ocağı işareti). Çizim
 * src/components/brand/Logo.tsx ile aynıdır; birini değiştirirseniz ötekini de güncelleyin.
 * Renkler src/app/globals.css (@theme) ile aynıdır; palette.test.ts farklılığı yakalar.
 * Paylaşım görseli ana sayfa fotoğrafını (public/gorseller/ana-sayfa-1376.webp) kullanır:
 * fotoğraf değişirse önce `npm run generate:images`, sonra bu betiği çalıştırın.
 * Site adı veya ana sayfa başlığı değişirse de yeniden çalıştırın. Metinler sistemdeki fontla
 * çizilir (IBM Plex Sans kuruluysa o, yoksa Windows'ta Segoe UI, Linux'ta DejaVu Sans).
 */
import { writeFileSync } from 'node:fs';
import sharp from 'sharp';

const COLORS = {
  graphite950: '#0c111a',
  graphite100: '#eaedf1',
  copper300: '#f9b07a',
  copper700: '#933d08',
};

const NAME = 'Maden360';
const TITLE_LINES = ['Madencilik sektörünün', 'ilan panosu'];
const SUBTITLE_LINES = [
  'İş ilanları, makine ve parça ilanları, firma rehberi.',
  'Her ilanı yayından önce bir editör okur.',
];
const HERO_PHOTO = 'public/gorseller/ana-sayfa-1376.webp';
const font = "'IBM Plex Sans', 'Segoe UI', 'DejaVu Sans', 'Helvetica Neue', Arial, sans-serif";

/** Çapraz çekiçler, 32×32 tuvalde (Logo.tsx → LogoMark ile aynı) */
const LOGO_GLYPH = (color) =>
  `<path d="M7.2 26.6 21.4 12.4" stroke="${color}" stroke-width="2.6" stroke-linecap="round"/>` +
  `<path d="M24.8 26.6 10.6 12.4" stroke="${color}" stroke-width="2.6" stroke-linecap="round"/>` +
  `<rect x="-5.4" y="-2.3" width="10.8" height="4.6" rx="0.8" fill="${color}" transform="translate(22.6 9.4) rotate(45)"/>` +
  `<rect x="-5.4" y="-2.3" width="10.8" height="4.6" rx="0.8" fill="${color}" transform="translate(9.4 9.4) rotate(-45)"/>`;

/** Simge: koyu bakır kare, ortada beyaz çekiçler (%80 ölçek) */
const iconSvg = (radius) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">` +
  `<rect width="32" height="32" rx="${radius}" fill="${COLORS.copper700}"/>` +
  `<g transform="translate(3.2 3.6) scale(0.8)">${LOGO_GLYPH('#ffffff')}</g></svg>`;

// 1) Sekme simgesi
writeFileSync('src/app/icon.svg', `${iconSvg(6)}\n`);

// 2) PNG simgeler: tam kare (iOS saydam köşeleri siyah gösterir; Android maskeyi kendisi uygular)
for (const [file, size] of [
  ['src/app/apple-icon.png', 180],
  ['public/icon-192.png', 192],
  ['public/icon-512.png', 512],
]) {
  await sharp(Buffer.from(iconSvg(0)), { density: (72 * size) / 32 })
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toFile(file);
}

// 3) Paylaşım görseli: fotoğraf + soldan sağa açılan koyu katman + logo ve metin
const W = 1200;
const H = 630;
const overlay = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="katman" x1="0" x2="1" y1="0" y2="0">
      <stop offset="0" stop-color="${COLORS.graphite950}" stop-opacity="0.94"/>
      <stop offset="0.62" stop-color="${COLORS.graphite950}" stop-opacity="0.8"/>
      <stop offset="1" stop-color="${COLORS.graphite950}" stop-opacity="0.35"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#katman)"/>
  <g transform="translate(76 70) scale(2)">${LOGO_GLYPH(COLORS.copper300)}</g>
  <text x="152" y="117" font-family="${font}" font-size="44" font-weight="700" fill="#ffffff">${NAME}</text>
  ${TITLE_LINES.map(
    (line, i) =>
      `<text x="80" y="${296 + i * 76}" font-family="${font}" font-size="64" font-weight="600" fill="#ffffff">${line}</text>`,
  ).join('')}
  ${SUBTITLE_LINES.map(
    (line, i) =>
      `<text x="80" y="${296 + TITLE_LINES.length * 76 + 34 + i * 42}" font-family="${font}" font-size="29" fill="${COLORS.graphite100}">${line}</text>`,
  ).join('')}
</svg>`;

await sharp(HERO_PHOTO)
  .resize(W, H, { fit: 'cover' })
  .composite([{ input: Buffer.from(overlay) }])
  .jpeg({ quality: 84, mozjpeg: true })
  .toFile('public/og-image.jpg');

console.log(
  'Oluşturuldu: src/app/icon.svg, src/app/apple-icon.png, public/icon-192.png, public/icon-512.png, public/og-image.jpg',
);
