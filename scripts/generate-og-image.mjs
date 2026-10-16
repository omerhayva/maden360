/**
 * Sosyal medya paylaşım görselini (public/og-image.png, 1200×630) üretir.
 * Kullanım: node scripts/generate-og-image.mjs
 *
 * Not: Metinler sistemdeki fontla çizilir (Linux'ta DejaVu Sans, Windows'ta Segoe UI).
 * Site adı veya sloganı değişirse bu betiği yeniden çalıştırın.
 */
import sharp from 'sharp';

const NAME_MAIN = 'Maden';
const NAME_ACCENT = '360';
const TITLE_LINES = ['Madenciliğin fuarı,', 'iş ilanları ve marketi'];
const SUBTITLE = 'Sanal fuar · İş ilanları · Market · Editör onaylı ilanlar';

const font = "'Segoe UI', 'DejaVu Sans', 'Helvetica Neue', Arial, sans-serif";

const contours = Array.from({ length: 9 }, (_, i) => {
  const y = 250 + i * 48;
  return `<path d="M-40 ${y} C 200 ${y - 70} 360 ${y + 60} 600 ${y - 10} S 980 ${y - 120} 1240 ${y - 40}" />`;
}).join('');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#14171a"/>
  <g fill="none" stroke="#2a2f36" stroke-width="2">${contours}</g>
  <g transform="translate(80 72) scale(2.25)">
    <rect width="32" height="32" rx="7" fill="#c96a2b"/>
    <path d="M5 21.5 11.5 13l5 6 4-4.5 6.5 7" fill="none" stroke="#14171a" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M5 25.5h22" stroke="#14171a" stroke-width="2.2" stroke-linecap="round" opacity="0.8"/>
  </g>
  <text x="170" y="122" font-family="${font}" font-size="44" font-weight="700" fill="#ffffff">${NAME_MAIN}<tspan fill="#df8446">${NAME_ACCENT}</tspan></text>
  ${TITLE_LINES.map(
    (line, i) =>
      `<text x="80" y="${290 + i * 78}" font-family="${font}" font-size="60" font-weight="700" fill="#ffffff">${line}</text>`,
  ).join('')}
  <text x="80" y="${290 + TITLE_LINES.length * 78 + 30}" font-family="${font}" font-size="30" fill="#b0b7c0">${SUBTITLE}</text>
  <rect x="0" y="606" width="1200" height="24" fill="#c96a2b"/>
</svg>`;

await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile('public/og-image.png');
console.log('public/og-image.png oluşturuldu.');
