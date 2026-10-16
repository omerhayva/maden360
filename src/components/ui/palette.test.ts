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

  /** [ön plan, arka plan, en az oran, kullanıldığı yer] — WCAG 2.2 AA */
  const pairs: [string, string, number, string][] = [
    ['white', 'copper-600', 4.5, 'birincil düğme'],
    ['white', 'copper-700', 4.5, 'birincil düğme, üzerine gelince'],
    ['white', 'copper-800', 4.5, 'birincil düğme, basılıyken'],
    ['copper-700', 'white', 4.5, 'bağlantılar (beyaz kart)'],
    ['copper-700', 'stone-50', 4.5, 'bağlantılar (taş kart)'],
    ['copper-700', 'stone-100', 4.5, 'bağlantılar (sayfa zemini)'],
    ['copper-800', 'copper-50', 4.5, 'bakır rozet, hayalet düğme'],
    ['copper-800', 'copper-100', 4.5, 'bakır rozet, basılı'],
    ['copper-400', 'graphite-950', 4.5, 'koyu zeminde vurgu (logo, menü)'],
    ['copper-400', 'graphite-900', 4.5, 'simge kutusu'],
    ['graphite-950', 'stone-100', 4.5, 'gövde metni'],
    ['graphite-700', 'stone-100', 4.5, 'açıklama metni'],
    ['graphite-600', 'white', 4.5, 'ikincil metin (kart)'],
    ['graphite-600', 'stone-100', 4.5, 'ikincil metin (sayfa zemini)'],
    ['graphite-500', 'white', 4.5, 'küçük bilgi metni (kart)'],
    ['graphite-500', 'stone-50', 4.5, 'küçük bilgi metni (taş kart)'],
    ['graphite-500', 'stone-100', 4.5, 'küçük bilgi metni (sayfa zemini)'],
    ['graphite-200', 'graphite-950', 4.5, 'üst menü bağlantıları'],
    ['graphite-300', 'graphite-950', 4.5, 'altbilgi metni'],
    ['graphite-400', 'graphite-950', 4.5, 'altbilgi küçük metni'],
    ['graphite-300', 'graphite-900', 4.5, 'koyu kart metni'],
    ['copper-500', 'white', 3, 'odak çerçevesi (beyaz)'],
    ['copper-500', 'stone-100', 3, 'odak çerçevesi (sayfa zemini)'],
    ['copper-500', 'graphite-950', 3, 'odak çerçevesi (koyu zemin)'],
    ['graphite-950', 'copper-500', 3, 'logo işareti'],
  ];

  it.each(pairs)('%s / %s ≥ %s:1 — %s', (foreground, background, minimum) => {
    expect(contrastRatio(color(foreground), color(background))).toBeGreaterThanOrEqual(minimum);
  });

  it('kontur deseninin çizgisi üzerinde de altbilgi ve koyu bölüm metinleri ≥ 4,5:1', () => {
    const css = readFileSync(join(root, 'src/app/globals.css'), 'utf8');
    const stroke = /\.contour-bg\s*\{[^}]*stroke='%23([0-9a-f]{6})'/i.exec(css)?.[1];
    expect(stroke, '.contour-bg çizgi rengi bulunamadı').toBeTruthy();
    const line = hexToRgb(`#${stroke}`);
    for (const text of ['graphite-300', 'graphite-400', 'copper-400', 'white']) {
      expect(contrastRatio(color(text), line), text).toBeGreaterThanOrEqual(4.5);
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
