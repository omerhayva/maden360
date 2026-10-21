import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { contrastRatio, hexToRgb, parseThemeColors, relativeLuminance } from '@/lib/color';

const root = process.cwd();
const theme = parseThemeColors(readFileSync(join(root, 'src/app/globals.css'), 'utf8'));
const STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

function color(name: string) {
  if (name === 'white') return hexToRgb('#ffffff');
  const hex = theme[name];
  if (!hex) throw new Error(`globals.css içinde --color-${name} tanımlı değil`);
  return hexToRgb(hex);
}

describe('renk paleti (globals.css → @theme)', () => {
  it.each(['graphite', 'copper', 'stone'])(
    '%s ölçeği eksiksiz ve açıktan koyuya sıralı',
    (scale) => {
      const luminances = STEPS.map((step) => relativeLuminance(color(`${scale}-${step}`)));
      for (let index = 1; index < luminances.length; index += 1) {
        expect(luminances[index]).toBeLessThan(luminances[index - 1] ?? 1);
      }
    },
  );

  /** [ön plan, arka plan, en az oran, kullanıldığı yer]: WCAG 2.2 AA */
  const pairs: [string, string, number, string][] = [
    // Metin (≥ 4,5:1)
    ['white', 'copper-700', 4.5, 'birincil düğme'],
    ['white', 'copper-800', 4.5, 'birincil düğme, üzerine gelince'],
    ['white', 'copper-900', 4.5, 'birincil düğme, basılıyken'],
    ['copper-700', 'white', 4.5, 'bağlantılar (beyaz panel)'],
    ['copper-700', 'stone-50', 4.5, 'bağlantılar (satır üzerine gelince)'],
    ['copper-700', 'stone-100', 4.5, 'bağlantılar (sayfa zemini)'],
    ['copper-700', 'copper-50', 4.5, 'fuar planı harfi, üzerine gelince'],
    ['copper-800', 'copper-50', 4.5, 'bakır rozet, hayalet düğme'],
    ['copper-800', 'copper-100', 4.5, 'bakır rozet, basılı'],
    ['graphite-950', 'stone-100', 4.5, 'gövde metni'],
    ['graphite-700', 'white', 4.5, 'üst menü, altbilgi bağlantıları'],
    ['graphite-700', 'stone-100', 4.5, 'açıklama metni'],
    ['graphite-600', 'white', 4.5, 'ikincil metin'],
    ['graphite-600', 'stone-50', 4.5, 'altbilgi alt şeridi'],
    ['graphite-600', 'stone-100', 4.5, 'ikincil metin (sayfa zemini)'],
    ['graphite-500', 'white', 4.5, 'küçük bilgi metni'],
    ['graphite-500', 'stone-50', 4.5, 'küçük bilgi metni (açık zemin)'],
    ['graphite-500', 'stone-100', 4.5, 'küçük bilgi metni (sayfa zemini)'],
    ['copper-300', 'graphite-900', 4.5, 'fuar planı: bulunulan salonun harfi'],
    ['graphite-100', 'graphite-900', 4.5, 'fuar planı: "Buradasınız" notu'],
    // Arayüz sınırları (WCAG 1.4.11, ≥ 3:1)
    ['graphite-500', 'white', 3, 'form alanı kenarlığı'],
    ['graphite-500', 'stone-50', 3, 'form alanı kenarlığı (açık zemin)'],
    ['graphite-400', 'white', 3, 'ikincil düğme ve çip kenarlığı'],
    // Odak çerçevesi (≥ 3:1)
    ['copper-700', 'white', 3, 'odak çerçevesi'],
    ['copper-700', 'stone-100', 3, 'odak çerçevesi (sayfa zemini)'],
    ['copper-700', 'stone-200', 3, 'odak çerçevesi (ayırıcı çizgi üzerinde)'],
    ['copper-300', 'graphite-950', 3, 'odak çerçevesi (fotoğraflı başlık)'],
    // Logo ve simgeler
    ['copper-700', 'white', 3, 'logo işareti (beyaz üst bilgi)'],
    ['white', 'copper-700', 3, 'tarayıcı ve uygulama simgesi'],
  ];

  it.each(pairs)('%s / %s ≥ %s:1 (%s)', (foreground, background, minimum) => {
    expect(contrastRatio(color(foreground), color(background))).toBeGreaterThanOrEqual(minimum);
  });

  it('zemin krem değil, soğuk gri: stone ölçeğinde mavi kanal kırmızıdan düşük değil', () => {
    for (const step of [50, 100, 200, 300]) {
      const [r, , b] = color(`stone-${step}`);
      expect(b, `stone-${step}`).toBeGreaterThanOrEqual(r);
    }
  });

  it('elle yazılmış marka renkleri paletle aynı (logo, simgeler, tema rengi, hata ekranı)', () => {
    const files = [
      'src/components/brand/Logo.tsx',
      'src/app/icon.svg',
      'src/app/layout.tsx',
      'src/app/manifest.ts',
      'src/app/global-error.tsx',
      'scripts/generate-brand-assets.mjs',
    ];
    const allowed = new Set([...Object.values(theme), '#ffffff']);
    const offenders = files.flatMap((file) =>
      [...readFileSync(join(root, file), 'utf8').matchAll(/#[0-9a-f]{6}\b/gi)]
        .map((match) => match[0].toLowerCase())
        .filter((hex) => !allowed.has(hex))
        .map((hex) => `${file}: ${hex}`),
    );
    expect(offenders).toEqual([]);
  });
});
