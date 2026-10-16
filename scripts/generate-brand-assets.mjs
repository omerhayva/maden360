/**
 * Marka görsellerini üretir:
 *   src/app/icon.svg                  → tarayıcı sekmesi simgesi (yuvarlak köşeli)
 *   src/app/apple-icon.png            → 180×180, iOS ana ekran simgesi (tam kare)
 *   public/icon-192.png, icon-512.png → web uygulaması bildirimi (manifest) simgeleri (tam kare)
 *   public/og-image.jpg               → 1200×630 sosyal medya paylaşım görseli
 *
 * Kullanım: npm run generate:brand
 *
 * Renkler src/app/globals.css (@theme) ile aynıdır; palette.test.ts farklılığı yakalar.
 * Paylaşım görseli ana sayfa fotoğrafını (public/gorseller/ana-sayfa-1376.webp) kullanır:
 * fotoğraf değişirse önce `npm run generate:images`, sonra bu betiği çalıştırın.
 * Site adı veya slogan değişirse de yeniden çalıştırın. Metinler sistemdeki fontla çizilir
 * (Windows'ta Segoe UI, Linux'ta DejaVu Sans).
 */
import { writeFileSync } from 'node:fs';
import sharp from 'sharp';

const COLORS = {
  graphite950: '#0c111a',
  graphite100: '#eaedf1',
  copper300: '#f9b07a',
  copper500: '#db6b19',
};

const NAME_MAIN = 'Maden';
const NAME_ACCENT = '360';
const TITLE_LINES = ['Madenciliğin fuarı,', 'iş ilanları ve marketi'];
const SUBTITLE = 'Sanal fuar · İş ilanları · Market · Editör onaylı ilanlar';
const HERO_PHOTO = 'public/gorseller/ana-sayfa-1376.webp';
const font = "'Segoe UI', 'DejaVu Sans', 'Helvetica Neue', Arial, sans-serif";

/** Logo işareti (src/components/brand/Logo.tsx ile aynı çizim): bakır zemin, dağ profili, tabaka */
const logoMark = (radius) =>
  `<rect width="32" height="32" rx="${radius}" fill="${COLORS.copper500}"/>` +
  `<path d="M5 21.5 11.5 13l5 6 4-4.5 6.5 7" fill="none" stroke="${COLORS.graphite950}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>` +
  `<path d="M5 25.5h22" stroke="${COLORS.graphite950}" stroke-width="2.2" stroke-linecap="round" opacity="0.8"/>`;

const iconSvg = (radius) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">${logoMark(radius)}</svg>`;

// 1) Sekme simgesi
writeFileSync('src/app/icon.svg', `${iconSvg(7)}\n`);

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
  <g transform="translate(80 72) scale(2.25)">${logoMark(7)}</g>
  <text x="170" y="122" font-family="${font}" font-size="44" font-weight="700" fill="#ffffff">${NAME_MAIN}<tspan fill="${COLORS.copper300}">${NAME_ACCENT}</tspan></text>
  ${TITLE_LINES.map(
    (line, i) =>
      `<text x="80" y="${290 + i * 78}" font-family="${font}" font-size="60" font-weight="700" fill="#ffffff">${line}</text>`,
  ).join('')}
  <text x="80" y="${290 + TITLE_LINES.length * 78 + 30}" font-family="${font}" font-size="30" fill="${COLORS.graphite100}">${SUBTITLE}</text>
  <rect x="0" y="${H - 14}" width="${W}" height="14" fill="${COLORS.copper500}"/>
</svg>`;

await sharp(HERO_PHOTO)
  .resize(W, H, { fit: 'cover' })
  .composite([{ input: Buffer.from(overlay) }])
  .jpeg({ quality: 84, mozjpeg: true })
  .toFile('public/og-image.jpg');

console.log(
  'Oluşturuldu: src/app/icon.svg, src/app/apple-icon.png, public/icon-192.png, public/icon-512.png, public/og-image.jpg',
);
